import { MainLayout } from "@/components/layout/MainLayout";
import { useGetStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import coverageMapImg from "@assets/generated_images/coverage-map.jpg";

export default function Coverage() {
  const { data: stats, isLoading } = useGetStats();

  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-gray-900 text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={coverageMapImg} alt="Coverage Map" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground font-semibold text-sm mb-6 border border-primary/50">
            Nationwide 5G
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
            Coverage that reaches <br className="hidden md:block"/>
            <span className="text-primary">every corner.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Powered by the nation's largest 5G network. When you're away from WiFi, Believe has you covered coast to coast.
          </p>
          <Button asChild size="lg" className="rounded-full font-bold px-10 h-14 bg-primary text-white hover:bg-primary/90">
            <Link href="/get-free-number">Get Connected Now</Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-white relative z-20 -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-10 md:p-16">
            <h2 className="text-center text-3xl font-bold font-display text-gray-900 mb-12">
              The numbers behind the network
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {isLoading ? (
                <>
                  <div className="space-y-4"><Skeleton className="h-12 w-24 mx-auto" /><Skeleton className="h-4 w-32 mx-auto" /></div>
                  <div className="space-y-4"><Skeleton className="h-12 w-24 mx-auto" /><Skeleton className="h-4 w-32 mx-auto" /></div>
                  <div className="space-y-4"><Skeleton className="h-12 w-24 mx-auto" /><Skeleton className="h-4 w-32 mx-auto" /></div>
                  <div className="space-y-4"><Skeleton className="h-12 w-24 mx-auto" /><Skeleton className="h-4 w-32 mx-auto" /></div>
                </>
              ) : stats ? (
                <>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold font-display text-primary mb-2">
                      {stats.totalUsers.toLocaleString()}+
                    </div>
                    <p className="text-gray-500 font-medium">Active Users</p>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold font-display text-primary mb-2">
                      {stats.coverageStates}
                    </div>
                    <p className="text-gray-500 font-medium">States Covered</p>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold font-display text-primary mb-2">
                      {stats.totalNumbersClaimed.toLocaleString()}
                    </div>
                    <p className="text-gray-500 font-medium">Numbers Claimed</p>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold font-display text-primary mb-2">
                      {Math.floor(stats.totalMessagesSent / 1000000)}M+
                    </div>
                    <p className="text-gray-500 font-medium">Messages Sent</p>
                  </div>
                </>
              ) : (
                <div className="col-span-full text-gray-500">Failed to load statistics</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display mb-6">Always Connected</h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Believe Wireless uses a hybrid network approach. Whenever you're near a known WiFi network, your calls and texts route securely over the internet for perfect clarity and zero cost. The moment you step away, you seamlessly transition to our nationwide 5G cellular network (with a compatible SIM card and data plan).
          </p>
          <Button asChild variant="outline" size="lg" className="rounded-full font-bold">
            <Link href="/plans">View Data Add-ons</Link>
          </Button>
        </div>
      </div>

    </MainLayout>
  );
}
