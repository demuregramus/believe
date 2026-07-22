import { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import {
  Search,
  Phone,
  Smartphone,
  CreditCard,
  Ban,
  RotateCcw,
  DollarSign,
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Edit,
  History,
  ShieldAlert,
  UserCheck,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export interface AuditLog {
  id: string;
  adminName: string;
  employeeId: string;
  action: string;
  note: string;
  timestamp: string;
}

export interface SubscriberRecord {
  id: string;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  iccid: string;
  imei: string;
  deviceModel: string;
  status: "active" | "suspended" | "blacklisted";
  accountCredits: number;
  planName: string;
  planCost: string;
  billingCycle: string;
  joinedAt: string;
  auditLogs: AuditLog[];
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  // Active Action Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetSub, setTargetSub] = useState<SubscriberRecord | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [actionAmount, setActionAmount] = useState<number | undefined>(undefined);

  // Mandatory Admin Metadata Form State
  const [adminName, setAdminName] = useState("Princeton T. Taylor");
  const [employeeId, setEmployeeId] = useState("EMP-88192");
  const [actionNote, setActionNote] = useState("");

  // Edit User Form State
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editIccid, setEditIccid] = useState("");
  const [editImei, setEditImei] = useState("");
  const [editDeviceModel, setEditDeviceModel] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "suspended" | "blacklisted">("active");

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch {
      toast({ title: "Failed to search subscribers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscribers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSubscribers]);

  const toggleLogs = (id: string) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openActionModal = (sub: SubscriberRecord, action: string, amount?: number) => {
    setTargetSub(sub);
    setActionType(action);
    setActionAmount(amount);
    setActionNote("");

    // Prefill edit fields if editing
    if (action === "edit_user") {
      setEditUserName(sub.userName);
      setEditUserEmail(sub.userEmail);
      setEditPhoneNumber(sub.phoneNumber);
      setEditIccid(sub.iccid);
      setEditImei(sub.imei);
      setEditDeviceModel(sub.deviceModel);
      setEditStatus(sub.status);
    }

    setDialogOpen(true);
  };

  const submitAction = async () => {
    if (!targetSub) return;
    if (!adminName.trim() || !employeeId.trim() || !actionNote.trim()) {
      toast({
        title: "Mandatory Audit Data Required",
        description: "Please enter your Admin Name, Employee ID #, and detailed Action Note for fraud tracking.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        subscriberId: targetSub.id,
        action: actionType,
        amount: actionAmount,
        adminName: adminName.trim(),
        employeeId: employeeId.trim(),
        note: actionNote.trim(),
        ...(actionType === "edit_user" && {
          updatedUserName: editUserName,
          updatedUserEmail: editUserEmail,
          updatedPhoneNumber: editPhoneNumber,
          updatedIccid: editIccid,
          updatedImei: editImei,
          updatedDeviceModel: editDeviceModel,
          updatedStatus: editStatus,
        }),
      };

      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Audit Logged & Executed",
          description: data.message,
        });
        setDialogOpen(false);
        await fetchSubscribers();
      } else {
        toast({
          title: "Action Failed",
          description: data.error || "Could not complete operation",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-bold flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-400" />
              Subscribers, Device & Audit Trail System
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage accounts, edit subscriber details, suspend lines, blacklist IMEIs, and review mandatory employee audit notes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-800 text-gray-300 hover:text-white"
            onClick={fetchSubscribers}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh List
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ICCID (89882...), IMEI, Phone # (+1...), Name, or Email..."
            className="pl-10 bg-gray-900 border-gray-800 text-white rounded-xl placeholder:text-gray-500 focus:border-indigo-500"
          />
        </div>

        {/* Subscribers list */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            Searching device database…
          </div>
        ) : subscribers.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
            <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-lg text-white">No matching subscribers found</p>
            <p className="text-sm text-gray-500">Try searching by ICCID, IMEI, or phone number.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {subscribers.map((s) => (
              <div
                key={s.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6"
              >
                {/* User & Line Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-white font-bold text-lg">{s.phoneNumber}</h2>
                        <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-0.5 rounded-full font-mono">
                          {s.id}
                        </span>
                        {s.status === "active" && (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                        {s.status === "suspended" && (
                          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <AlertTriangle size={12} /> Suspended
                          </span>
                        )}
                        {s.status === "blacklisted" && (
                          <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <Ban size={12} /> Blacklisted / Stolen
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {s.userName} ({s.userEmail})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/20 rounded-xl"
                      onClick={() => openActionModal(s, "edit_user")}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Information
                    </Button>
                    <div className="text-right pl-3 border-l border-gray-800">
                      <p className="text-emerald-400 font-bold text-lg">{s.planCost}</p>
                      <p className="text-gray-500 text-xs">{s.billingCycle}</p>
                    </div>
                  </div>
                </div>

                {/* Hardware & Technical Identifiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800/80">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">eSIM ICCID</p>
                    <p className="text-white font-mono text-sm truncate">{s.iccid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Device IMEI</p>
                    <p className="text-white font-mono text-sm truncate">{s.imei}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Hardware Model</p>
                    <p className="text-white text-sm truncate">{s.deviceModel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Account Credit</p>
                    <p className="text-emerald-400 font-bold text-sm">${s.accountCredits.toFixed(2)} USD</p>
                  </div>
                </div>

                {/* Admin Control Actions */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Carrier Controls & Employee Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Suspend / Reconnect */}
                    {s.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl"
                        onClick={() => openActionModal(s, "suspend")}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Suspend Service
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                        onClick={() => openActionModal(s, "reconnect")}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reconnect Service
                      </Button>
                    )}

                    {/* Add Credit */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-xl"
                      onClick={() => openActionModal(s, "add_credit", 10)}
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Add $10 Credit
                    </Button>

                    {/* Issue Refund */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-xl"
                      onClick={() => openActionModal(s, "refund", 39.98)}
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Refund $39.98
                    </Button>

                    {/* Port-Out Pin */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-xl"
                      onClick={() => openActionModal(s, "port_number")}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" /> Port Out Number
                    </Button>

                    {/* Blacklist Device / Report Stolen */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                      onClick={() => openActionModal(s, "blacklist")}
                    >
                      <AlertOctagon className="w-3.5 h-3.5 mr-1.5" /> Blacklist Lost/Stolen
                    </Button>

                    {/* Toggle Audit Trail History */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl ml-auto"
                      onClick={() => toggleLogs(s.id)}
                    >
                      <History className="w-3.5 h-3.5 mr-1.5" />
                      {expandedLogs[s.id] ? "Hide Employee Audit Trail" : `View Employee Audit Notes (${(s.auditLogs || []).length})`}
                    </Button>
                  </div>
                </div>

                {/* Audit Trail & Admin Notes Drawer */}
                {expandedLogs[s.id] && (
                  <div className="bg-gray-950 rounded-2xl p-5 border border-gray-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        Admin Audit Trail & Activity Log History
                      </h3>
                      <span className="text-xs text-gray-500">
                        Required for Fraud, Spam & Employee Awareness
                      </span>
                    </div>

                    {(s.auditLogs || []).length === 0 ? (
                      <p className="text-xs text-gray-500 py-2">No employee notes recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {s.auditLogs.map((log) => (
                          <div
                            key={log.id}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-indigo-400" />
                                <span className="font-bold text-white">{log.adminName}</span>
                                <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                                  ID #{log.employeeId}
                                </span>
                              </div>
                              <span className="text-gray-500 font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <span className="bg-gray-800 text-gray-200 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                {log.action}
                              </span>
                            </div>

                            <p className="text-gray-300 font-medium pt-1 leading-relaxed bg-gray-950/60 p-2.5 rounded-lg border border-gray-800">
                              "{log.note}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action & Edit Modal Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                {actionType === "edit_user" ? "Edit Subscriber Information" : `Execute ${actionType.toUpperCase()}`}
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-xs">
                Every modification or carrier action requires mandatory Admin Name, Employer ID #, and detailed explanation notes for employee audit & fraud prevention.
              </DialogDescription>
            </DialogHeader>

            {targetSub && (
              <div className="space-y-4 my-2 text-sm">
                {/* Editing Fields */}
                {actionType === "edit_user" && (
                  <div className="space-y-3 bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Subscriber Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Full Name</label>
                        <Input
                          value={editUserName}
                          onChange={(e) => setEditUserName(e.target.value)}
                          className="bg-gray-900 border-gray-800 text-white rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Email Address</label>
                        <Input
                          value={editUserEmail}
                          onChange={(e) => setEditUserEmail(e.target.value)}
                          className="bg-gray-900 border-gray-800 text-white rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Phone Number</label>
                        <Input
                          value={editPhoneNumber}
                          onChange={(e) => setEditPhoneNumber(e.target.value)}
                          className="bg-gray-900 border-gray-800 text-white rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Device Model</label>
                        <Input
                          value={editDeviceModel}
                          onChange={(e) => setEditDeviceModel(e.target.value)}
                          className="bg-gray-900 border-gray-800 text-white rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">eSIM ICCID</label>
                        <Input
                          value={editIccid}
                          onChange={(e) => setEditIccid(e.target.value)}
                          className="bg-gray-900 border-gray-800 text-white rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Device IMEI</label>
                        <Input
                          value={editImei}
                          onChange={(e) => setEditImei(e.target.value)}
                          className="bg-gray-900 border-gray-800 text-white rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mandatory Admin Audit Log Inputs */}
                <div className="space-y-3 bg-gray-950 p-4 rounded-xl border border-gray-800">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4 text-amber-400" /> Mandatory Admin Sign-Off
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Admin Full Name *</label>
                      <Input
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="e.g. Princeton T. Taylor"
                        className="bg-gray-900 border-gray-800 text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Employer / Agent ID # *</label>
                      <Input
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. EMP-88192"
                        className="bg-gray-900 border-gray-800 text-white rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Action Reason / Fraud & Activity Notes * (Visible to all employees)
                    </label>
                    <textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      rows={3}
                      placeholder="e.g. Verified customer photo ID. Updated email and added $10 courtesy credit due to billing glitch. Cleared fraud flag."
                      className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg p-3 text-xs placeholder:text-gray-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                className="border-gray-800 text-gray-400 hover:text-white"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                disabled={actionLoading}
                onClick={submitAction}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving & Logging…
                  </>
                ) : (
                  "Confirm & Save Audit Note"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
