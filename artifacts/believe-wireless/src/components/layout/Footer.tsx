import { Link } from "wouter";
import { SiTiktok, SiInstagram, SiFacebook } from "react-icons/si";
import { Linkedin, ShieldCheck, Scale, AlertCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4 inline-block">
              <span className="font-display font-bold text-2xl tracking-tight text-gray-900">
                Believe<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              The challenger telecom giving everyone access to communication. No contracts, no hidden penalties, just freedom.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-primary transition-colors" aria-label="TikTok">
                <SiTiktok size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                <SiInstagram size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
                <SiFacebook size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 font-display">Phone Plans</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/plans" className="hover:text-primary transition-colors">Talk &amp; Text ($4.99/mo)</Link></li>
              <li><Link href="/plans" className="hover:text-primary transition-colors">Basic 5G ($9.99/mo)</Link></li>
              <li><Link href="/plans" className="hover:text-primary transition-colors">Unlimited 5G ($19.99/mo)</Link></li>
              <li><Link href="/coverage" className="hover:text-primary transition-colors">Coverage Map</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 font-display">Services</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/esim" className="hover:text-primary transition-colors">Free eSIM Activation ($0)</Link></li>
              <li><Link href="/web-messaging" className="hover:text-primary transition-colors">Web Messaging Portal</Link></li>
              <li><Link href="/get-free-number" className="hover:text-primary transition-colors">Get SIM Card</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 font-display">Legal &amp; Regulatory</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-emerald-600" /> FCC Registration</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">E911 Disclosure</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 font-display">Support</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Network Status</a></li>
            </ul>
          </div>
        </div>

        {/* State & Federal Telecom Regulatory Disclosures Box */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 text-xs text-gray-500 space-y-3">
          <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            FCC &amp; State Telecom Regulatory Compliance Notice (FRN: 0038671103)
          </div>
          <p className="leading-relaxed">
            Believe Wireless operations comply with Federal Communications Commission (FCC) regulations under 47 CFR Part 64, state public utility commission guidelines, and state auto-renewal law requirements. All wireless service plans auto-renew bi-monthly (every 2 months) with <strong>zero early termination penalties</strong>. Customers may cancel or modify recurring billing anytime within their account settings.
          </p>
          <p className="leading-relaxed">
            <strong>Fee &amp; Telecom Compliance Disclosures:</strong> Itemized charges include transparent bi-monthly wireless service rates, a one-time physical SIM/eSIM digital installation fee ($1.99), and state/local telecom taxes &amp; regulatory surcharges ($0.99 calculated at state baseline rates of 2.5%–3.5%). All messaging complies with A2P 10DLC carrier registration rules. In-call softphone recording complies with federal consent regulations (47 U.S.C. § 227) and displays an active recording status indicator.
          </p>
          <p className="leading-relaxed flex items-start gap-1.5 text-gray-400">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span><strong>E911 Notice:</strong> Wi-Fi Calling and Web Messaging Emergency 911 services require an up-to-date registered physical address. E911 service may be limited during power or broadband outages.</span>
          </p>
        </div>


        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Believe Wireless by Demuregram LLC (FCC FRN: 0038671103). All Rights Reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
