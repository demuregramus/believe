import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, Smartphone, SignalHigh, Globe, ShieldCheck } from "lucide-react";
import heroImg from "@assets/generated_images/hero.jpg";
import appPreviewImg from "@assets/generated_images/app-preview.jpg";
import simCardImg from "@assets/generated_images/sim-card.jpg";

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-20 pt-16 md:pt-32 lg:pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-20 blur-3xl w-[800px] h-[800px] rounded-full bg-primary" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 opacity-20 blur-3xl w-[600px] h-[600px] rounded-full bg-accent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Powered by SignalWire Infrastructure
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.1] tracking-tight text-gray-900 mb-6">
                Wireless Freedom. <br/>
                <span className="text-primary">Zero Bills.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Get a free phone number with unlimited calling and texting over WiFi. Add flexible cellular data when you need it. No contracts. No hidden fees.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="xl" className="rounded-full text-lg font-bold px-8 h-14 w-full sm:w-auto shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  <Link href="/get-free-number">Get Your Free Number</Link>
                </Button>
                <Button asChild variant="outline" size="xl" className="rounded-full text-lg font-bold px-8 h-14 w-full sm:w-auto hover:bg-gray-50 border-gray-200">
                  <Link href="/plans">View Plans</Link>
                </Button>
              </div>
              
              <div className="mt-10 flex items-center gap-4 text-sm text-gray-500 font-medium">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i+10})`, backgroundSize: 'cover' }} />
                  ))}
                </div>
                <p>Join over <strong>2.5 million</strong> liberated users.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 bg-white aspect-square md:aspect-[4/3] flex items-center justify-center">
                <img 
                  src={heroImg} 
                  alt="Abstract modern telecommunications concept" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-10 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 delay-300 duration-1000">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Monthly Bill</p>
                    <p className="text-lg font-bold text-gray-900">$0.00</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Press Logos */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider">
            Featured In
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <h3 className="font-display text-xl font-bold">TechCrunch</h3>
            <h3 className="font-display text-xl font-bold">WIRED</h3>
            <h3 className="font-display text-xl font-bold">The Verge</h3>
            <h3 className="font-display text-xl font-bold">CNET</h3>
            <h3 className="font-display text-xl font-bold">Forbes</h3>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold tracking-wide uppercase mb-3">How It Works</h2>
            <h3 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-6">
              Three steps to absolute freedom.
            </h3>
            <p className="text-lg text-gray-600">
              We've stripped away the complexity of traditional carriers. Getting connected is now as simple as downloading an app.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-gray-200 via-primary to-gray-200 opacity-30 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl border border-gray-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                <span className="text-4xl font-display font-bold text-primary">1</span>
              </div>
              <h4 className="text-2xl font-bold font-display mb-4">Pick Your Number</h4>
              <p className="text-gray-600 leading-relaxed">
                Choose from millions of available numbers in any US area code. It's yours to keep forever.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl border border-gray-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                <span className="text-4xl font-display font-bold text-primary">2</span>
              </div>
              <h4 className="text-2xl font-bold font-display mb-4">Start Calling on WiFi</h4>
              <p className="text-gray-600 leading-relaxed">
                Use our app or web messaging interface to talk and text instantly over any WiFi connection for free.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl border border-gray-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                <span className="text-4xl font-display font-bold text-primary">3</span>
              </div>
              <h4 className="text-2xl font-bold font-display mb-4">Add Network Coverage</h4>
              <p className="text-gray-600 leading-relaxed">
                Order a SIM card to get nationwide 5G data and coverage when you're away from WiFi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <Smartphone className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-3xl font-bold font-display mb-4">Web Messaging</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Don't have your phone? Text and call directly from your browser. Perfect for staying connected while working.
                </p>
                <Button variant="link" className="p-0 text-primary font-bold text-lg" asChild>
                  <Link href="/web-messaging">Try Web Messaging &rarr;</Link>
                </Button>
              </div>
              <div className="mt-10 -mb-12 -mr-12 group-hover:scale-105 transition-transform duration-700">
                <img src={appPreviewImg} alt="App Interface" className="rounded-tl-2xl shadow-2xl border border-gray-100" />
              </div>
            </div>

            <div className="bg-primary rounded-[2rem] p-8 md:p-12 shadow-xl shadow-primary/20 text-white flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-50 z-0"></div>
              <div className="relative z-10">
                <SignalHigh className="w-12 h-12 text-white mb-6" />
                <h3 className="text-3xl font-bold font-display mb-4">Nationwide 5G</h3>
                <p className="text-white/80 mb-8 text-lg">
                  Order a Believe SIM card and tap into the nation's largest 5G network. High-speed data when you need it.
                </p>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary font-bold text-lg" asChild>
                  <Link href="/coverage">View Coverage Map</Link>
                </Button>
              </div>
              <div className="mt-10 -mb-12 -mr-12 group-hover:scale-105 transition-transform duration-700 relative z-10">
                <img src={simCardImg} alt="SIM Card" className="rounded-tl-2xl shadow-2xl border border-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-16">
            Why people love Believe.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I haven't paid a phone bill in 8 months. The call quality is perfect and I can text from my laptop at work.",
                author: "Sarah J.",
                role: "Student",
                rating: 5
              },
              {
                quote: "Got a second number for my side hustle in literally 30 seconds. This changes the game completely.",
                author: "Marcus T.",
                role: "Freelancer",
                rating: 5
              },
              {
                quote: "The free plan is amazing, but their data add-ons are cheaper than my old carrier anyway. Switched the whole family.",
                author: "Elena R.",
                role: "Small Business Owner",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-3xl p-8 text-left border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-6 text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-8 font-medium">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i+40})`, backgroundSize: 'cover' }} />
                  <div>
                    <h5 className="font-bold text-gray-900">{testimonial.author}</h5>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/20 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-display text-white mb-6">
            Ready to break free?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Get your free number today and join the millions who have stopped paying for essential communication.
          </p>
          <Button asChild size="xl" className="rounded-full text-lg font-bold px-10 h-16 bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
            <Link href="/get-free-number">Claim Your Free Number Now</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
