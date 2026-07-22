import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe, useAdminListMessages, getAdminListMessagesQueryKey } from "@workspace/api-client-react";
import AdminLayout from "./AdminLayout";
import { MessageSquare } from "lucide-react";

const PAGE_SIZE = 20;

export default function AdminMessages() {
  const [, navigate] = useLocation();
  const [page, setPage] = useState(0);

  const { data: me, isLoading: meLoading, error: meError } = useGetAdminMe();
  const { data, isLoading } = useAdminListMessages(
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    { query: { enabled: !!me, queryKey: getAdminListMessagesQueryKey({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }) } }
  );

  useEffect(() => {
    if (!meLoading && meError) navigate("/admin");
  }, [meLoading, meError, navigate]);

  if (!me && meLoading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;
  }
  if (!me) return null;

  const messages = data?.messages ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold">Messages</h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total messages</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No messages yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium px-5 py-3">From → To</th>
                  <th className="text-left text-gray-500 font-medium px-5 py-3">Message</th>
                  <th className="text-left text-gray-500 font-medium px-5 py-3">Direction</th>
                  <th className="text-left text-gray-500 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-gray-500 font-medium px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-white font-medium">{m.from}</p>
                      <p className="text-gray-500 text-xs">→ {m.to}</p>
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      <p className="text-gray-300 truncate">{m.body}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.direction === "inbound"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-indigo-500/10 text-indigo-400"
                      }`}>
                        {m.direction === "inbound" ? "Inbound" : "Outbound"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{m.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(m.createdAt).toLocaleString()}
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
