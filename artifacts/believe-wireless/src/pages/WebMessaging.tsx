import { useState, useRef, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useListMessages, useSendMessage, getListMessagesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  User,
  MessageCircle,
  Phone,
  Voicemail,
  Users as ContactsIcon,
  Settings,
  Image as ImageIcon,
  Smile,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  PhoneCall,
  Play,
  Pause,
  Plus,
  Trash2,
  Search,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Sparkles,
  Loader2,
  AlertCircle,
  Star,
  Download,
  Ban,
  PauseCircle,
  Disc,
  ArrowRightLeft,
  GitMerge,
  Paperclip,
  Radio,
  BarChart3,
  HardDrive,
  MoreVertical,
  Check,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface CallLog {
  id: string;
  from: string;
  to: string;
  direction: "incoming" | "outgoing" | "missed";
  durationSeconds: number;
  status: string;
  createdAt: string;
}

interface VoicemailItem {
  id: string;
  from: string;
  to: string;
  durationSeconds: number;
  audioUrl: string;
  transcript: string;
  read: boolean;
  createdAt: string;
}

interface ContactItem {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  notes?: string;
  favorite?: boolean;
  avatarColor: string;
}

interface UsageStats {
  textsToday: number;
  callsToday: number;
  minutesToday: number;
  voicemailCount: number;
  storagePercentage: number;
  planName: string;
  planCost: string;
  unlimitedText: boolean;
  unlimitedCalling: boolean;
  spamProtection: boolean;
}

export default function WebMessaging() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlNumber = params.get("number");

  const savedNumber = typeof window !== "undefined" ? localStorage.getItem("believe_active_number") : null;
  const initialNumber = urlNumber || savedNumber || "+18634738499";

  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  const [activeNumber, setActiveNumber] = useState(
    initialNumber ? (initialNumber.startsWith("+") ? initialNumber : `+1${initialNumber.replace(/\D/g, "")}`) : ""
  );

  // Active Main Navigation Tab: 'messages' | 'dialer' | 'voicemail' | 'contacts' | 'settings'
  const [activeTab, setActiveTab] = useState<"messages" | "dialer" | "voicemail" | "contacts" | "settings">("messages");

  // Messaging State
  const [activeRecipient, setActiveRecipient] = useState<string>("+14155552671");
  const [messageBody, setMessageBody] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [threadSearch, setThreadSearch] = useState("");

  // Softphone & Call State
  const [dialInput, setDialInput] = useState("");
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isBluetooth, setIsBluetooth] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callTarget, setCallTarget] = useState("");
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  // Voicemail State
  const [voicemails, setVoicemails] = useState<VoicemailItem[]>([]);
  const [playingVmId, setPlayingVmId] = useState<string | null>(null);

  // Contacts Directory State
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");

  // Account, Security & Live Usage State
  const [numberLocked, setNumberLocked] = useState(true);
  const [callerIdMode, setCallerIdMode] = useState("Believe Wireless");
  const [e911Address, setE911Address] = useState("100 Believe Plaza, Princeton, NJ 08540");
  const [blockedNumbers, setBlockedNumbers] = useState<string[]>(["+18005550199", "+18885550122"]);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    textsToday: 48,
    callsToday: 6,
    minutesToday: 132,
    voicemailCount: 2,
    storagePercentage: 78,
    planName: "Believe Unlimited 5G",
    planCost: "$0.00 / Included",
    unlimitedText: true,
    unlimitedCalling: true,
    spamProtection: true,
  });

  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeNumber) {
      localStorage.setItem("believe_active_number", activeNumber);
    }
  }, [activeNumber]);

  // Fetch messages with auto-refetching
  const { data: messages, isLoading: isLoadingMessages, refetch: refetchMessages } = useListMessages(
    { phoneNumber: activeNumber, limit: 50 },
    { query: { enabled: !!activeNumber, refetchInterval: 3000, queryKey: getListMessagesQueryKey({ phoneNumber: activeNumber }) } }
  );

  const sendMessageMutation = useSendMessage();

  // Scroll message thread to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch Call History, Voicemails, Contacts, Usage Stats & Blocked Numbers
  useEffect(() => {
    if (!activeNumber) return;

    fetch(`/api/calls/history?phoneNumber=${encodeURIComponent(activeNumber)}`)
      .then((r) => r.json())
      .then(setCallLogs)
      .catch(() => {});

    fetch(`/api/voicemail?phoneNumber=${encodeURIComponent(activeNumber)}`)
      .then((r) => r.json())
      .then(setVoicemails)
      .catch(() => {});

    fetch(`/api/contacts`)
      .then((r) => r.json())
      .then(setContacts)
      .catch(() => {});

    fetch(`/api/stats/usage`)
      .then((r) => r.json())
      .then(setUsageStats)
      .catch(() => {});

    fetch(`/api/blocked-numbers`)
      .then((r) => r.json())
      .then(setBlockedNumbers)
      .catch(() => {});
  }, [activeNumber]);

  // Zero-Delay SSE Real-Time Event Stream Listener
  useEffect(() => {
    if (!activeNumber) return;

    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "message") {
          refetchMessages();
        } else if (payload.type === "call") {
          setCallLogs((prev) => [payload.data, ...prev.filter((c) => c.id !== payload.data.id)]);
        } else if (payload.type === "voicemail") {
          setVoicemails((prev) => [payload.data, ...prev.filter((v) => v.id !== payload.data.id)]);
        } else if (payload.type === "contact") {
          setContacts((prev) => [payload.data, ...prev.filter((c) => c.id !== payload.data.id)]);
        }
      } catch {
        // Ignore parse error
      }
    };

    return () => {
      eventSource.close();
    };
  }, [activeNumber, refetchMessages]);

  // Active call timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inCall && !onHold) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [inCall, onHold]);

  // Global Contact Resolution Helper: Maps phone number to contact name or formatted number
  const resolveContactName = (num: string) => {
    if (!num) return "Unknown";
    const cleaned = num.replace(/\D/g, "");
    const match = contacts.find((c) => c.phoneNumber.replace(/\D/g, "") === cleaned);
    if (match) return match.name;
    return num;
  };

  // Group Messages into Conversation Threads
  const conversationsMap = useMemo(() => {
    if (!messages) return [];
    const map = new Map<string, { partner: string; lastMsg: any; count: number }>();

    messages.forEach((msg) => {
      const partner = msg.from === activeNumber ? msg.to : msg.from;
      if (!map.has(partner)) {
        map.set(partner, { partner, lastMsg: msg, count: 1 });
      } else {
        const existing = map.get(partner)!;
        existing.count += 1;
        if (new Date(msg.createdAt).getTime() > new Date(existing.lastMsg.createdAt).getTime()) {
          existing.lastMsg = msg;
        }
      }
    });

    return Array.from(map.values()).filter((conv) => {
      const name = resolveContactName(conv.partner).toLowerCase();
      const num = conv.partner.toLowerCase();
      const query = threadSearch.toLowerCase();
      return name.includes(query) || num.includes(query);
    });
  }, [messages, activeNumber, contacts, threadSearch]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 10) {
      toast({ title: "Invalid number", description: "Please enter a valid 10-digit number.", variant: "destructive" });
      return;
    }
    const formatted = cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;
    setActiveNumber(formatted);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageBody.trim() && !mediaUrlInput.trim()) || !activeRecipient) return;

    let toFormatted = activeRecipient.replace(/\D/g, "");
    toFormatted = toFormatted.startsWith("1") ? `+${toFormatted}` : `+1${toFormatted}`;

    sendMessageMutation.mutate(
      {
        data: {
          from: activeNumber,
          to: toFormatted,
          body: messageBody,
          mediaUrl: mediaUrlInput || undefined,
        } as any,
      },
      {
        onSuccess: () => {
          setMessageBody("");
          setMediaUrlInput("");
          setShowMediaInput(false);
          refetchMessages();
          toast({ title: "Sent!", description: `Delivered to ${resolveContactName(toFormatted)}` });
        },
        onError: () => {
          toast({ title: "Failed to send", description: "Message could not be sent.", variant: "destructive" });
        },
      }
    );
  };

  // Start Call Handler
  const handleStartCall = (targetNum?: string) => {
    const num = targetNum || dialInput || activeRecipient;
    if (!num) return;
    const formatted = num.startsWith("+") ? num : `+1${num.replace(/\D/g, "")}`;
    setCallTarget(formatted);
    setInCall(true);
    setOnHold(false);
    setIsRecording(false);
    toast({ title: "Calling…", description: `Dialing ${resolveContactName(formatted)} over Believe 5G Wi-Fi` });

    fetch("/api/calls/dial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: activeNumber, to: formatted, direction: "outgoing" }),
    })
      .then((r) => r.json())
      .then((newCall) => {
        setCallLogs((prev) => [newCall, ...prev]);
        setUsageStats((prev) => ({ ...prev, callsToday: prev.callsToday + 1 }));
      })
      .catch(() => {});
  };

  // End Call Handler
  const handleEndCall = () => {
    setInCall(false);
    setOnHold(false);
    setIsRecording(false);
    toast({ title: "Call Ended", description: `Duration: ${formatCallTime(callDuration)}` });
  };

  // Toggle Hold / Record / Transfer / Merge
  const handleToggleHold = () => {
    const nextHold = !onHold;
    setOnHold(nextHold);
    fetch("/api/calls/hold", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onHold: nextHold }) });
    toast({ title: nextHold ? "Call Put On Hold" : "Call Resumed" });
  };

  const handleToggleRecord = () => {
    const nextRec = !isRecording;
    setIsRecording(nextRec);
    fetch("/api/calls/record", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRecording: nextRec }) });
    toast({ title: nextRec ? "Recording Started" : "Recording Saved" });
  };

  const handleTransferCall = () => {
    fetch("/api/calls/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetNumber: "+18005550199" }) });
    toast({ title: "Call Transferred", description: "Transferred to Believe Customer Care." });
  };

  const handleMergeCalls = () => {
    fetch("/api/calls/merge", { method: "POST" });
    toast({ title: "Calls Merged", description: "3-Way Conference Active." });
  };

  // Dialpad Key Click
  const handleKeyClick = (key: string) => {
    setDialInput((prev) => prev + key);
  };

  // Add Contact Handler
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newContactName, phoneNumber: newContactPhone, email: newContactEmail }),
    })
      .then((r) => r.json())
      .then((c) => {
        setContacts((prev) => [c, ...prev]);
        setShowAddContact(false);
        setNewContactName("");
        setNewContactPhone("");
        setNewContactEmail("");
        toast({ title: "Contact Saved!", description: `${c.name} added with global number resolution.` });
      });
  };

  // Toggle Favorite Contact
  const handleToggleFavorite = (id: string) => {
    fetch(`/api/contacts/${id}/favorite`, { method: "POST" }).then(() => {
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));
    });
  };

  // Delete Contact
  const handleDeleteContact = (id: string) => {
    fetch(`/api/contacts/${id}`, { method: "DELETE" }).then(() => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Contact Removed" });
    });
  };

  // Delete Voicemail
  const handleDeleteVoicemail = (id: string) => {
    fetch(`/api/voicemail/${id}`, { method: "DELETE" }).then(() => {
      setVoicemails((prev) => prev.filter((v) => v.id !== id));
      toast({ title: "Voicemail Deleted" });
    });
  };

  // Toggle Blocked Number
  const handleToggleBlockNumber = (num: string) => {
    const isBlocked = blockedNumbers.includes(num);
    fetch("/api/blocked-numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: num, block: !isBlocked }),
    })
      .then((r) => r.json())
      .then((data) => {
        setBlockedNumbers(data.blockedNumbers);
        toast({
          title: !isBlocked ? "Number Blocked" : "Number Unblocked",
          description: `${resolveContactName(num)} added to spam protection policy.`,
        });
      });
  };

  // Toggle Number Lock
  const handleToggleNumberLock = () => {
    const nextState = !numberLocked;
    setNumberLocked(nextState);
    fetch("/api/number-lock/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLocked: nextState }),
    }).then(() => {
      toast({
        title: nextState ? "Number Reserved & Protected" : "Number Reservation Unlocked",
        description: nextState ? "Your Believe number is 100% protected against expiration." : "Standard rules apply.",
      });
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatCallTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const sampleGifs = [
    "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
    "https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif",
    "https://media.giphy.com/media/3o7TKsjN4WAamZaWCA/giphy.gif",
  ];

  // Active Messages Thread Filter
  const currentThreadMessages = useMemo(() => {
    if (!messages || !activeRecipient) return [];
    const targetClean = activeRecipient.replace(/\D/g, "");
    return messages.filter((m) => {
      const fromClean = m.from.replace(/\D/g, "");
      const toClean = m.to.replace(/\D/g, "");
      return fromClean === targetClean || toClean === targetClean;
    });
  }, [messages, activeRecipient]);

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-[calc(100vh-theme(spacing.20))] flex items-center justify-center p-2 sm:p-4">
        {!activeNumber ? (
          /* Login Portal */
          <div className="bg-white rounded-[2rem] p-8 md:p-10 max-w-md w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">Believe Hub</h1>
            <p className="text-gray-500 text-sm mb-8">Unlimited texting, softphone calling, voicemail, and contacts.</p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Your Believe Phone Number</label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(863) 473-8499"
                  className="h-14 rounded-xl text-lg bg-gray-50 border-transparent focus-visible:bg-white"
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-14 rounded-xl font-bold text-lg shadow-lg shadow-primary/20">
                Enter Communications Hub
              </Button>
            </form>
          </div>
        ) : (
          /* Unified Softphone Workspace */
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[85vh] shadow-2xl border border-gray-200 flex flex-col md:flex-row overflow-hidden relative">
            {/* Desktop Navigation Sidebar */}
            <div className="w-72 bg-gray-900 text-white flex flex-col hidden md:flex shrink-0">
              <div className="p-6 border-b border-gray-800 bg-black/30 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Line</p>
                  <p className="font-bold text-sm text-white truncate">{activeNumber}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-grow p-4 space-y-2">
                {[
                  { id: "messages", label: "Messages & MMS", icon: MessageCircle, badge: conversationsMap.length },
                  { id: "dialer", label: "Softphone & Calls", icon: PhoneCall, badge: callLogs.length },
                  { id: "voicemail", label: "Voicemail Inbox", icon: Voicemail, badge: voicemails.filter((v) => !v.read).length },
                  { id: "contacts", label: "Contacts Directory", icon: ContactsIcon, badge: contacts.length },
                  { id: "settings", label: "Account & Protection", icon: Settings, badge: null },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-semibold transition-all ${
                        isActive ? "bg-primary text-white shadow-md shadow-primary/20 font-bold" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && item.badge > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-800 text-gray-300"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Account Status Footer */}
              <div className="p-4 border-t border-gray-800 bg-black/20 text-xs text-gray-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" /> Reserved 24/7
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">$0.00</Badge>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-white" onClick={() => setActiveNumber("")}>
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden flex justify-around bg-gray-900 text-gray-400 border-b border-gray-800 p-2 z-20">
              {[
                { id: "messages", icon: MessageCircle, label: "Text" },
                { id: "dialer", icon: PhoneCall, label: "Calls" },
                { id: "voicemail", icon: Voicemail, label: "Voice" },
                { id: "contacts", icon: ContactsIcon, label: "Contacts" },
                { id: "settings", icon: Settings, label: "Account" },
              ].map((m) => {
                const Icon = m.icon;
                const active = activeTab === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveTab(m.id as any)}
                    className={`flex flex-col items-center p-1 text-[10px] ${active ? "text-primary font-bold" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Workspace */}
            <div className="flex-grow flex flex-col bg-white overflow-hidden relative">
              {/* Active Softphone Call Overlay Banner */}
              {inCall && (
                <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-800 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl z-30 animate-in slide-in-from-top duration-300 border-b border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                      <PhoneCall className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-emerald-200 font-bold flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-emerald-300 animate-ping" /> Active Softphone Call {onHold && "(ON HOLD)"}
                      </p>
                      <p className="font-bold text-base text-white">{resolveContactName(callTarget)} · {formatCallTime(callDuration)}</p>
                    </div>
                  </div>

                  {/* Softphone In-Call Control Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2.5 rounded-full text-xs font-bold transition-all ${isMuted ? "bg-amber-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"}`}
                      title="Mute Microphone"
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsSpeaker(!isSpeaker)}
                      className={`p-2.5 rounded-full text-xs font-bold transition-all ${isSpeaker ? "bg-blue-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"}`}
                      title="Speaker Mode"
                    >
                      {isSpeaker ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleToggleHold}
                      className={`p-2.5 rounded-full text-xs font-bold transition-all ${onHold ? "bg-purple-600 text-white" : "bg-white/20 hover:bg-white/30 text-white"}`}
                      title="Hold Call"
                    >
                      <PauseCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleToggleRecord}
                      className={`p-2.5 rounded-full text-xs font-bold transition-all ${isRecording ? "bg-red-600 text-white animate-pulse" : "bg-white/20 hover:bg-white/30 text-white"}`}
                      title="Record Call"
                    >
                      <Disc className="w-4 h-4" />
                    </button>
                    <button onClick={handleTransferCall} className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white" title="Transfer Call">
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleMergeCalls} className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white" title="Merge 3-Way Call">
                      <GitMerge className="w-4 h-4" />
                    </button>
                    <Button onClick={handleEndCall} className="rounded-full bg-red-600 hover:bg-red-700 text-white px-4 font-bold text-xs h-9">
                      <PhoneOff className="w-4 h-4 mr-1" /> End Call
                    </Button>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 1: MESSAGES & MMS (Multi-Conversation) ──────────────── */}
              {activeTab === "messages" && (
                <div className="flex-grow grid md:grid-cols-3 h-full overflow-hidden">
                  {/* Conversations Thread Sidebar */}
                  <div className="border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <Input
                          value={threadSearch}
                          onChange={(e) => setThreadSearch(e.target.value)}
                          placeholder="Search conversations..."
                          className="pl-9 h-10 rounded-xl bg-gray-50 border-gray-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                      {conversationsMap.length > 0 ? (
                        conversationsMap.map((conv) => {
                          const contactName = resolveContactName(conv.partner);
                          const isSelected = activeRecipient === conv.partner;
                          return (
                            <button
                              key={conv.partner}
                              onClick={() => setActiveRecipient(conv.partner)}
                              className={`w-full p-4 border-b border-gray-100 flex items-center justify-between text-left transition-colors ${
                                isSelected ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-gray-100"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                                  {contactName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-gray-900 truncate">{contactName}</p>
                                  <p className="text-xs text-gray-500 truncate">{conv.lastMsg.body || "[MMS Attachment]"}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] text-gray-400">{formatTime(conv.lastMsg.createdAt)}</p>
                                {conv.count > 0 && <span className="text-[10px] bg-primary text-white font-bold px-1.5 py-0.5 rounded-full">1</span>}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-gray-400">
                          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                          <p className="text-xs">No active conversations.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Chat Window */}
                  <div className="md:col-span-2 flex flex-col h-full overflow-hidden bg-white">
                    {/* Chat Header */}
                    <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                          {resolveContactName(activeRecipient).charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{resolveContactName(activeRecipient)}</p>
                          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Online · Believe 5G
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartCall(activeRecipient)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
                          title="Call Line"
                        >
                          <Phone className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleBlockNumber(activeRecipient)}
                          className={`p-2 rounded-full ${blockedNumbers.includes(activeRecipient) ? "text-red-600 bg-red-50" : "text-gray-400 hover:text-red-600"}`}
                          title="Block Number"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Thread */}
                    <div className="flex-grow overflow-y-auto p-6 bg-gray-50/50" ref={scrollRef}>
                      {isLoadingMessages ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                      ) : currentThreadMessages.length > 0 ? (
                        <div className="space-y-4 flex flex-col justify-end min-h-full">
                          {[...currentThreadMessages]
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((msg) => {
                              const isMe = msg.from === activeNumber;
                              return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                  {!isMe && <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">{resolveContactName(msg.from)}</span>}
                                  <div
                                    className={`max-w-[75%] px-5 py-3.5 rounded-2xl ${
                                      isMe ? "bg-primary text-white rounded-br-sm shadow-md shadow-primary/20" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                                    }`}
                                  >
                                    {(msg as any).mediaUrl && (
                                      <img
                                        src={(msg as any).mediaUrl}
                                        alt="MMS Attachment"
                                        className="w-full max-h-60 object-cover rounded-xl mb-2.5 border border-white/20"
                                        onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                                      />
                                    )}
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
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
                          <MessageCircle className="w-16 h-16 mb-3 opacity-20" />
                          <p className="font-bold text-gray-600">Start Conversation</p>
                          <p className="text-xs">Type a message below to text {resolveContactName(activeRecipient)}.</p>
                        </div>
                      )}
                    </div>

                    {/* MMS Image Attachment Bar */}
                    {showMediaInput && (
                      <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                        <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                        <Input
                          value={mediaUrlInput}
                          onChange={(e) => setMediaUrlInput(e.target.value)}
                          placeholder="Paste Image / GIF URL (e.g. https://...)"
                          className="h-9 rounded-lg text-xs border-gray-300 bg-white"
                        />
                        <div className="flex gap-1">
                          {sampleGifs.map((gif, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setMediaUrlInput(gif)}
                              className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                            >
                              GIF #{idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Compose Form */}
                    <div className="p-4 bg-white border-t border-gray-100">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMediaInput(!showMediaInput)}
                          className={`p-3 rounded-full transition-colors ${showMediaInput ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          title="Add MMS Image / GIF"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>

                        <Input
                          value={messageBody}
                          onChange={(e) => setMessageBody(e.target.value)}
                          placeholder={`Text ${resolveContactName(activeRecipient)}…`}
                          className="flex-grow h-13 rounded-full pl-6 bg-gray-50 border-transparent focus-visible:bg-white focus-visible:border-primary text-base"
                        />

                        <Button
                          type="submit"
                          size="icon"
                          className="w-13 h-13 rounded-full shrink-0 shadow-lg shadow-primary/20"
                          disabled={(!messageBody.trim() && !mediaUrlInput.trim()) || sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 2: SOFTPHONE & CALLS ──────────────── */}
              {activeTab === "dialer" && (
                <div className="flex-grow grid md:grid-cols-2 h-full overflow-hidden">
                  {/* Left: Interactive Phone Keypad */}
                  <div className="p-6 md:p-8 flex flex-col items-center justify-center bg-gray-50 border-r border-gray-200">
                    <div className="w-full max-w-xs mb-6 text-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Softphone Keypad</p>
                      <Input
                        value={dialInput}
                        onChange={(e) => setDialInput(e.target.value)}
                        placeholder="Enter phone number"
                        className="text-center font-display font-bold text-2xl h-14 rounded-2xl bg-white border-gray-200 shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-6">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
                        <button
                          key={key}
                          onClick={() => handleKeyClick(key)}
                          className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-sm text-xl font-bold text-gray-800 hover:bg-primary hover:text-white hover:border-primary transition-all mx-auto flex items-center justify-center active:scale-95"
                        >
                          {key}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-xs">
                      <Button
                        size="lg"
                        className="flex-grow h-14 rounded-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-lg shadow-lg shadow-emerald-600/20"
                        onClick={() => handleStartCall()}
                        disabled={!dialInput}
                      >
                        <Phone className="w-5 h-5 mr-2" /> Call Line
                      </Button>
                      {dialInput && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-14 h-14 rounded-full border-2 border-gray-200 text-gray-600"
                          onClick={() => setDialInput((prev) => prev.slice(0, -1))}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right: Call History Log */}
                  <div className="p-6 flex flex-col h-full overflow-hidden bg-white">
                    <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" /> Call History Records
                    </h3>

                    <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                      {callLogs.length > 0 ? (
                        callLogs.map((log) => {
                          const targetNum = log.direction === "outgoing" ? log.to : log.from;
                          const name = resolveContactName(targetNum);
                          return (
                            <div key={log.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    log.direction === "incoming" ? "bg-blue-100 text-blue-600" : log.direction === "outgoing" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {log.direction === "incoming" ? <PhoneIncoming className="w-5 h-5" /> : log.direction === "outgoing" ? <PhoneOutgoing className="w-5 h-5" /> : <PhoneMissed className="w-5 h-5" />}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-gray-900">{name}</p>
                                  <p className="text-xs text-gray-500">{formatTime(log.createdAt)} · {formatCallTime(log.durationSeconds)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-full text-emerald-600 hover:bg-emerald-50 font-bold"
                                  onClick={() => handleStartCall(targetNum)}
                                >
                                  Call
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-full text-primary hover:bg-primary/10 font-bold"
                                  onClick={() => {
                                    setActiveRecipient(targetNum);
                                    setActiveTab("messages");
                                  }}
                                >
                                  Text
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-20 text-gray-400">
                          <Phone className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No call history recorded yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 3: VOICEMAIL INBOX ──────────────── */}
              {activeTab === "voicemail" && (
                <div className="p-6 md:p-8 flex-grow overflow-y-auto bg-gray-50">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <Voicemail className="w-6 h-6 text-primary" /> Voicemail Inbox
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Audio recordings with AI voice-to-text transcriptions.</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary font-bold">
                        {voicemails.length} Messages
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {voicemails.map((vm) => {
                        const isPlaying = playingVmId === vm.id;
                        const callerName = resolveContactName(vm.from);
                        return (
                          <div key={vm.id} className={`bg-white border rounded-3xl p-6 shadow-sm transition-all ${!vm.read ? "border-primary/40 ring-2 ring-primary/10" : "border-gray-200"}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setPlayingVmId(isPlaying ? null : vm.id)}
                                  className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 hover:scale-105 transition-transform"
                                >
                                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                                </button>
                                <div>
                                  <p className="font-bold text-gray-900">{callerName}</p>
                                  <p className="text-xs text-gray-400">{formatTime(vm.createdAt)} · {vm.durationSeconds}s</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!vm.read && <Badge className="bg-amber-100 text-amber-800 text-[10px] font-bold">New</Badge>}
                                <a
                                  href={vm.audioUrl}
                                  download={`voicemail-${vm.id}.mp3`}
                                  className="p-2 text-gray-400 hover:text-primary rounded-full"
                                  title="Download Audio MP3"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button onClick={() => handleDeleteVoicemail(vm.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Audio Waveform Scrubber */}
                            <div className="w-full bg-gray-100 h-2 rounded-full mb-3 overflow-hidden">
                              <div className={`h-full bg-primary transition-all duration-300 ${isPlaying ? "w-2/3 animate-pulse" : "w-0"}`}></div>
                            </div>

                            {/* Voice-to-Text Transcript */}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-700 leading-relaxed font-medium">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Voice-To-Text Transcript
                              </p>
                              "{vm.transcript}"
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 4: CONTACTS DIRECTORY ──────────────── */}
              {activeTab === "contacts" && (
                <div className="p-6 md:p-8 flex-grow overflow-y-auto bg-gray-50">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <ContactsIcon className="w-6 h-6 text-primary" /> Contacts Directory
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Automatic contact name resolution across all messages and calls.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={favoriteFilter ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFavoriteFilter(!favoriteFilter)}
                          className="rounded-full font-bold text-xs"
                        >
                          <Star className={`w-3.5 h-3.5 mr-1 ${favoriteFilter ? "fill-white" : ""}`} /> Favorites
                        </Button>
                        <Button onClick={() => setShowAddContact(true)} className="rounded-full font-bold text-xs">
                          <Plus className="w-4 h-4 mr-1" /> Add Contact
                        </Button>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                      <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                      <Input
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="Search contacts by name, number, email, or company..."
                        className="pl-11 h-11 rounded-2xl bg-white border-gray-200 text-sm shadow-sm"
                      />
                    </div>

                    {/* Add Contact Modal */}
                    {showAddContact && (
                      <div className="bg-white border-2 border-primary rounded-3xl p-6 mb-6 shadow-xl animate-in slide-in-from-top-2">
                        <h3 className="font-bold text-gray-900 text-base mb-4">Create New Contact</h3>
                        <form onSubmit={handleAddContact} className="space-y-3">
                          <Input
                            placeholder="Full Name"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            className="rounded-xl border-gray-200"
                            required
                          />
                          <Input
                            placeholder="Phone Number (e.g. 555-123-4567)"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            className="rounded-xl border-gray-200"
                            required
                          />
                          <Input
                            placeholder="Email Address (optional)"
                            value={newContactEmail}
                            onChange={(e) => setNewContactEmail(e.target.value)}
                            className="rounded-xl border-gray-200"
                            type="email"
                          />
                          <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setShowAddContact(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-full font-bold">Save Contact</Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Contacts Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {contacts
                        .filter((c) => {
                          const query = contactSearch.toLowerCase();
                          const matchesQuery = c.name.toLowerCase().includes(query) || c.phoneNumber.includes(query) || (c.email || "").toLowerCase().includes(query);
                          const matchesFav = favoriteFilter ? c.favorite : true;
                          return matchesQuery && matchesFav;
                        })
                        .map((c) => (
                          <div key={c.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl ${c.avatarColor || "bg-primary"} text-white font-bold flex items-center justify-center text-lg shadow-sm relative`}>
                                {c.name.charAt(0)}
                                {c.favorite && (
                                  <span className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 shadow">
                                    <Star className="w-3 h-3 fill-white" />
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-base">{c.name}</p>
                                <p className="text-xs text-gray-500">{c.phoneNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleFavorite(c.id)}
                                className={`p-2 rounded-full ${c.favorite ? "text-amber-500" : "text-gray-300 hover:text-amber-400"}`}
                                title="Favorite Contact"
                              >
                                <Star className={`w-4 h-4 ${c.favorite ? "fill-amber-400" : ""}`} />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveRecipient(c.phoneNumber);
                                  setActiveTab("messages");
                                }}
                                className="p-2 text-primary hover:bg-primary/10 rounded-full"
                                title="Text Contact"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  handleStartCall(c.phoneNumber);
                                  setActiveTab("dialer");
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
                                title="Call Contact"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteContact(c.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 5: ACCOUNT, SECURITY & LIVE USAGE STATISTICS ──────────────── */}
              {activeTab === "settings" && (
                <div className="p-6 md:p-8 flex-grow overflow-y-auto bg-gray-50">
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Live Usage Statistics Widget */}
                    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-3xl p-6 shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-primary" /> Live Account Usage Statistics
                        </h3>
                        <Badge className="bg-emerald-500 text-white font-bold">Live Stream</Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/10 p-3.5 rounded-2xl text-center">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Texts Today</p>
                          <p className="text-2xl font-bold text-white mt-1">{usageStats.textsToday}</p>
                        </div>
                        <div className="bg-white/10 p-3.5 rounded-2xl text-center">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Calls Today</p>
                          <p className="text-2xl font-bold text-white mt-1">{usageStats.callsToday}</p>
                        </div>
                        <div className="bg-white/10 p-3.5 rounded-2xl text-center">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Minutes Used</p>
                          <p className="text-2xl font-bold text-white mt-1">{usageStats.minutesToday} min</p>
                        </div>
                        <div className="bg-white/10 p-3.5 rounded-2xl text-center">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Voicemails</p>
                          <p className="text-2xl font-bold text-white mt-1">{usageStats.voicemailCount}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-300 mb-1.5 font-bold">
                          <span>Cloud Storage Capacity</span>
                          <span>{usageStats.storagePercentage}% Used</span>
                        </div>
                        <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${usageStats.storagePercentage}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Number Reservation Lock */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" /> Number Lock &amp; Protection
                      </h3>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-emerald-900 text-sm">Believe VIP Protection</p>
                          <p className="text-xs text-emerald-700 mt-0.5">Your number is reserved 24/7 with zero inactivity expiration.</p>
                        </div>
                        <Badge className="bg-emerald-600 text-white font-bold">$0.00 / Included</Badge>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <span className="text-sm font-semibold text-gray-700">Number Expiration Lock</span>
                        <Button variant={numberLocked ? "default" : "outline"} size="sm" onClick={handleToggleNumberLock} className="rounded-full font-bold">
                          {numberLocked ? "🔒 Locked & Reserved" : "Unlock"}
                        </Button>
                      </div>
                    </div>

                    {/* Custom Caller ID Setting */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Outbound Caller ID Display
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {["Believe Wireless", "Personal Name", "Business Name", "Hidden"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => {
                              setCallerIdMode(mode);
                              toast({ title: "Caller ID Updated", description: `Display set to: ${mode}` });
                            }}
                            className={`p-3.5 rounded-2xl text-left border font-semibold text-xs transition-all flex items-center justify-between ${
                              callerIdMode === mode ? "border-primary bg-primary/5 text-primary" : "border-gray-200 bg-white text-gray-700"
                            }`}
                          >
                            <span>{mode}</span>
                            {callerIdMode === mode && <Check className="w-4 h-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* E911 Emergency Address Form */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" /> Registered E911 Address
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">Required by FCC regulations for Wi-Fi calling &amp; Web Messaging.</p>
                      <Input
                        value={e911Address}
                        onChange={(e) => setE911Address(e.target.value)}
                        className="rounded-xl border-gray-200 text-sm mb-3"
                      />
                      <Button size="sm" className="rounded-full font-bold" onClick={() => toast({ title: "E911 Address Updated" })}>
                        Update E911 Address
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
