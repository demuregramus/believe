import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useAdminLogin({
    mutation: {
      onSuccess: () => navigate("/admin/dashboard"),
      onError: () => setError("Invalid credentials. Please try again."),
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    login.mutate({ data: { email, password } });
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-bold text-2xl text-white tracking-tight">
            Believe<span className="text-indigo-400">.</span>
          </span>
          <p className="text-gray-400 mt-2 text-sm">Admin Portal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5"
        >
          <h1 className="text-white font-semibold text-lg">Sign in</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-gray-400 text-sm" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 text-sm" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {login.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
