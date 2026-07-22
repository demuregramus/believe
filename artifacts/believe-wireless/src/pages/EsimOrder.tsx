import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Smartphone,
  Copy,
  ChevronLeft,
  RefreshCw,
  Download,
  Wifi,
  Apple,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EsimBundle {
  id: number;
  title: string;
  dataAmount: string;
  duration: string;
  remainingQuantity: number;
  initialQuantity: number;
  expired: boolean;
  expiryTime: string | null;
}

interface Esim {
  iccid: string;
  installed: boolean;
  smdpAddress: string;
  smdpStatus: string;
  activationCode: string;
  coverage: string;
  topUp: boolean;
  status: string;
  installationTime: string | null;
  expiryTime: string | null;
  bundles: EsimBundle[];
  lpaString: string; // LPA:1$smdpAddress$activationCode — used for QR
}

interface Transaction {
  id: number;
  productTitle: string;
  dataAmount: string;
  duration: string;
  zone: string;
  region: string;
  unitPrice: number;
  currency: string;
  /** PENDING | PROCESSING | SUCCESSFUL | REFUNDED | FAILED */
  status: string;
  createdAt: string;
  balanceResponse: {
    newBalance: number;
    currencyCode: string;
  };
}

// ── Device Install Steps ─────────────────────────────────────────────────────

const IOS_STEPS = [
  { step: "1", title: "Open Settings", desc: "On your iPhone, open the Settings app." },
  { step: "2", title: "Go to Cellular / Mobile Data", desc: 'Tap "Cellular" (or "Mobile Data" depending on your country).' },
  { step: "3", title: "Add eSIM", desc: 'Tap "Add eSIM" or "Add Cellular Plan".' },
  { step: "4", title: "Scan QR or Enter Manually", desc: 'Select "Use QR Code" and scan the QR below. Or tap "Enter Details Manually" and paste the SM-DP+ Address & Activation Code.' },
  { step: "5", title: "Label & Confirm", desc: "Label your new cellular line (e.g., Believe Wireless) and complete setup." },
];

const ANDROID_STEPS = [
  { step: "1", title: "Open Settings", desc: "On your Android phone, open the Settings app." },
  { step: "2", title: "Go to Network & Internet", desc: 'Tap "Network & internet" or "Connections" depending on manufacturer.' },
  { step: "3", title: "Add eSIM", desc: 'Tap "SIMs" → "Add SIM" or "Download a SIM instead".' },
  { step: "4", title: "Scan QR Code", desc: 'Choose "Scan a QR code" and point your camera at the QR below.' },
  { step: "5", title: "Confirm & Activate", desc: "Follow on-screen prompts. Your eSIM activates automatically on first network connection." },
];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "SUCCESSFUL") {
    return (
      <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4" /> Ready to Install
      </span>
    );
  }
  if (s === "PROCESSING" || s === "PENDING") {
    return (
      <span className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold text-sm">
        <Clock className="w-4 h-4" /> {s.charAt(0) + s.slice(1).toLowerCase()}…
      </span>
    );
  }
  if (s === "FAILED" || s === "REFUNDED") {
    return (
      <span className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold text-sm">
        ✕ {s.charAt(0) + s.slice(1).toLowerCase()}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-semibold text-sm">
      <Loader2 className="w-4 h-4 animate-spin" /> {status}
    </span>
  );
}

// ── Data bar ──────────────────────────────────────────────────────────────────

