import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Globe,
  Wifi,
  Zap,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "wouter";

// ── Types ────────────────────────────────────────────────────────────────────

interface EsimZone {
  name: string;
  iso: string;
  region: string;
  ensignUrl: string;
}

interface EsimCountry {
  name: string;
  iso: string;
  ensignUrl: string;
  popularDestination?: boolean;
}

interface EsimBundle {
  id: number;
  title: string;
  data: string;
  duration: string;
  unlimited: boolean;
  price: number;
  currencySymbol: string;
  currencyCode: string;
  supportRoaming: boolean;
  zone: EsimZone;
  roamingCountries: EsimCountry[];
}

interface CatalogueResponse {
  content: EsimBundle[];
  totalPages: number;
  totalElements: number;
  number: number;
  last: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const REGIONS = [
  "All",
  "Africa",
  "Asia",
  "Caribbean",
  "Europe",
  "Global",
  "Latin America",
  "Middle East",
  "North America",
  "Oceania",
];

// ── Helper ───────────────────────────────────────────────────────────────────

async function fetchCatalogue(params: {
  region?: string;
  countriesIso?: string;
  page: number;
  pageSize: number;
}): Promise<CatalogueResponse> {
  const qs = new URLSearchParams();
  if (params.region && params.region !== "All") qs.set("region", params.region);
  if (params.countriesIso) qs.set("countriesIso", params.countriesIso);
  qs.set("page", String(params.page));
  qs.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/esim/catalogue?${qs}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Server returned status ${res.status}`);
  }
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server returned HTML response instead of JSON. Ensure Express API server is running.");
  }
  return res.json();
}


// ── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ bundle }: { bundle: EsimBundle }) {
  const topCountries = bundle.roamingCountries.slice(0, 5);
  const extra = bundle.roamingCountries.length - 5;

  return (
    <Link href={`/esim/${bundle.id}`}>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col h-full">
        {/* Zone flag + name */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={bundle.zone.ensignUrl}
            alt={bundle.zone.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://flagcdn.com/un.svg";
            }}
          />
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {bundle.zone.region}
            </p>
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {bundle.zone.name}
            </h3>
          </div>
        </div>

        {/* Data + Duration */}
        <div className="flex gap-2 mb-4">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary font-bold text-sm px-3 py-1"
          >
            <Wifi className="w-3.5 h-3.5 mr-1" />
            {bundle.data}
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-semibold text-sm px-3 py-1">
            {bundle.duration}
          </Badge>
          {bundle.unlimited && (
            <Badge className="bg-green-100 text-green-700 font-semibold text-sm px-3 py-1 border-0">
              <Zap className="w-3.5 h-3.5 mr-1" /> Unlimited
            </Badge>
          )}
        </div>

        {/* Country flags */}
        {bundle.roamingCountries.length > 0 && (
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {topCountries.map((c) => (
              <img
                key={c.iso}
                src={c.ensignUrl}
                alt={c.name}
                title={c.name}
                className="w-6 h-4 object-cover rounded-sm border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ))}
            {extra > 0 && (
              <span className="text-xs text-gray-400 font-medium">
                +{extra} more
              </span>
            )}
          </div>
        )}

        <div className="flex-grow" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
          <div>
            <span className="text-2xl font-bold text-emerald-600">
              $0.00
            </span>
            <span className="text-xs text-emerald-700 font-semibold block">
              Free with Plan
            </span>
          </div>
          <div className="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
            Get Free eSIM
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EsimCatalogue() {
  const [region, setRegion] = useState("All");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryIso, setCountryIso] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CatalogueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCatalogue({ region, countriesIso: countryIso || undefined, page, pageSize: 18 })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [region, countryIso, page]);

  const handleCountrySearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert country name to ISO code is complex; use the raw input as ISO if 2 chars, else clear
    const val = countrySearch.trim().toUpperCase();
    if (val.length === 2) {
      setCountryIso(val);
      setPage(1);
    } else if (val === "") {
      setCountryIso("");
      setPage(1);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/5 via-white to-primary/10 border-b border-gray-100 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <Zap className="w-4 h-4 text-emerald-600" />
              100% Included with Every Believe Wireless Plan ($0.00 Extra)
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              All-In-One <span className="text-primary">eSIM Activation.</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              You do <strong>NOT</strong> need to buy a separate eSIM package. Every Believe Wireless plan includes your phone number, 5G data, and eSIM QR code all in one single service.
            </p>
            <div className="inline-flex items-center gap-3 bg-white p-2 px-4 rounded-full border border-gray-200 shadow-sm text-xs font-semibold text-gray-700">
              <span>✅ iPhone &amp; Android Ready</span>
              <span>•</span>
              <span>✅ 1-Tap QR Installation</span>
              <span>•</span>
              <span>✅ $0 Extra Activation Fee</span>
            </div>
          </div>
        </div>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Region tabs */}
            <div className="flex gap-2 flex-wrap">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRegion(r); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    region === r
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Country ISO search */}
            <form onSubmit={handleCountrySearch} className="flex gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="Country ISO (e.g. US)"
                  maxLength={2}
                  className="pl-9 w-44 rounded-full border-gray-200"
                />
              </div>
              <Button type="submit" size="sm" className="rounded-full px-5">
                <SlidersHorizontal className="w-4 h-4 mr-1" /> Filter
              </Button>
              {countryIso && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => { setCountryIso(""); setCountrySearch(""); setPage(1); }}
                >
                  Clear
                </Button>
              )}
            </form>
          </div>

          {/* Results */}
          {error ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
              <p className="text-red-500 font-semibold">{error}</p>
              <p className="text-gray-400 text-sm mt-2">
                Make sure your LimitFlex API key is configured.
              </p>
            </div>
          ) : loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : data && data.content.length > 0 ? (
            <>
              <p className="text-sm text-gray-400 mb-4">
                {data.totalElements} plans available
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {data.content.map((bundle) => (
                  <PlanCard key={bundle.id} bundle={bundle} />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-10">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-gray-500 px-4">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={data.last}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <Globe className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No plans found for this filter.</p>
              <Button
                variant="link"
                onClick={() => { setRegion("All"); setCountryIso(""); setCountrySearch(""); }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
