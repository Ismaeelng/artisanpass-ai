import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  TrendingUp, History, BadgeCheck, Gauge, FileText, Download, Share2,
  ArrowLeft, Trash2, Check, X, Mic, MicOff, Pencil, Plus, Calendar,
  Wallet, MapPin, Phone, Mail, Building, Wrench, Percent, ArrowUpRight,
  ArrowDown, Star, Copy, RefreshCw, Info, List, Search, Menu, Shield,
  Printer, Sparkles, Settings, LogOut, Hammer, Receipt, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { UserProfile, Quote, LineItem, DashboardStats } from "@/types";
import {
  MOCK_USER, MUSA_QUOTE_TEMPLATE, parseInputToQuote, generateDefaultStats,
  formatCurrency, getInitials, generateId, SERVICE_CATEGORIES,
} from "@/constants";

const QUOTES_KEY = "artisanpass_quotes";

interface DashboardProps {
  activeTab: string;
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (u: UserProfile) => void;
}

export default function Dashboard({ activeTab, user, onLogout, onUpdateUser }: DashboardProps) {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem(QUOTES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [stats, setStats] = useState<DashboardStats>(() => generateDefaultStats([]));
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [recording, setRecording] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [showQuoteDetail, setShowQuoteDetail] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [quoteSearch, setQuoteSearch] = useState("");
  const [editName, setEditName] = useState(user.name);
  const [editBusiness, setEditBusiness] = useState(user.businessName);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editLocation, setEditLocation] = useState(user.location);
  const [editServices, setEditServices] = useState(user.services);
  const [editBio, setEditBio] = useState(user.bio);
  const [showSettings, setShowSettings] = useState(false);
  const [quoteFilter, setQuoteFilter] = useState<"all" | "draft" | "sent" | "accepted" | "paid">("all");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
    setStats(generateDefaultStats(quotes));
  }, [quotes]);

  // ─── AI Simulation ──────────────────────────────────────────────────────
  const simulateAI = useCallback(async (input: string) => {
    setAiProcessing(true);
    setAiProgress(0);
    const interval = setInterval(() => {
      setAiProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    clearInterval(interval);
    setAiProgress(100);
    await new Promise((r) => setTimeout(r, 300));

    const parsed = parseInputToQuote(input, user.name, user.businessName);
    setQuotes((prev) => [parsed, ...prev]);
    setAiProcessing(false);
    setAiProgress(0);
    setTextInput("");
    setVoiceInput("");
    setSelectedQuote(parsed);
    setShowQuoteDetail(true);
    toast.success("Quote generated successfully!");
  }, [user]);

  // ─── Voice Recording ────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setVoiceInput("Processing voice input...");
        // Simulate voice-to-text
        setTimeout(() => {
          const voiceText = "Build a heavy-duty metal gate with burglar-proof grills, 4 windows, includes installation and anti-rust coating";
          setVoiceInput(voiceText);
          simulateAI(voiceText);
        }, 800);
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      toast.success("Recording started. Speak clearly about the job.");
    } catch (err: any) {
      toast.error(err.message || "Microphone access denied. Please allow microphone permissions.");
    }
  }, [simulateAI]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ─── Quote Actions ──────────────────────────────────────────────────────
  const deleteQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    if (selectedQuote?.id === id) {
      setSelectedQuote(null);
      setShowQuoteDetail(false);
    }
    toast.success("Quote deleted");
  }, [selectedQuote]);

  const updateQuoteStatus = useCallback((id: string, status: Quote["status"]) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    toast.success("Quote marked as " + status);
  }, []);

  const duplicateQuote = useCallback((q: Quote) => {
    const copy: Quote = { ...q, id: generateId(), title: q.title + " (Copy)", status: "draft", createdAt: new Date().toISOString() };
    setQuotes((prev) => [copy, ...prev]);
    toast.success("Quote duplicated");
  }, []);

  // ─── Export / Share ─────────────────────────────────────────────────────
  const exportAsText = useCallback((q: Quote) => {
    const NL = String.fromCharCode(10);
    const SEP = "─".repeat(30);
    const lines = [
      user.businessName,
      user.name,
      user.phone,
      SEP,
      "QUOTATION: " + q.title,
      "Customer: " + q.customerName,
      "Location: " + q.customerLocation,
      SEP,
      ...q.items.map((i) => i.description + " — " + i.quantity + "×" + formatCurrency(i.unitPrice) + " = " + formatCurrency(i.total)),
      "Materials: " + q.materials,
      "Labour: " + formatCurrency(q.labour),
      SEP,
      "GRAND TOTAL: " + formatCurrency(q.grandTotal),
      "Status: " + q.status,
      "Notes: " + q.notes,
    ].join(NL);
    navigator.clipboard.writeText(lines).then(function () { toast.success("Copied to clipboard"); }).catch(function () { toast.error("Failed to copy"); });
  }, [user]);

  const shareQuote = useCallback(async (q: Quote) => {
    const NL = String.fromCharCode(10);
    const text = user.businessName + NL + "Quotation: " + q.title + NL + "Total: " + formatCurrency(q.grandTotal) + NL + "Customer: " + q.customerName;
    if (navigator.share) {
      try { await navigator.share({ title: "Quotation: " + q.title, text: text }); } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(text).then(function () { toast.success("Quote summary copied to clipboard"); }).catch(function () { toast.error("Failed to copy"); });
    }
  }, [user]);

  // ─── Save Profile ───────────────────────────────────────────────────────
  const saveProfile = useCallback(() => {
    onUpdateUser({ ...user, name: editName, businessName: editBusiness, phone: editPhone, location: editLocation, services: editServices, bio: editBio });
    toast.success("Profile updated");
  }, [user, editName, editBusiness, editPhone, editLocation, editServices, editBio, onUpdateUser]);

  const clearAllData = useCallback(() => {
    if (confirm("This will delete all your quotes and data. Are you sure?")) {
      setQuotes([]);
      setSelectedQuote(null);
      setShowQuoteDetail(false);
      toast.success("All data cleared");
    }
  }, []);

  // ─── Filtered Quotes ────────────────────────────────────────────────────
  const filteredQuotes = quotes.filter((q) => {
    if (quoteFilter !== "all" && q.status !== quoteFilter) return false;
    if (quoteSearch) {
      const s = quoteSearch.toLowerCase();
      return q.title.toLowerCase().includes(s) || q.customerName.toLowerCase().includes(s);
    }
    return true;
  });

  const statusColors: Record<Quote["status"], string> = {
    draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800",
  };

  // ─── RENDER HELPERS ─────────────────────────────────────────────────────

  const renderQuoteCard = (q: Quote) => (
    <motion.button
      key={q.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => { setSelectedQuote(q); setShowQuoteDetail(true); }}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-border p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{q.title}</h3>
            <Badge className={"text-[10px] px-1.5 py-0 border " + statusColors[q.status]}>
              {q.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{q.customerName} — {q.customerLocation}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(q.grandTotal)}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(q.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] text-muted-foreground capitalize">{q.type}</span>
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        </div>
      </div>
    </motion.button>
  );

  const renderQuoteDetail = () => {
    if (!selectedQuote) return null;
    const q = selectedQuote;
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Back button */}
        <button onClick={() => setShowQuoteDetail(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </button>

        {/* Printable Template */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-sm overflow-hidden" id="print-template">
          {/* Header */}
          <div className="border-b border-border p-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Hammer className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-base">{user.businessName}</h2>
                  <p className="text-[11px] text-muted-foreground">{user.name}</p>
                </div>
              </div>
              <Badge className={"text-xs px-2 py-0.5 border " + statusColors[q.status]}>{q.status}</Badge>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="size-3" />{user.phone}</span>
              {user.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{user.location}</span>}
            </div>
          </div>

          {/* Customer Info */}
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Customer</p>
            <p className="font-semibold text-sm">{q.customerName}</p>
            <p className="text-xs text-muted-foreground">{q.customerPhone} — {q.customerLocation}</p>
          </div>

          {/* Title */}
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Description</p>
            <h3 className="font-semibold text-sm">{q.title}</h3>
          </div>

          {/* Items */}
          <div className="px-5 py-3 border-b border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-1.5 font-medium">Item</th>
                  <th className="text-right py-1.5 font-medium">Qty</th>
                  <th className="text-right py-1.5 font-medium">Price</th>
                  <th className="text-right py-1.5 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {q.items.map((item) => (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-1.5">{item.description}</td>
                    <td className="text-right py-1.5">{item.quantity} {item.unit}</td>
                    <td className="text-right py-1.5">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-1.5 font-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Materials & Labour */}
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Materials</p>
            <p className="text-xs">{q.materials}</p>
            <div className="flex justify-between mt-2 text-xs">
              <span>Labour</span>
              <span className="font-medium">{formatCurrency(q.labour)}</span>
            </div>
          </div>

          {/* Totals */}
          <div className="px-5 py-4 bg-emerald-50 dark:bg-emerald-950/30">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(q.subtotal)}</span>
            </div>
            {q.discount > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-red-500">-{formatCurrency(q.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold mt-1 pt-2 border-t border-emerald-200 dark:border-emerald-800">
              <span>Grand Total</span>
              <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(q.grandTotal)}</span>
            </div>
          </div>

          {/* Notes */}
          {q.notes && (
            <div className="px-5 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Notes</p>
              <p className="text-xs">{q.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportAsText(q)}>
            <Copy className="size-3.5" /> Copy Text
          </Button>
          <Button variant="outline" size="sm" onClick={() => shareQuote(q)}>
            <Share2 className="size-3.5" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => duplicateQuote(q)}>
            <Copy className="size-3.5" /> Duplicate
          </Button>
          {q.status === "draft" && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateQuoteStatus(q.id, "sent")}>
              <Check className="size-3.5" /> Mark Sent
            </Button>
          )}
          {q.status === "sent" && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateQuoteStatus(q.id, "accepted")}>
              <BadgeCheck className="size-3.5" /> Mark Accepted
            </Button>
          )}
          {q.status === "accepted" && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateQuoteStatus(q.id, "paid")}>
              <Check className="size-3.5" /> Mark Paid
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => deleteQuote(q.id)}>
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB: DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === "dashboard") {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <Avatar className="size-12 border-2 border-emerald-200 dark:border-emerald-800">
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold">Welcome, {user.name.split(" ")[0]}</h2>
            <p className="text-xs text-muted-foreground">{user.businessName}</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="p-4 border-0 shadow-sm bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                  <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalQuotes}</p>
              <p className="text-[10px] text-muted-foreground">Total Quotes</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-4 border-0 shadow-sm bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                  <Wallet className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              <p className="text-[10px] text-muted-foreground">Total Value</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-4 border-0 shadow-sm bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center">
                  <TrendingUp className="size-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">+{stats.monthlyGrowth}%</p>
              <p className="text-[10px] text-muted-foreground">Monthly Growth</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-4 border-0 shadow-sm bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center">
                  <BadgeCheck className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.creditScore}</p>
              <p className="text-[10px] text-muted-foreground">Credit Score</p>
            </Card>
          </motion.div>
        </div>

        {/* Credit Readiness Gauge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="size-4 text-emerald-600" />
                Credit Readiness
              </CardTitle>
              <CardDescription className="text-[10px]">
                Based on your quote volume and value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <Progress value={stats.creditScore} className="h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 min-w-[3ch]">{stats.creditScore}%</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Building</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <History className="size-4" /> Recent Activity
            </h3>
          </div>
          <div className="space-y-1.5">
            {stats.recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No activity yet. Create your first quote!</p>
            ) : (
              stats.recentActivity.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 rounded-lg p-3 border border-border">
                  <div className="size-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                    {act.type === "payment_received" ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <FileText className="size-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{act.description}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(act.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">{formatCurrency(act.value)}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB: CREATE QUOTE
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === "create") {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-bold mb-1">Create New Quote</h2>
          <p className="text-xs text-muted-foreground">Describe the job — tap the mic or type below</p>
        </motion.div>

        {/* Voice Recording */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className={"border-2 transition-all " + (recording ? "border-red-400 dark:border-red-600 shadow-lg shadow-red-500/10" : "border-border")}>
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={"size-16 rounded-full flex items-center justify-center transition-all " + (
                  recording
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                )}
              >
                {recording ? <MicOff className="size-7" /> : <Mic className="size-7" />}
              </button>
              <p className="text-sm font-medium">
                {recording ? "Recording... Tap to stop" : "Tap to speak"}
              </p>
              {voiceInput && (
                <p className="text-xs text-muted-foreground text-center bg-muted p-2 rounded-lg w-full">
                  {voiceInput}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Text Input */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. Build a heavy-duty metal gate, 3m x 2.4m, with burglar-proof grills, install in Sabon Gari, Kano"
              className="w-full min-h-[100px] bg-white dark:bg-zinc-900 border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              disabled={aiProcessing}
            />
            <div className="absolute bottom-3 right-3 flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setTextInput("")}
                disabled={!textInput || aiProcessing}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Generate Button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button
            onClick={() => simulateAI(textInput)}
            disabled={!textInput.trim() || aiProcessing}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            size="lg"
          >
            {aiProcessing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="size-4 animate-spin" />
                AI Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Generate Quote with AI
              </span>
            )}
          </Button>
        </motion.div>

        {/* AI Progress */}
        <AnimatePresence>
          {aiProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium flex items-center gap-1">
                      <Sparkles className="size-3.5 text-emerald-600" />
                      AI Engine
                    </span>
                    <span className="text-emerald-600 font-semibold">{aiProgress}%</span>
                  </div>
                  <Progress value={aiProgress} className="h-2 bg-emerald-200 dark:bg-emerald-900" />
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {aiProgress < 30 && "Analyzing your description..."}
                    {aiProgress >= 30 && aiProgress < 60 && "Extracting items & quantities..."}
                    {aiProgress >= 60 && aiProgress < 90 && "Calculating pricing & totals..."}
                    {aiProgress >= 90 && "Formatting generated quote..."}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Templates */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <p className="text-xs text-muted-foreground font-medium mb-2">Quick templates</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Metal gate with burglar-proof grills, 4 windows, includes installation",
              "Repair leaking pipe, 2 bathrooms, replace fittings",
              "Build custom wooden shelves, 3 units, 2m each, install in living room",
              "Electrical wiring for 3-bedroom flat, all rooms, with ceiling fans",
            ].map((t, i) => (
              <button
                key={i}
                onClick={() => setTextInput(t)}
                className="text-xs bg-white dark:bg-zinc-900 border border-border rounded-lg px-3 py-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors text-left max-w-full"
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB: QUOTES (LIST)
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === "quotes" && !showQuoteDetail) {
    return (
      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
              value={quoteSearch}
              onChange={(e) => setQuoteSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Button variant="outline" size="icon-sm" onClick={() => setQuoteFilter("all")}>
            <List className="size-4" />
          </Button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(["all", "draft", "sent", "accepted", "paid"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setQuoteFilter(f)}
              className={"text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all " + (
                quoteFilter === f
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white dark:bg-zinc-900 border-border text-muted-foreground hover:border-emerald-300"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Quote List */}
        <div className="space-y-2">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {quoteSearch ? "No quotes match your search" : "No quotes yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {quoteSearch ? "Try a different search term" : "Create your first quote with AI"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredQuotes.map(renderQuoteCard)}
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB: QUOTES → DETAIL
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === "quotes" && showQuoteDetail) {
    return renderQuoteDetail();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB: PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  if (activeTab === "profile") {
    return (
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Business Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-emerald-600 to-emerald-800" />
            <CardContent className="relative px-4 pb-4">
              <Avatar className="size-16 border-4 border-white dark:border-zinc-900 -mt-10 mb-3 shadow-lg">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-lg font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{user.businessName}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {user.services.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                ))}
              </div>
              <div className="flex flex-col gap-1 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{user.phone}</span>
                {user.location && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{user.location}</span>}
                <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{user.email}</span>
              </div>
              {user.bio && <p className="text-xs mt-3 text-muted-foreground">{user.bio}</p>}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Business Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold">{quotes.length}</p>
                  <p className="text-[10px] text-muted-foreground">Quotes</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{quotes.filter((q) => q.status === "paid").length}</p>
                  <p className="text-[10px] text-muted-foreground">Paid</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{user.services.length}</p>
                  <p className="text-[10px] text-muted-foreground">Services</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pencil className="size-4" /> Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <Input placeholder="Business name" value={editBusiness} onChange={(e) => setEditBusiness(e.target.value)} />
              <Input placeholder="Phone" type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              <Input placeholder="Location" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Bio / About your business"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICE_CATEGORIES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                      className={"text-xs px-3 py-1.5 rounded-full border transition-all " + (
                        editServices.includes(s)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-background text-muted-foreground border-border"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={saveProfile} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <Check className="size-4" /> Save Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="size-4" /> Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" onClick={clearAllData} className="w-full justify-start text-destructive">
                <Trash2 className="size-4" /> Clear All Data
              </Button>
              <Button variant="outline" onClick={onLogout} className="w-full justify-start">
                <LogOut className="size-4" /> Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}

// ─── Inline ChevronRight Icon ─────────────────────────────────────────────
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}