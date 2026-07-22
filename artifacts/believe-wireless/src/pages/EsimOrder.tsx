import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Smartphone,
  QrCode,
  Copy,
  ChevronLeft,
  RefreshCw,
  Download,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface EsimDetail {
  iccid?: string;
  activationCode?: string;
  qrCodeUrl?: string;
  lpaString?: string;
  status?: string;
}

interface Order {
  id: string;
  status: string;
  productId: number;
  quantity: number;
  referenceCode: string;
  createdAt?: string;
  esims?: EsimDetail[];
}

// ── Android install steps ─────────────────────────────────────────────────────

const ANDROID_STEPS = [
  {
    step: "1",
    title: "Open Settings",
    desc: 'On your Android phone, open the Settings app.',
  },
  {
    step: "2",
    title: "Go to Network & Internet",
    desc: 'Tap "Network & internet" or "Connections" (varies by manufacturer).',
  },
  {
    step: "3",
    title: "Add eSIM",
    desc: 'Tap "SIMs" or "Mobile networks", then tap "Add SIM" or "Download a SIM".',
  },
  {
    step: "4",
    title: "Scan QR Code",
    desc: 'Choose "Scan a QR code" and point your camera at the QR code shown above.',
  },
  {
    step: "5",
    title: "Confirm & Activate",
    desc: 'Follow the on-screen prompts to confirm installation. Your eSIM will activate automatically.',
  },
];

// ── Status helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "completed" || s === "fulfilled") {
    return (
      <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4" /> Ready to Install
      </div>
    );
  }
  if (s === "processing" || s === "pending") {
    return (
      <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold text-sm">
        <Clock className="w-4 h-4" /> {s.charAt(0).toUpperCase() + s.slice(1)}...
      </div>
    );
  }
  if (s === "failed" || s === "error") {
    return (
      <div className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold text-sm">
        ✕ {status}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-semibold text-sm">
      <Loader2 className="w-4 h-4 animate-spin" /> {status}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EsimOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/esim/orders/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      const data: Order = await res.json();
      setOrder(data);
      return data;
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }, [orderId]);

  // Initial load
  useEffect(() => {
    fetchOrder().finally(() => setLoading(false));
  }, [fetchOrder]);

  // Auto-poll while pending/processing
  useEffect(() => {
    if (!order) return;
    const s = order.status.toLowerCase();
    if (s === "pending" || s === "processing") {
      const interval = setInterval(async () => {
        const updated = await fetchOrder();
        if (!updated) return;
        const us = updated.status.toLowerCase();
        if (us !== "pending" && us !== "processing") {
          clearInterval(interval);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [order, fetchOrder]);

  const handleManualRefresh = async () => {
    setPolling(true);
    await fetchOrder();
    setPolling(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!`, description: text.slice(0, 40) + "..." });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
          <Skeleton className="h-12 w-64 rounded-2xl" />
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="text-center py-32">
          <p className="text-red-500 font-semibold">{error ?? "Order not found"}</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/esim">← Browse eSIM Plans</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const esim = order.esims?.[0];
  const isReady =
    order.status.toLowerCase() === "completed" ||
    order.status.toLowerCase() === "fulfilled";
  const isPending =
    order.status.toLowerCase() === "pending" ||
    order.status.toLowerCase() === "processing";

  // Build QR image URL using qrserver.com (no library needed)
  const lpaString = esim?.lpaString ?? esim?.activationCode;
  const qrImageUrl = lpaString
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(lpaString)}&bgcolor=ffffff&color=000000&qzone=2`
    : null;

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          {/* Back */}
          <Link href="/esim">
            <button className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm font-medium mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Browse Plans
            </button>
          </Link>

          {/* Order header */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Your eSIM Order</h1>
                <p className="text-sm text-gray-400 font-mono">#{order.id}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Pending / processing state */}
            {isPending && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                </div>
                <p className="text-gray-700 font-semibold mb-2">Preparing your eSIM…</p>
                <p className="text-gray-400 text-sm mb-6">
                  This usually takes under a minute. This page refreshes automatically.
                </p>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleManualRefresh}
                  disabled={polling}
                >
                  {polling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Refresh Status
                </Button>
              </div>
            )}

            {/* Ready state — show QR */}
            {isReady && (
              <div>
                {qrImageUrl ? (
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-3xl border-2 border-primary shadow-lg mb-4">
                      <img
                        src={qrImageUrl}
                        alt="eSIM QR Code"
                        className="w-64 h-64 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Scan this QR code with your Android phone to install your eSIM
                    </p>
                    <div className="flex justify-center gap-3">
                      {lpaString && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => copyToClipboard(lpaString, "Activation code")}
                        >
                          <Copy className="w-4 h-4 mr-2" /> Copy Activation Code
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        asChild
                      >
                        <a href={qrImageUrl} download="esim-qr.png">
                          <Download className="w-4 h-4 mr-2" /> Save QR Code
                        </a>
                      </Button>
                    </div>

                    {/* eSIM details */}
                    {esim?.iccid && (
                      <div className="mt-6 bg-gray-50 rounded-2xl p-4 text-left space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">eSIM Details</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">ICCID</span>
                          <button
                            className="text-sm font-mono text-gray-800 hover:text-primary flex items-center gap-1"
                            onClick={() => copyToClipboard(esim.iccid!, "ICCID")}
                          >
                            {esim.iccid} <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <QrCode className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p>eSIM data is ready — activation code will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Android Install Guide */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              Install on Android
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Follow these steps to install your eSIM on any compatible Android device.
            </p>

            <div className="space-y-4">
              {ANDROID_STEPS.map((s) => (
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

            {/* Deep-link button for Android */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Smartphone className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 mb-1">On Android? Open settings directly</p>
                  <p className="text-sm text-green-700 mb-3">
                    Tap the button below to jump directly to the eSIM settings on your Android device.
                  </p>
                  <Button
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      // Android intent deep link to eSIM settings
                      window.location.href = "intent://settings/network#Intent;scheme=android-app;package=com.android.settings;end";
                    }}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Open Android eSIM Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Compatibility note */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
              <strong>Compatibility:</strong> Your device must support eSIM and be unlocked. Most Android phones from 2019 onwards support eSIM. Check your device specs if unsure.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
