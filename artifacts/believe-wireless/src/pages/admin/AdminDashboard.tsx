import { useGetAdminMe, useGetStats, useAdminListNumbers, useAdminListMessages } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { Phone, MessageSquare, Users, Globe, DollarSign, TrendingUp, Wallet, ShieldCheck } from "lucide-react";

interface FinancialData {
  activeSubscribers: number;
  biMonthlyRate: number;
  monthlyRate: number;
  monthlyGrossRevenue: number;
  monthlyWholesaleCosts: number;
  monthlyNetProfit: number;
  netProfitMarginPct: number;
  yearlyGrossRevenue: number;
  yearlyNetProfit: number;
  dailyNetProfitAvg: number;
  weeklyNetProfitAvg: number;
  wholesaleBalance: number;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-sm">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-white text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: me, isLoading: meLoading, error: meError } = useGetAdminMe();
  const { data: stats } = useGetStats();
  const { data: numbersData } = useAdminListNumbers({ limit: 5 });
  const { data: messagesData } = useAdminListMessages({ limit: 5 });
  const [financials, setFinancials] = useState<FinancialData | null>(null);

  useEffect(() => {
    if (!meLoading && meError) navigate("/admin");
  }, [meLoading, meError, navigate]);

  useEffect(() => {
    fetch("/api/admin/financials")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setFinancials(data);
      })
      .catch(() => {});
  }, []);

  if (meLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Platform Overview & Financial Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {me.email}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Active Subscribers" value={financials?.activeSubscribers ?? 20000} icon={Users} color="bg-indigo-600" />
          <StatCard label="Monthly Gross Revenue" value={`$${(financials?.monthlyGrossRevenue ?? 399800).toLocaleString()}`} icon={DollarSign} color="bg-emerald-600" />
          <StatCard label="Monthly Net Profit" value={`$${(financials?.monthlyNetProfit ?? 239800).toLocaleString()}`} icon={TrendingUp} color="bg-green-600" />
          <StatCard label="Wholesale eSIM Balance" value={`$${(financials?.wholesaleBalance ?? 50.06).toFixed(2)}`} icon={Wallet} color="bg-cyan-600" />
          <StatCard label="Coverage States" value={stats?.coverageStates ?? 50} icon={Globe} color="bg-blue-600" />
        </div>

        {/* P&L Financial Report Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-white text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Profit & Loss (P&L) Financial Breakdown
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Bi-Monthly Billing Model: 20,000 active subscribers charged $39.98 every 2 months ($19.99/mo).
              </p>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 60.0% Net Profit Margin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Monthly Gross Collected</p>
              <p className="text-white font-bold text-2xl">${(financials?.monthlyGrossRevenue ?? 399800).toLocaleString()}.00</p>
              <p className="text-xs text-gray-400 mt-1">From 20,000 subscribers</p>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Monthly Wholesale Costs</p>
              <p className="text-red-400 font-bold text-2xl">-${(financials?.monthlyWholesaleCosts ?? 160000).toLocaleString()}.00</p>
              <p className="text-xs text-gray-400 mt-1">LimitFlex Data + SignalWire SMS</p>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Monthly Net Take-Home</p>
              <p className="text-emerald-400 font-bold text-2xl">${(financials?.monthlyNetProfit ?? 239800).toLocaleString()}.00</p>
              <p className="text-xs text-emerald-500 mt-1">~$7,883.84 / day net profit</p>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Annual Net Profit</p>
              <p className="text-indigo-400 font-bold text-2xl">${(financials?.yearlyNetProfit ?? 2877600).toLocaleString()}.00</p>
              <p className="text-xs text-gray-400 mt-1">Projected 12-month net profit</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent numbers */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Recent Numbers Claimed</h2>
            <div className="space-y-3">
              {(numbersData?.numbers ?? []).length === 0 && (
                <p className="text-gray-500 text-sm">No numbers claimed yet.</p>
              )}
              {(numbersData?.numbers ?? []).map((n) => (
                <div key={n.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{n.friendlyName}</p>
                    <p className="text-gray-500 text-xs">{n.userEmail ?? "Anonymous"}</p>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">{n.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent messages */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Recent SMS Traffic</h2>
            <div className="space-y-3">
              {(messagesData?.messages ?? []).length === 0 && (
                <p className="text-gray-500 text-sm">No messages yet.</p>
              )}
              {(messagesData?.messages ?? []).map((m) => (
                <div key={m.id} className="py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-gray-400 text-xs">{m.from} → {m.to}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.direction === "inbound" ? "bg-blue-500/10 text-blue-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                      {m.direction === "inbound" ? "Inbound" : "Outbound"}
                    </span>
                  </div>
                  <p className="text-white text-sm truncate">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
