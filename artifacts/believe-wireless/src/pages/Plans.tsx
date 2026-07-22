import { MainLayout } from "@/components/layout/MainLayout";
import { useListPlans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, Shield, Zap, Globe, SignalHigh, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_5_PLANS = [
  {
    id: "talk-text",
    name: "Talk & Text Only",
    price: "$4.99",
    billingCycle: "Billed $9.98 every 2 months",
    description: "Cheapest plan for voice & messaging. Unlimited talk & text with NO cellular data.",
    features: [
      "Unlimited talk & text nationwide",
      "No cellular data included (0 Data)",
      "Billed $9.98 every 2 months ($4.99/mo)",
      "Free local US phone number",
      "Wi-Fi calling & web messaging portal",
      "Compatible with any cell phone",
    ],
    highlight: false,
    badge: "Cheapest Plan",
  },
  {
    id: "basic",
    name: "Basic 5G (1GB)",
    price: "$9.99",
    billingCycle: "Billed $19.98 every 2 months",
    description: "Light data plan with 1GB full-speed 5G data plus unlimited talk & text.",
    features: [
      "1GB full-speed 5G data per month",
      "Unlimited talk & text nationwide",
      "Billed $19.98 every 2 months ($9.99/mo)",
      "Wi-Fi calling & web messaging",
      "Instant eSIM QR Code download",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "starter",
    name: "Starter 5G (5GB)",
    price: "$14.99",
    billingCycle: "Billed $29.98 every 2 months",
    description: "5GB of high-speed 5G data for regular browsing, maps, and messaging.",
    features: [
      "5GB full-speed 5G data per month",
      "Unlimited talk & text nationwide",
      "Billed $29.98 every 2 months ($14.99/mo)",
      "Mobile hotspot included",
      "Instant eSIM QR Code download",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "unlimited",
    name: "Unlimited 5G",
    price: "$19.99",
    billingCycle: "Billed $39.98 every 2 months",
    description: "Truly unlimited nationwide 5G data, talk, text & mobile hotspot.",
    features: [
      "Unlimited full-speed 5G & 4G LTE data",
      "Unlimited talk & text nationwide",
      "Billed $39.98 every 2 months ($19.99/mo)",
      "Unlimited mobile hotspot included",
      "Priority 5G network access",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "global-ultra",
    name: "Global Ultra 5G",
    price: "$29.99",
    billingCycle: "Billed $59.98 every 2 months",
    description: "Unlimited nationwide 5G data PLUS international roaming in 150+ countries.",
    features: [
      "Unlimited 5G data in US & Canada",
      "International roaming in 150+ countries",
      "Billed $59.98 every 2 months ($29.99/mo)",
      "Unlimited talk, text & mobile hotspot",
      "VIP customer support",
    ],
    highlight: false,
    badge: "Ultimate Travel",
  },
];

export default function Plans() {
  const { data: plansData, isLoading } = useListPlans();
  const plans = Array.isArray(plansData) && plansData.length > 0 ? plansData : DEFAULT_5_PLANS;

  return (
    <MainLayout>
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-4 border border-primary/20">
              <Sparkles className="w-4 h-4" /> 5 Flexible Plans Billed Every 2 Months
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display text-gray-900 mb-4 tracking-tight">
              Honest plans. <br />
              <span className="text-primary">No contracts or hidden fees.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              From our cheapest <strong>Talk & Text Only ($4.99/mo)</strong> plan to <strong>Unlimited 5G ($19.99/mo)</strong>, pick the plan that fits your life.
            </p>
          </div>

          {/* Grid of 5 Plans */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch max-w-7xl mx-auto">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-[480px] rounded-[2rem] w-full" />
              ))
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-[2rem] bg-white border flex flex-col justify-between p-6 md:p-8 transition-all duration-300 ${
                    plan.highlight
                      ? "border-2 border-primary shadow-2xl shadow-primary/15 lg:-translate-y-2 z-10"
                      : "border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold font-display text-gray-900 mb-1.5">{plan.name}</h3>
                      <p className="text-gray-500 text-xs min-h-[36px]">{plan.description}</p>
                    </div>

                    <div className="mb-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-center">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold font-display text-gray-900">{plan.price}</span>
                        <span className="text-xs text-gray-500 ml-1 font-medium">/mo</span>
                      </div>
                      <p className="text-[11px] font-bold text-primary mt-1">
                        {(plan as any).billingCycle || `Billed every 2 months`}
                      </p>

                    </div>

                    <ul className="space-y-2.5 mb-6 text-gray-700 text-xs">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    variant={plan.highlight ? "default" : "outline"}
                    className={`w-full rounded-full font-bold h-12 text-sm ${
                      plan.highlight ? "shadow-lg shadow-primary/25" : "border-2"
                    }`}
                  >
                    <Link href="/get-free-number">
                      Select Plan
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* All plans include */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display mb-14">All Believe Plans Include</h2>

          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1">Free WiFi & Web Calling</h4>
                <p className="text-gray-600 text-sm">Make calls and send texts over any WiFi connection or web browser.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <SignalHigh className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1">Nationwide Network</h4>
                <p className="text-gray-600 text-sm">Access the nation's largest 5G network on iPhone and Android.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1">Privacy First</h4>
                <p className="text-gray-600 text-sm">Your data is secured. We never sell your personal information or message history.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1">Instant Setup</h4>
                <p className="text-gray-600 text-sm">Pick a number and start calling in minutes. No credit checks or contracts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
