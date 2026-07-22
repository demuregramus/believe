import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useListAvailableNumbers, useClaimPhoneNumber, getListAvailableNumbersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, CheckCircle2, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function GetNumber() {
  const [areaCodeInput, setAreaCodeInput] = useState("");
  const [searchAreaCode, setSearchAreaCode] = useState("");
  const { toast } = useToast();

  const { data: numbers, isLoading: isSearching, refetch } = useListAvailableNumbers(
    { areaCode: searchAreaCode },
    { query: { enabled: searchAreaCode.length === 3, queryKey: getListAvailableNumbersQueryKey({ areaCode: searchAreaCode }) } }
  );

  const claimMutation = useClaimPhoneNumber();
  const [claimedNumber, setClaimedNumber] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (areaCodeInput.length === 3) {
      setSearchAreaCode(areaCodeInput);
    } else {
      toast({
        title: "Invalid area code",
        description: "Please enter a 3-digit area code.",
        variant: "destructive"
      });
    }
  };

  const handleClaim = (phoneNumber: string) => {
    claimMutation.mutate(
      { data: { phoneNumber } },
      {
        onSuccess: (data) => {
          setClaimedNumber(data.friendlyName);
          toast({
            title: "Number Claimed Successfully!",
            description: `You are now the owner of ${data.friendlyName}`,
          });
        },
        onError: () => {
          toast({
            title: "Failed to claim number",
            description: "That number might have just been taken. Try another.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-[calc(100vh-theme(spacing.20))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {claimedNumber ? (
            <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl p-12 shadow-xl border border-gray-100 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">You're connected!</h2>
              <p className="text-xl text-gray-600 mb-8">
                Your new Believe Wireless number is:
              </p>
              <div className="text-5xl font-bold text-primary tracking-tight font-display mb-10">
                {claimedNumber}
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <Button asChild size="lg" className="rounded-full font-bold h-14">
                  <Link href="/web-messaging">Start Messaging</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full font-bold h-14">
                  <Link href="/plans">Get a SIM Card</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-6">
                  Pick your perfect number.
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Search by area code to find a local number. It's completely free and yours to keep forever.
                </p>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 mb-12">
                <form onSubmit={handleSearch} className="flex gap-4 max-w-xl mx-auto">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input 
                      value={areaCodeInput}
                      onChange={(e) => setAreaCodeInput(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="Enter 3-digit Area Code (e.g. 415)"
                      className="pl-12 h-14 rounded-full text-lg border-gray-200 focus-visible:ring-primary"
                      maxLength={3}
                    />
                  </div>
                  <Button type="submit" size="lg" className="rounded-full h-14 px-8 font-bold" disabled={areaCodeInput.length !== 3 || isSearching}>
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
                  </Button>
                </form>
              </div>

              {searchAreaCode && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="text-primary w-5 h-5" />
                    Available numbers in ({searchAreaCode})
                  </h3>
                  
                  {isSearching ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : numbers && numbers.length > 0 ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {numbers.map((number) => (
                        <div 
                          key={number.phoneNumber}
                          className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-primary hover:shadow-lg transition-all group flex flex-col items-center text-center cursor-pointer"
                          onClick={() => handleClaim(number.phoneNumber)}
                        >
                          <Phone className="w-6 h-6 text-gray-400 group-hover:text-primary mb-3 transition-colors" />
                          <div className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                            {number.friendlyName}
                          </div>
                          <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full mb-4">
                            {number.rateCenter}, {number.region}
                          </div>
                          <Button 
                            className="w-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                            disabled={claimMutation.isPending}
                          >
                            {claimMutation.isPending ? "Claiming..." : "Claim Number"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                      <p className="text-gray-500 text-lg">No numbers found for this area code.</p>
                      <Button variant="link" onClick={() => setAreaCodeInput("")} className="mt-2">Try another area code</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
