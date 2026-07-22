import { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import {
  Search,
  Phone,
  Smartphone,
  CreditCard,
  Ban,
  RotateCcw,
  DollarSign,
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SubscriberRecord {
  id: string;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  iccid: string;
  imei: string;
  deviceModel: string;
  status: "active" | "suspended" | "blacklisted";
  accountCredits: number;
  planName: string;
  planCost: string;
  billingCycle: string;
  joinedAt: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch {
      toast({ title: "Failed to search subscribers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscribers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSubscribers]);

  const handleAction = async (subscriberId: string, action: string, amount?: number) => {
    setActionLoading(`${subscriberId}-${action}`);
    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId, action, amount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Action Complete",
          description: data.message,
        });
        await fetchSubscribers();
      } else {
        toast({
          title: "Action Failed",
          description: data.error || "Could not execute action",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-bold">Subscribers & Device Management</h1>
            <p className="text-gray-400 text-sm mt-1">
              Search by Phone Number, Name, Email, ICCID, IMEI, or Device Model to manage lines, suspend, blacklist, or port.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-800 text-gray-300 hover:text-white"
            onClick={fetchSubscribers}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh List
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ICCID (89882...), IMEI, Phone # (+1...), Name or Email..."
            className="pl-10 bg-gray-900 border-gray-800 text-white rounded-xl placeholder:text-gray-500 focus:border-indigo-500"
          />
        </div>

        {/* Subscribers list */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            Searching device database…
          </div>
        ) : subscribers.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
            <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-lg text-white">No matching subscribers found</p>
            <p className="text-sm text-gray-500">Try searching by ICCID, IMEI, or phone number.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {subscribers.map((s) => (
              <div
                key={s.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6"
              >
                {/* User & Line Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-white font-bold text-lg">{s.phoneNumber}</h2>
                        <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-0.5 rounded-full font-mono">
                          {s.id}
                        </span>
                        {s.status === "active" && (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                        {s.status === "suspended" && (
                          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <AlertTriangle size={12} /> Suspended
                          </span>
                        )}
                        {s.status === "blacklisted" && (
                          <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <Ban size={12} /> Blacklisted / Stolen
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {s.userName} ({s.userEmail})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">{s.planCost}</p>
                    <p className="text-gray-500 text-xs">{s.billingCycle}</p>
                  </div>
                </div>

                {/* Hardware & Technical identifiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800/80">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">eSIM ICCID</p>
                    <p className="text-white font-mono text-sm truncate">{s.iccid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Device IMEI</p>
                    <p className="text-white font-mono text-sm truncate">{s.imei}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Hardware Model</p>
                    <p className="text-white text-sm truncate">{s.deviceModel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Account Credit</p>
                    <p className="text-emerald-400 font-bold text-sm">${s.accountCredits.toFixed(2)} USD</p>
                  </div>
                </div>

                {/* Admin Control Action Buttons */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Line Actions & Carrier Controls
                  </p>
                  <div className="flex flex-wrap gap-2">

                    {/* Suspend / Reconnect */}
                    {s.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl"
                        disabled={actionLoading === `${s.id}-suspend`}
                        onClick={() => handleAction(s.id, "suspend")}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Suspend Service
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                        disabled={actionLoading === `${s.id}-reconnect`}
                        onClick={() => handleAction(s.id, "reconnect")}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reconnect Service
                      </Button>
                    )}

                    {/* Add Credit */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-xl"
                      disabled={actionLoading === `${s.id}-add_credit`}
                      onClick={() => handleAction(s.id, "add_credit", 10)}
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Add $10 Credit
                    </Button>

                    {/* Issue Refund */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-xl"
                      disabled={actionLoading === `${s.id}-refund`}
                      onClick={() => handleAction(s.id, "refund", 39.98)}
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Refund $39.98
                    </Button>

                    {/* Port-Out Pin */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-xl"
                      disabled={actionLoading === `${s.id}-port_number`}
                      onClick={() => handleAction(s.id, "port_number")}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" /> Port Out Number
                    </Button>

                    {/* Blacklist Device / Report Stolen */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                      disabled={actionLoading === `${s.id}-blacklist`}
                      onClick={() => handleAction(s.id, "blacklist")}
                    >
                      <AlertOctagon className="w-3.5 h-3.5 mr-1.5" /> Blacklist Lost/Stolen
                    </Button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