function DataBar({ initial, remaining }: { initial: number; remaining: number }) {
  const pct = initial > 0 ? Math.round((remaining / initial) * 100) : 0;
  const usedGB = ((initial - remaining) / 1e9).toFixed(2);
  const totalGB = (initial / 1e9).toFixed(2);
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{usedGB} GB used</span>
        <span>{totalGB} GB total</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${100 - pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct}% remaining</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EsimOrder() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { toast } = useToast();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [esims, setEsims] = useState<Esim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<"ios" | "android">(() => {
    if (typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      return "ios";
    }
    return "ios";
  });


  const fetchTransaction = useCallback(async (): Promise<Transaction | null> => {
    if (!transactionId) return null;
    const res = await fetch(`/api/esim/transactions/${transactionId}`);
    if (!res.ok) throw new Error("Transaction not found");
    const ct = res.headers.get("content-type");
    if (!ct || !ct.includes("application/json")) throw new Error("Invalid server response");
    return res.json();
  }, [transactionId]);

  const fetchEsims = useCallback(async () => {
    if (!transactionId) return;
    try {
      const res = await fetch(`/api/esim/transactions/${transactionId}/esims`);
      if (res.ok) {
        const ct = res.headers.get("content-type");
        if (ct && ct.includes("application/json")) {
          const data: Esim[] = await res.json();
          setEsims(data);
        }
      }
    } catch {
      // eSIMs not ready yet — will retry on next poll
    }
  }, [transactionId]);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const tx = await fetchTransaction();
        setTransaction(tx);
        if (tx?.status.toUpperCase() === "SUCCESSFUL") {
          await fetchEsims();
        }
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchTransaction, fetchEsims]);

  // Auto-poll every 5 seconds while PENDING/PROCESSING
  useEffect(() => {
    if (!transaction) return;
    const s = transaction.status.toUpperCase();
    if (s !== "PENDING" && s !== "PROCESSING") return;

    const interval = setInterval(async () => {
      try {
        const tx = await fetchTransaction();
        setTransaction(tx);
        if (tx?.status.toUpperCase() === "SUCCESSFUL") {
          await fetchEsims();
          clearInterval(interval);
        }
      } catch { /* ignore polling errors */ }
    }, 5000);

    return () => clearInterval(interval);
  }, [transaction, fetchTransaction, fetchEsims]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const tx = await fetchTransaction();
      setTransaction(tx);
      if (tx?.status.toUpperCase() === "SUCCESSFUL") {
        await fetchEsims();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!` });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
          <Skeleton className="h-12 w-64 rounded-2xl" />
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  if (error || !transaction) {
    return (
      <MainLayout>
        <div className="text-center py-32">
          <p className="text-red-500 font-semibold">{error ?? "Transaction not found"}</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/esim">← Browse eSIM Plans</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isSuccessful = transaction.status.toUpperCase() === "SUCCESSFUL";
  const isPending =
    transaction.status.toUpperCase() === "PENDING" ||
    transaction.status.toUpperCase() === "PROCESSING";
  const esim = esims[0];

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

          {/* Back */}
          <Link href="/esim">
            <button className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm font-medium mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Browse Plans
            </button>
          </Link>

          {/* Order card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Your eSIM Order</h1>
                <p className="text-sm text-gray-400">
                  {transaction.productTitle} · Transaction #{transaction.id}
                </p>
              </div>
              <StatusBadge status={transaction.status} />
            </div>

            {/* Plan summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-2xl p-3 text-center">
                <p className="font-bold text-gray-900">{transaction.dataAmount}</p>
                <p className="text-xs text-gray-400">Data</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 text-center">
                <p className="font-bold text-gray-900">{transaction.duration}</p>
                <p className="text-xs text-gray-400">Validity</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 text-center">
                <p className="font-bold text-gray-900">${transaction.unitPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{transaction.currency}</p>
              </div>
            </div>

            {/* Pending / Processing */}
            {isPending && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                </div>
                <p className="font-semibold text-gray-700 mb-2">Preparing your eSIM…</p>
                <p className="text-sm text-gray-400 mb-6">
                  Usually takes under a minute. This page auto-refreshes.
                </p>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing
                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    : <RefreshCw className="w-4 h-4 mr-2" />}
                  Refresh Status
                </Button>
              </div>
            )}

            {/* Successful — show QR + details */}
            {isSuccessful && esim && (
              <div>
                {/* iPhone 1-Click Installer Box */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-3xl p-6 mb-8 shadow-xl border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Apple className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">iPhone 1-Click Direct Carrier Profile</h3>
                      <p className="text-xs text-gray-300">Permanent fix: Download profile directly to iPhone without QR scanning errors</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <Button
                      size="lg"
                      className="rounded-full font-bold bg-emerald-500 text-white hover:bg-emerald-600 h-12 text-sm shadow-md"
                      asChild
                    >
                      <a href="/api/esim/apple-config/98124" download="believe-wireless.mobileconfig">
                        <Download className="w-4 h-4 mr-2" /> Install iPhone Profile (1-Click)
                      </a>
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-full font-bold bg-white text-gray-900 hover:bg-gray-100 h-12 text-sm shadow-md"
                      onClick={() => copy(esim.lpaString, "iPhone Activation Code")}
                    >
                      <Copy className="w-4 h-4 mr-2 text-primary" /> Copy Manual LPA Code
                    </Button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-300 space-y-1">
                    <p>💡 <strong>Direct iPhone Installation:</strong> Tap <strong>Install iPhone Profile</strong> above → Tap <strong>Allow</strong> → Open iPhone <strong>Settings → Profile Downloaded → Install</strong>.</p>
                  </div>
                </div>

                {/* iPhone Unlock & Activation Troubleshooting Guide */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-900">
                  <p className="font-bold text-sm mb-1 text-amber-950 flex items-center gap-1.5">
                    ⚠️ Fix "Unable to Activate eSIM" Errors Permanently
                  </p>
                  <ul className="space-y-1 list-disc pl-4 text-amber-800">
                    <li><strong>Check Carrier Lock:</strong> On your iPhone, go to <strong>Settings → General → About</strong> and confirm <strong>Carrier Lock</strong> displays <em>"No SIM restrictions"</em>.</li>
                    <li><strong>Wi-Fi Connection:</strong> Ensure your iPhone is connected to an active Wi-Fi network during activation.</li>
                    <li><strong>Manual Entry Option:</strong> If camera scanning fails, tap <strong>Add Cellular Plan → Enter Details Manually</strong> and paste <code>cust-sub.limitflex.com</code> as SM-DP+ Address.</li>
                  </ul>
                </div>

                {/* QR Code */}
                <div className="text-center mb-6">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Scan to Install eSIM (iPhone & Android Camera)
                  </p>
                  <div className="inline-block p-4 bg-white rounded-3xl border-2 border-primary shadow-lg mb-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(esim.lpaString)}&bgcolor=ffffff&color=000000&qzone=2`}
                      alt="eSIM QR Code"
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Scan this QR code using your iPhone Camera app or Settings → Cellular → Add eSIM
                  </p>


                  <div className="flex justify-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => copy(esim.lpaString, "LPA String")}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy LPA String
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      asChild
                    >
                      <a
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(esim.lpaString)}&bgcolor=ffffff&color=000000&qzone=2`}
                        download="esim-qr.png"
                      >
                        <Download className="w-4 h-4 mr-2" /> Save QR Code
                      </a>
                    </Button>
                  </div>
                </div>

                {/* eSIM details */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">eSIM Details & Manual Entry</p>
                  {[
                    { label: "ICCID", value: esim.iccid },
                    { label: "Coverage", value: esim.coverage },
                    { label: "SM-DP+ Address", value: esim.smdpAddress },
                    { label: "Activation Code", value: esim.activationCode },
                    { label: "Status", value: esim.smdpStatus },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{label}</span>
                      <button
                        className="text-sm font-mono text-gray-800 hover:text-primary flex items-center gap-1 text-right max-w-[220px] truncate"
                        onClick={() => copy(value, label)}
                      >
                        <span className="truncate">{value}</span>
                        <Copy className="w-3 h-3 shrink-0" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Data usage */}
                {esim.bundles.length > 0 && (
                  <div className="mt-4 bg-primary/5 rounded-2xl p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-primary" /> Data Usage
                    </p>
                    {esim.bundles.map((b) => (
                      <div key={b.id}>
                        <p className="text-sm font-semibold text-gray-700 mb-2">{b.title}</p>
                        {b.initialQuantity > 0 ? (
                          <DataBar initial={b.initialQuantity} remaining={b.remainingQuantity} />
                        ) : (
                          <p className="text-sm text-green-600 font-semibold">Unlimited</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Successful but esims not loaded yet */}
            {isSuccessful && esims.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading eSIM details…</p>
              </div>
            )}
          </div>

          {/* Installation Guide Tabs */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Installation Guide
              </h2>
              {/* Tab Selector */}
              <div className="flex bg-gray-100 p-1 rounded-full text-xs font-semibold">
                <button
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                    selectedDevice === "ios"
                      ? "bg-white text-gray-900 shadow-sm font-bold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedDevice("ios")}
                >
                  <Apple className="w-4 h-4" /> iPhone (iOS)
                </button>
                <button
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                    selectedDevice === "android"
                      ? "bg-white text-gray-900 shadow-sm font-bold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedDevice("android")}
                >
                  <Smartphone className="w-4 h-4 text-green-600" /> Android
                </button>
              </div>
            </div>

            {/* iPhone Guide */}
            {selectedDevice === "ios" && (
              <div>
                <p className="text-sm text-gray-400 mb-6">
                  Follow these steps on any eSIM-compatible iPhone (iPhone XS, 11, 12, 13, 14, 15, 16 & newer).
                </p>

                <div className="space-y-4 mb-8">
                  {IOS_STEPS.map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {s.step}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{s.title}</p>
                        <p className="text-sm text-gray-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* iPhone Deep Link */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-4">
                  <p className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Apple className="w-4 h-4" /> Already browsing on your iPhone?
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Open iPhone Cellular settings directly or scan the QR code above using your iPhone camera app.
                  </p>
                  <Button
                    className="rounded-full bg-gray-900 hover:bg-black text-white"
                    onClick={() => {
                      window.location.href = "App-Prefs:root=MOBILE_DATA_SETTINGS_ID";
                    }}
                  >
                    <Apple className="w-4 h-4 mr-2" />
                    Open iPhone Cellular Settings
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
                  <strong>iPhone Compatibility:</strong> All iPhones from iPhone XS / XR (2018) onwards support eSIM. iPhone 14, 15, and 16 models in the US are eSIM-only.
                </div>
              </div>
            )}

            {/* Android Guide */}
            {selectedDevice === "android" && (
              <div>
                <p className="text-sm text-gray-400 mb-6">
                  Follow these steps on any eSIM-compatible Android device (Samsung, Google Pixel, Motorola, Xiaomi, etc.).
                </p>

                <div className="space-y-4 mb-8">
                  {ANDROID_STEPS.map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {s.step}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{s.title}</p>
                        <p className="text-sm text-gray-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Android Deep Link */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
                  <p className="font-semibold text-green-800 mb-1 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Already on your Android device?
                  </p>
                  <p className="text-sm text-green-700 mb-3">
                    Tap below to jump directly to your Android eSIM settings.
                  </p>
                  <Button
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      window.location.href =
                        "intent://settings/network#Intent;scheme=android-app;package=com.android.settings;end";
                    }}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Open Android eSIM Settings
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
                  <strong>Android Compatibility:</strong> Your device must support eSIM and be SIM-unlocked.
                  Most Android phones from 2019 onwards include eSIM support.
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </MainLayout>
  );
}
