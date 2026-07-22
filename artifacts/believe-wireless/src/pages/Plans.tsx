import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, Shield, Zap, Globe, SignalHigh, Sparkles } from "lucide-react";

export default function Plans() {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-4 border border-primary/20">
              <Sparkles className="w-4 h-4" /> Simple & Transparent Pricing
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display text-gray-900 mb-4 tracking-tight">
              One Plan. Everything Unlimited.
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              No complicated tiers. No hidden charges. Just one all-inclusive plan for <strong>$39.98 billed every 2 months</strong> ($19.99/month).
            </p>
          </div>

          {/* The 1 Single Unlimited Plan Card */}
          <div className="max-w-xl mx-auto">
            <div className="relative rounded-[2.5rem] bg-white border-2 border-primary p-8 md:p-12 shadow-2xl shadow-primary/15 flex flex-col justify-between overflow-hidden">
              
              {/* Badge */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                Official Believe Wireless Plan
              </div>

              <div>
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">
                    Unlimited 5G Data, Talk & Text
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Complete nationwide coverage with high-speed 5G data and free web messaging.
                  </p>
                </div>

                <div className="mb-6 text-center bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-bold font-display text-gray-900">$19.99</span>
                    <span className="text-xl text-gray-500 ml-2 font-medium">/ month</span>
                  </div>
                  <p className="text-sm font-bold text-primary mt-2">
                    ⚡ Billed as $39.98 every 2 months
                  </p>
                </div>

                <ul className="space-y-4 mb-10 text-gray-700">
                  {[
                    "Unlimited nationwide 5G & 4G LTE data",
                    "Unlimited talk & text nationwide",
                    "Billed as $39.98 every 2 months ($19.99/mo equivalent)",
                    "Unlimited mobile hotspot included",
                    "Free local US phone number & web messaging portal",
                    "Instant eSIM QR Code download (iPhone & Android)",
                    "No contracts, no credit checks, no hidden carrier fees",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="font-medium text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full rounded-full font-bold h-16 text-xl shadow-xl shadow-primary/25 hover:scale-105 transition-transform"
              >
                <Link href="/get-free-number">
                  Get Unlimited Plan ($39.98 / 2 mo)
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* What's included */}
      <div className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display mb-16">All-Inclusive Features</h2>

          <div className="grid sm:grid-cols-2 gap-10 text-left">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">Free WiFi & Web Calling</h4>
                <p className="text-gray-600">Make calls and send texts over any WiFi connection or web browser.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <SignalHigh className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">5G Network Access</h4>
                <p className="text-gray-600">Instant eSIM activation on the nation's largest 5G network.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">Privacy First</h4>
                <p className="text-gray-600">Your data is secured. We never sell your personal information or message history.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">Instant Setup</h4>
                <p className="text-gray-600">Pick a number and start calling in minutes. No credit checks or contracts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
