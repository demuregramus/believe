import { useLocation, Link } from "wouter";
import { useAdminLogout, useGetAdminMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Phone, MessageSquare, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/numbers", label: "Numbers", icon: Phone },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: me } = useGetAdminMe();

  const logout = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        navigate("/admin");
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <Link href="/" className="font-bold text-white tracking-tight">
            Believe<span className="text-indigo-400">.</span>
          </Link>
          <p className="text-gray-500 text-xs mt-0.5">Admin Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-gray-400 text-xs truncate">{me?.email}</p>
          </div>
          <button
            onClick={() => logout.mutate(undefined as never)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
