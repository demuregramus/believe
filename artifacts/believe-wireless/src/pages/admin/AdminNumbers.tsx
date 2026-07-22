import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe, useAdminListNumbers, getAdminListNumbersQueryKey } from "@workspace/api-client-react";
import AdminLayout from "./AdminLayout";
import { Phone } from "lucide-react";

const PAGE_SIZE = 20;

export default function AdminNumbers() {
  const [, navigate] = useLocation();
  const [page, setPage] = useState(0);

  const { data: me, isLoading: meLoading, error: meError } = useGetAdminMe();
  const { data, isLoading } = useAdminListNumbers(
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    { query: { enabled: !!me, queryKey: getAdminListNumbersQueryKey({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }) } }
  );

  useEffect(() => {
    if (!meLoading && meError) navigate("/admin");
  }, [meLoading, meError, navigate]);

  if (!me && meLoading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;
  }
  if (!me) return null;

  const numbers = data?.numbers ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Claimed Numbers</h1>
            <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total numbers claimed</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : numbers.length === 0 ? (
            <div className="p-16 text-center">
              <Phone size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No numbers claimed yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium px-5 py-3">Number</th>
                  <th className="text-left text-gray-500 font-medium px-5 py-3">User</th>
                  <th className="text-left text-gray-500 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-gray-500 font-medium px-5 py-3">Claimed</th>
                </tr>
              </thead>
              <tbody>
                {numbers.map((n) => (
                  <tr key={n.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-white font-medium">{n.friendlyName}</p>
                      <p className="text-gray-500 text-xs">{n.sid}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-300">{n.userEmail ?? <span className="text-gray-600">—</span>}</p>
                      {n.userName && <p className="text-gray-500 text-xs">{n.userName}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full">{n.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors">
                  Previous
                </button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
