import { Link } from "wouter";
import { SiTiktok, SiInstagram, SiFacebook } from "react-icons/si";
import { Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-6 inline-block">
              <span className="font-display font-bold text-2xl tracking-tight text-gray-900">
                Believe<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              The challenger telecom giving everyone access to communication. No bills, no contracts, just freedom.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">
                <SiTiktok size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <SiInstagram size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <SiFacebook size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 font-display">Phone Plan</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/plans" className="hover:text-primary transition-colors">Free Nationwide Talk & Text</Link></li>
              <li><Link href="/plans" className="hover:text-primary transition-colors">Flexible Data Options</Link></li>
              <li><Link href="/coverage" className="hover:text-primary transition-colors">Coverage Map</Link></li>
              <li><Link href="/get-free-number" className="hover:text-primary transition-colors">Get a SIM Card</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 font-display">Downloads</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary transition-colors">iOS App</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Android App</a></li>
              <li><Link href="/web-messaging" className="hover:text-primary transition-colors">Web Messaging</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 font-display">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
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

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Believe Wireless — By Demuregram. All Rights Reserved.
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
