import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useClaimPhoneNumber } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, Phone, MapPin, FlaskConical, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

// The one real number provisioned on the SignalWire trial account.
const TRIAL_NUMBER = {
  phoneNumber: "+18634738499",
  friendlyName: "(863) 473-8499",
  region: "FL",
  rateCenter: "LAKELAND",
};

export default function GetNumber() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const claimMutation = useClaimPhoneNumber();
  const [claimedNumber, setClaimedNumber] = useState<string | null>(null);

  // Optional: allow user to enter a name/email so the claim is personalised.
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleClaim = () => {
    claimMutation.mutate(
      {
        data: {
          phoneNumber: TRIAL_NUMBER.phoneNumber,
          userName: userName || undefined,
          userEmail: userEmail || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setClaimedNumber(data.friendlyName);
          toast({
            title: "Number Claimed!",
            description: `You now have access to ${data.friendlyName}`,
          });
        },
        onError: () => {
          toast({
            title: "Failed to claim number",
            description: "Something went wrong — please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-[calc(100vh-theme(spacing.20))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {claimedNumber ? (
            /* ── Success state ── */
            <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl p-12 shadow-xl border border-gray-100 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">You're connected!</h2>
              <p className="text-xl text-gray-600 mb-8">Your Believe Wireless number is:</p>
              <div className="text-5xl font-bold text-primary tracking-tight font-display mb-10">
                {claimedNumber}
              </div>

              {/* Trial notice */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left">
                <FlaskConical className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Trial account:</strong> SMS can only be sent to phone numbers you have
                  verified in your SignalWire trial console. Add a number at{" "}
                  <a
                    href="https://demuregram.signalwire.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    demuregram.signalwire.com
                  </a>{" "}
                  → Settings → Trial Number Verification.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="rounded-full font-bold h-14"
                  onClick={() =>
                    setLocation(
                      `/web-messaging?number=${encodeURIComponent(TRIAL_NUMBER.phoneNumber)}`
                    )
                  }
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Messaging
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full font-bold h-14">
                  <Link href="/plans">Get a SIM Card</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* ── Pick number state ── */
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                {/* Trial badge */}
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 border border-amber-200 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                  <FlaskConical className="w-4 h-4" />
                  Trial Account — 1 Number Available
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-6">
                  Pick your perfect number.
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Your Believe Wireless number is ready. Claim it and start messaging instantly.
                </p>
              </div>

              {/* The one real number card */}
              <div className="max-w-sm mx-auto mb-10">
                <div className="bg-white border-2 border-primary rounded-3xl p-8 shadow-2xl shadow-primary/10 flex flex-col items-center text-center relative overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                    {TRIAL_NUMBER.friendlyName}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mb-6">
                    <MapPin className="w-3.5 h-3.5" />
                    {TRIAL_NUMBER.rateCenter}, {TRIAL_NUMBER.region}
                  </div>

                  {/* Optional personalisation fields */}
                  <div className="w-full space-y-3 mb-6 text-left">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                        Your Name (optional)
                      </label>
                      <Input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="rounded-xl bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                        Your Email (optional)
                      </label>
                      <Input
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="rounded-xl bg-gray-50 border-gray-200"
                        type="email"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-full h-12 font-bold text-base"
                    onClick={handleClaim}
                    disabled={claimMutation.isPending}
                  >
                    {claimMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Claiming…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Claim This Number
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Explain trial limits */}
              <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-600 space-y-2">
                <p className="font-semibold text-gray-800 mb-1">How trial mode works</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This number is already active on your SignalWire account.</li>
                  <li>You can send & receive SMS immediately after claiming.</li>
                  <li>
                    On a <strong>trial account</strong>, outbound SMS can only reach{" "}
                    <strong>verified phone numbers</strong>. Verify recipient numbers at{" "}
                    <a
                      href="https://demuregram.signalwire.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      demuregram.signalwire.com
                    </a>
                    .
                  </li>
                  <li>Upgrade your SignalWire account to remove all restrictions.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
