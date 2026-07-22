import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Crown, Shield } from "lucide-react";
import { useState } from "react";
import { useGetAdminMe } from "@workspace/api-client-react";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: me } = useGetAdminMe();

  const links = [
    { href: "/plans", label: "Plans" },
    { href: "/esim", label: "eSIM Activation" },
    { href: "/coverage", label: "Coverage" },
    { href: "/web-messaging", label: "Web Messaging" },
  ];


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-display font-bold text-xl transition-transform group-hover:scale-105">
                B
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-gray-900">
                Believe<span className="text-primary">.</span>
              </span>
            </Link>

            {me?.loggedIn && (
              <Link href="/admin/dashboard">
                <span className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer">
                  <Crown className="w-3.5 h-3.5" /> Admin VIP ($0.00)
                </span>
              </Link>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-primary ${
                    location === link.href ? "text-primary" : "text-gray-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {me?.loggedIn && (
                <Button asChild variant="outline" size="sm" className="rounded-full font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                  <Link href="/admin/dashboard">
                    <Shield className="w-4 h-4 mr-1.5" /> Portal
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" className="rounded-full font-bold px-6">
                <Link href="/get-free-number">Get Free Number</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {me?.loggedIn && (
              <Link href="/admin/dashboard">
                <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-4 absolute w-full shadow-lg">
          <div className="flex flex-col space-y-4">
            {me?.loggedIn && (
              <Link
                href="/admin/dashboard"
                className="bg-indigo-50 text-indigo-700 p-3 rounded-xl font-bold text-sm flex items-center gap-2 border border-indigo-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Crown className="w-4 h-4 text-indigo-600" /> Admin VIP Dashboard ($0.00 Pass Active)
              </Link>
            )}
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-semibold block ${
                  location === link.href ? "text-primary" : "text-gray-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100">
              <Button asChild className="w-full rounded-full font-bold" size="lg">
                <Link href="/get-free-number" onClick={() => setMobileMenuOpen(false)}>
                  Get Free Number
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
