import { MainLayout } from "@/components/layout/MainLayout";
import { useListPlans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, X, Shield, Zap, Globe, SignalHigh } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_PLANS = [
  {
    id: "free",
    name: "Free Flex",
    price: "$0",
    description: "Unlimited talk & text over Wi-Fi plus free data for select apps. No contract, no credit card.",
    features: [
      "Free local phone number",
      "Unlimited talk & text over Wi-Fi",
      "Free data for select apps",
      "Free eSIM available",
      "No credit card required",
      "Nationwide 5G coverage",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "basic",
    name: "Basic 5G",
    price: "$9.99",
    description: "2GB of full-speed 5G data for everyday use, with unlimited talk & text.",
    features: [
      "Everything in Free Flex",
      "2GB full-speed 5G data",
      "Unlimited talk & text",
      "Wi-Fi calling",
      "Mobile hotspot included",
      "No annual contract",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "unlimited",
    name: "Unlimited 5G",
    price: "$19.99",
    description: "Truly unlimited 5G data, talk & text. Billed as $39.98 every 2 months for maximum savings.",
    features: [
      "Everything in Basic 5G",
      "Unlimited full-speed 5G data",
      "Billed $39.98 every 2 months ($19.99/mo)",
      "Unlimited mobile hotspot",
      "International texting included",
      "Priority 5G network access",
    ],
    highlight: true,
    badge: "Most Popular",
  },

];

export default function Plans() {
  const { data: plansData, isLoading } = useListPlans();
  const plans = Array.isArray(plansData) ? plansData : DEFAULT_PLANS;

  return (
    <MainLayout>
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold font-display text-gray-900 mb-6 tracking-tight">
              Honest plans. <br />
              <span className="text-primary">No hidden fees.</span>
            </h1>
            <p className="text-xl text-gray-600">
              Communication is a right. That's why our base plan is completely free. Add high-speed nationwide data only when you need it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
            {isLoading ? (
              <>
                <Skeleton className="h-[500px] rounded-[2rem] w-full" />
                <Skeleton className="h-[550px] rounded-[2rem] w-full" />
                <Skeleton className="h-[500px] rounded-[2rem] w-full" />
              </>
            ) : plans ? (
              plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative rounded-[2rem] bg-white border flex flex-col p-8 md:p-10 transition-all duration-300 ${
                    plan.highlight 
                      ? 'border-primary shadow-2xl shadow-primary/10 lg:-translate-y-4 lg:scale-105 z-10' 
                      : 'border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                      {plan.badge}
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-500 min-h-[48px]">{plan.description}</p>
                  </div>
                  
                  <div className="mb-8 flex items-baseline">
                    <span className="text-5xl font-bold font-display text-gray-900">{plan.price}</span>
                    <span className="text-lg text-gray-500 ml-2 font-medium">/mo</span>
                  </div>
                  
                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    asChild 
                    size="lg" 
                    variant={plan.highlight ? "default" : "outline"}
                    className={`w-full rounded-full font-bold h-14 text-lg ${
                      plan.highlight ? 'shadow-lg shadow-primary/25' : ''
                    }`}
                  >
                    <Link href="/get-free-number">
                      {plan.price === "$0" ? "Get Started Free" : "Choose Plan"}
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                Failed to load plans.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature comparison */}
      <div className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display mb-16">All plans include</h2>
          
          <div className="grid sm:grid-cols-2 gap-10 text-left">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">Free WiFi Calling</h4>
                <p className="text-gray-600">Make calls and send texts over any WiFi connection anywhere in the world.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <SignalHigh className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">Network Access</h4>
                <p className="text-gray-600">Purchase a SIM to access the nation's largest 5G network when off WiFi.</p>
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
