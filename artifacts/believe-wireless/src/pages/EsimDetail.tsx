import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wifi,
  Zap,
  Globe,
  ChevronLeft,
  Signal,
  CheckCircle2,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// ── Types ────────────────────────────────────────────────────────────────────
interface Network {
  name: string;
  brandName: string;
  speeds: string[];
}

interface Country {
  name: string;
  iso: string;
  region: string;
  ensignUrl: string;
  networks?: Network[];
}

interface Zone {
  name: string;
  iso: string;
  region: string;
  ensignUrl: string;
}

interface Bundle {
  id: number;
  title: string;
  description: string;
  data: string;
  duration: string;
  unlimited: boolean;
  price: number;
  currencyCode: string;
  currencySymbol: string;
  throttled: boolean;
  supportRoaming: boolean;
  autostart: boolean;
  speeds: string[] | null;
  zone: Zone;
  roamingCountries: Country[];
}

// ── Speed badge colors ────────────────────────────────────────────────────────
const speedColors: Record<string, string> = {
  "5G": "bg-purple-100 text-purple-700",
  "4G": "bg-blue-100 text-blue-700",
  "3G": "bg-green-100 text-green-700",
  "2G": "bg-gray-100 text-gray-600",
};

export default function EsimDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/esim/catalogue/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Plan not found");
        return r.json();
      })
      .then(setBundle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!bundle) return;
    setOrdering(true);
    try {
      const res = await fetch("/api/esim/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: bundle.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Order failed");
      const order = await res.json();
      toast({
        title: "Order placed!",
        description: `Preparing your eSIM — Transaction #${order.id}`,
      });
      setLocation(`/esim/order/${order.id}`);
    } catch {
      toast({
        title: "Order failed",
        description: "Could not place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
          <Skeleton className="h-12 w-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  if (error || !bundle) {
    return (
      <MainLayout>
        <div className="text-center py-32">
          <p className="text-red-500 font-semibold">{error ?? "Plan not found"}</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/esim">← Back to plans</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Aggregate all unique speeds across countries
  const allSpeeds = Array.from(
    new Set(
      bundle.roamingCountries.flatMap((c) =>
        (c.networks ?? []).flatMap((n) => n.speeds)
      )
    )
  ).sort((a, b) => {
    const order = ["5G", "4G", "3G", "2G"];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Back */}
          <Link href="/esim">
            <button className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-sm font-medium mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              All eSIM Plans
            </button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src={bundle.zone.ensignUrl}
                    alt={bundle.zone.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg"; }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {bundle.zone.region}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">{bundle.zone.name}</h1>
                    <p className="text-gray-500 mt-1">{bundle.description}</p>
                  </div>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary/5 rounded-2xl p-4 text-center">
                    <Wifi className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{bundle.data}</p>
                    <p className="text-xs text-gray-400 font-medium">Data</p>
                  </div>
                  <div className="bg-primary/5 rounded-2xl p-4 text-center">
                    <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{bundle.duration}</p>
                    <p className="text-xs text-gray-400 font-medium">Validity</p>
                  </div>
                  <div className="bg-primary/5 rounded-2xl p-4 text-center">
                    <Globe className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{bundle.roamingCountries.length}</p>
                    <p className="text-xs text-gray-400 font-medium">Countries</p>
                  </div>
                </div>

                {/* Network speeds */}
                {allSpeeds.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <Signal className="w-4 h-4 text-gray-400" />
                    {allSpeeds.map((s) => (
                      <span key={s} className={`text-xs font-bold px-2 py-0.5 rounded-full ${speedColors[s] ?? "bg-gray-100 text-gray-600"}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Features */}
                <ul className="mt-6 space-y-2">
                  {bundle.supportRoaming && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      Roaming supported across all listed countries
                    </li>
                  )}
                  {bundle.autostart && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      Auto-activates when you arrive in a supported country
                    </li>
                  )}
                  {!bundle.throttled && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      No speed throttling
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    Instant eSIM delivery — scan QR code to install
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    Compatible with all eSIM-enabled Android &amp; iOS devices
                  </li>
                </ul>
              </div>

              {/* Coverage list */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Coverage — {bundle.roamingCountries.length} Countries
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {bundle.roamingCountries.map((country) => (
                    <div key={country.iso} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                      <img
                        src={country.ensignUrl}
                        alt={country.name}
                        className="w-8 h-5 object-cover rounded-sm border border-gray-200 mt-0.5 shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{country.name}</p>
                        {country.networks && country.networks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {country.networks.map((n) => (
                              <div key={n.name} className="flex items-center gap-1">
                                <span className="text-xs text-gray-400 truncate max-w-[120px]">{n.brandName}</span>
                                <div className="flex gap-0.5">
                                  {n.speeds.map((s) => (
                                    <span key={s} className={`text-[10px] font-bold px-1 rounded ${speedColors[s] ?? "bg-gray-100 text-gray-500"}`}>
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Buy box */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 border-2 border-primary shadow-xl shadow-primary/10 sticky top-8">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total</p>
                <div className="text-5xl font-bold text-gray-900 mb-1">
                  {bundle.currencySymbol}{bundle.price.toFixed(2)}
                </div>
                <p className="text-sm text-gray-400 mb-6">{bundle.currencyCode} · One-time</p>

                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Data</span>
                    <span className="font-semibold text-gray-900">{bundle.data}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validity</span>
                    <span className="font-semibold text-gray-900">{bundle.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Countries</span>
                    <span className="font-semibold text-gray-900">{bundle.roamingCountries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold text-green-600">Instant QR Code</span>
                  </div>
                </div>

                <Button
                  className="w-full h-14 rounded-full font-bold text-lg shadow-lg shadow-primary/25"
                  onClick={handleBuy}
                  disabled={ordering}
                >
                  {ordering ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5 mr-2" /> Buy eSIM Now</>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  eSIM delivered instantly after purchase. No physical SIM required.
                </p>

                {/* Android install tip */}
                <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-green-700 mb-1">📱 Android Install</p>
                  <p className="text-xs text-green-700">
                    After purchase, scan the QR code from <strong>Settings → Network → SIM → Add eSIM</strong> or use our in-app installer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
