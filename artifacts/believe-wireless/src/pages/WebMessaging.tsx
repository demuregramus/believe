import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useListMessages, useSendMessage, getListMessagesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, MessageCircle, AlertCircle, Loader2, CheckCircle2, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

export default function WebMessaging() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const prefilledNumber = params.get("number") ?? "";

  const [phoneNumber, setPhoneNumber] = useState(prefilledNumber);
  const [activeNumber, setActiveNumber] = useState("");
  const [recipient, setRecipient] = useState("");
  const [messageBody, setMessageBody] = useState("");

  const { toast } = useToast();

  // Auto-login if a number was passed via query string (e.g. redirect from GetNumber)
  useEffect(() => {
    if (prefilledNumber) {
      const cleaned = prefilledNumber.replace(/\D/g, "");
      if (cleaned.length >= 10) {
        const formatted = cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;
        setActiveNumber(formatted);
      }
    }
  }, [prefilledNumber]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: isLoadingMessages, refetch } = useListMessages(
    { phoneNumber: activeNumber, limit: 50 },
    { query: { enabled: !!activeNumber, refetchInterval: 3000, queryKey: getListMessagesQueryKey({ phoneNumber: activeNumber }) } }
  );

  const sendMessageMutation = useSendMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // basic E.164 normalization for simplicity (assuming US +1)
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      toast({ title: "Invalid number", description: "Please enter a valid 10-digit number.", variant: "destructive" });
      return;
    }
    const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
    setActiveNumber(formatted);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim() || !recipient) return;

    let toFormatted = recipient.replace(/\D/g, '');
    toFormatted = toFormatted.startsWith('1') ? `+${toFormatted}` : `+1${toFormatted}`;

    sendMessageMutation.mutate({
      data: {
        from: activeNumber,
        to: toFormatted,
        body: messageBody
      }
    }, {
      onSuccess: () => {
        setMessageBody("");
        refetch();
      },
      onError: () => {
        toast({ title: "Failed to send", description: "Message could not be sent.", variant: "destructive" });
      }
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-[calc(100vh-theme(spacing.20))] flex items-center justify-center p-4">
        
        {!activeNumber ? (
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">Web Messaging</h1>
            <p className="text-gray-500 mb-8">Log in with your Believe number to access your messages from anywhere.</p>
            
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Your Believe Number</label>
                <Input 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-14 rounded-xl text-lg bg-gray-50 border-transparent focus-visible:bg-white"
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20">
                Access Messages
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[80vh] shadow-2xl border border-gray-200 flex overflow-hidden">
            {/* Sidebar / Profile Info */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col hidden md:flex">
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Number</p>
                    <p className="font-bold text-gray-900">{activeNumber}</p>
                  </div>
                </div>
              </div>
              <div className="flex-grow p-6 space-y-3">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3 items-start border border-blue-100">
                  <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
                  <p>Welcome to Web Messaging! Enter a recipient number and start typing to send an SMS via your Believe number.</p>
                </div>
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex gap-3 items-start border border-amber-200">
                  <FlaskConical className="w-5 h-5 shrink-0 text-amber-500" />
                  <p>
                    <strong>Trial mode:</strong> Outbound SMS can only reach{" "}
                    <strong>verified numbers</strong>. Add recipients at{" "}
                    <a
                      href="https://demuregram.signalwire.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      demuregram.signalwire.com
                    </a>.
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900" onClick={() => setActiveNumber("")}>
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col bg-white">
              {/* Chat Header */}
              <div className="h-20 border-b border-gray-100 flex items-center px-6 gap-4 bg-white/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex-grow">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Recipient Number</label>
                  <Input 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter phone number..."
                    className="h-10 rounded-lg max-w-xs border-gray-200 bg-gray-50 focus-visible:bg-white"
                  />
                </div>
                <div className="md:hidden">
                  <p className="text-xs text-right text-gray-500">From</p>
                  <p className="font-bold text-sm">{activeNumber}</p>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-grow overflow-y-auto p-6 bg-gray-50/50" ref={scrollRef}>
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-6 flex flex-col justify-end min-h-full">
                    {/* Sort messages chronologically (assuming API returns newest first based on limit, we reverse it) */}
                    {[...messages].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg) => {
                      const isMe = msg.from === activeNumber;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && <span className="text-xs text-gray-400 mb-1 ml-1">{msg.from}</span>}
                          <div 
                            className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                              isMe 
                                ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/20' 
                                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.body}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 mx-1 font-medium flex items-center gap-1">
                            {formatTime(msg.createdAt)}
                            {isMe && <CheckCircle2 className="w-3 h-3 text-primary/60" />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                    <p>No messages yet.</p>
                    <p className="text-sm">Send a message to start a conversation.</p>
                  </div>
                )}
              </div>

              {/* Compose Bar */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder={recipient ? "Type a message..." : "Enter recipient number above first"}
                    className="flex-grow h-14 rounded-full pl-6 bg-gray-50 border-transparent focus-visible:bg-white focus-visible:border-primary text-lg"
                    disabled={!recipient}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="w-14 h-14 rounded-full shrink-0 shadow-lg shadow-primary/20"
                    disabled={!recipient || !messageBody.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </MainLayout>
  );
}
