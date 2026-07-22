import { useGetAdminMe, useGetStats, useAdminListNumbers, useAdminListMessages } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { Phone, MessageSquare, Users, Globe } from "lucide-react";

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

  useEffect(() => {
    if (!meLoading && meError) navigate("/admin");
  }, [meLoading, meError, navigate]);

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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {me.email}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Numbers Claimed" value={stats?.totalNumbersClaimed ?? 1} icon={Phone} color="bg-indigo-600" />
          <StatCard label="Messages Sent" value={stats?.totalMessagesSent ?? 0} icon={MessageSquare} color="bg-violet-600" />
          <StatCard label="Total Users" value={stats?.totalUsers ?? 1} icon={Users} color="bg-blue-600" />
          <StatCard label="Coverage States" value={stats?.coverageStates ?? 50} icon={Globe} color="bg-cyan-600" />
          <StatCard label="Wholesale eSIM Balance" value="$50.06 USD" icon={Phone} color="bg-emerald-600" />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent numbers */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Recent Numbers</h2>
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
            <h2 className="text-white font-semibold mb-4">Recent Messages</h2>
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
