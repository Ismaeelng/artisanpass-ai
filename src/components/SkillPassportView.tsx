import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, Scan, Brain, Sparkles, Check, X, Upload, Camera,
  Microscope, Zap, ChevronRight, CircleCheck, CircleAlert,
  ChartBar, Star, Clock, User, Hammer, Medal, Award,
  FileText, Play, SkipForward, FastForward, StopCircle,
  MessageSquare, Quote, ListChecks, AlertTriangle, Info,
  Image, Mic, BadgeCheck, Gauge, Verified,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile, SkillPassport, PassportPhoto, VerificationLog } from "@/types";
import {
  SKILLPASSPORT_DEMO_PORTFOLIO, SKILLPASSPORT_VERIFICATION_MESSAGES,
  PORTFOLIO_TYPES, getInitials, formatCurrency, generateId,
} from "@/constants";

interface SkillPassportViewProps {
  user: UserProfile;
}

type ViewStep = "welcome" | "generator" | "evaluator";

// ─── AI Verification Simulation States ──────────────────────────────────

const VERIFICATION_PHASES = [
  { key: "scanning", icon: Scan, duration: 8000, label: "Scanning Portfolio" },
  { key: "evaluating", icon: Brain, duration: 12000, label: "Evaluating Skills" },
  { key: "grading", icon: Microscope, duration: 10000, label: "Grading & Badging" },
] as const;

function getRandomMessages(phase: string, count: number): string[] {
  const msgs = SKILLPASSPORT_VERIFICATION_MESSAGES[phase] || [];
  const shuffled = [...msgs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Passport Card ──────────────────────────────────────────────────────

function PassportCard({ passport, compact }: { passport: SkillPassport; compact?: boolean }) {
  const gradeColors: Record<string, string> = {
    "A+": "text-emerald-600 dark:text-emerald-400",
    "A": "text-emerald-500",
    "B+": "text-blue-500",
    "B": "text-blue-400",
    "C": "text-amber-500",
  };

  const badgeColors: Record<string, string> = {
    "Gold": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200",
    "Silver": "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400 border-slate-200",
    "Bronze": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white shadow-xl shadow-emerald-500/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Shield className="size-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-emerald-200 font-medium uppercase tracking-wider">ArtisanPass</p>
            <p className="text-lg font-bold">{passport.artisanName}</p>
          </div>
        </div>
        <Badge className={badgeColors[passport.readinessBadge] || "bg-white/20 text-white"}>
          <Award className="size-3 mr-1" />
          {passport.readinessBadge}
        </Badge>
      </div>

      {/* Trade & Experience */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs">
          {passport.trade}
        </Badge>
        <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs">
          <Clock className="size-3 mr-1" />
          {passport.experienceEstimate}
        </Badge>
      </div>

      {/* Skill Ratings */}
      <div className="space-y-2 mb-4">
        {passport.skillRatings.slice(0, compact ? 3 : 5).map((skill) => (
          <div key={skill.name} className="flex items-center gap-2">
            <span className="text-xs min-w-[80px] text-emerald-100">{skill.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.score}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <span className="text-xs font-semibold min-w-[2ch]">{skill.score}</span>
          </div>
        ))}
      </div>

      {/* Grade & Badge */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20">
        <div className="flex items-center gap-2">
          <Medal className="size-4 text-emerald-200" />
          <span className="text-sm font-semibold">Grade {passport.employmentGrade}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-200">
          <Verified className="size-3" />
          AI Verified
        </div>
      </div>
    </motion.div>
  );
}

// ─── Laser Scanner Animation ────────────────────────────────────────────

function LaserScanner({ active }: { active: boolean }) {
  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      {/* Center target */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-24 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
          <div className="size-16 rounded-full border border-emerald-400/50 flex items-center justify-center">
            <Scan className="size-8 text-emerald-400" />
          </div>
        </div>
      </div>
      {/* Laser line */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ top: 0 }}
            animate={{ top: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/50"
            style={{ filter: "blur(0.5px)" }}
          />
        )}
      </AnimatePresence>
      {/* Corner brackets */}
      <div className="absolute top-2 left-2 size-4 border-t-2 border-l-2 border-emerald-500/50 rounded-tl" />
      <div className="absolute top-2 right-2 size-4 border-t-2 border-r-2 border-emerald-500/50 rounded-tr" />
      <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-emerald-500/50 rounded-bl" />
      <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-emerald-500/50 rounded-br" />
      {/* Status text */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="text-[10px] text-emerald-400 font-mono">
          {active ? "SCANNING..." : "READY"}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          AI-OCR v2.4
        </span>
      </div>
    </div>
  );
}

// ─── Photo Analysis Card ────────────────────────────────────────────────

function PhotoAnalysisCard({ photo, index }: { photo: PassportPhoto; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-border p-3"
    >
      <div className="flex items-start gap-3">
        <div className="size-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-border">
          <Image className="size-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold truncate">{photo.title}</h4>
            <Badge variant="secondary" className="text-[10px] px-1.5">
              {photo.aiConfidence}%
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {photo.aiLabels.map((label, i) => (
              <span key={i} className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {label}
              </span>
            ))}
          </div>
          <div className="mt-1.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>AI Confidence</span>
              <div className="flex-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${photo.aiConfidence}%` }}
                />
              </div>
              <span className="font-semibold text-emerald-600">{photo.aiConfidence}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function SkillPassportView({ user }: SkillPassportViewProps) {
  const [viewStep, setViewStep] = useState<ViewStep>("welcome");
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("welding");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationPhase, setVerificationPhase] = useState(0);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [passport, setPassport] = useState<SkillPassport | null>(null);
  const [showPassport, setShowPassport] = useState(false);
  const [photoCount, setPhotoCount] = useState(3);
  const [userName, setUserName] = useState(user.name || "Musa Ibrahim");
  const [userTrade, setUserTrade] = useState("Metal Fabrication & Welding");
  const [activeTab, setActiveTab] = useState("generator");
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [analyzedPhotos, setAnalyzedPhotos] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ─── AI Verification Simulator ────────────────────────────────────────

  const startVerification = useCallback(async () => {
    setIsVerifying(true);
    setVerificationPhase(0);
    setVerificationProgress(0);
    setVerificationLogs([]);
    setShowPassport(false);
    setPassport(null);

    const totalDuration = VERIFICATION_PHASES.reduce((sum, p) => sum + p.duration, 0);
    const phaseDurations = VERIFICATION_PHASES.map((p) => p.duration);
    const phaseStartProgress = [0, 33, 66];
    const phaseEndProgress = [33, 66, 100];

    const allLogs: VerificationLog[] = [];
    let currentPhase = 0;
    let elapsed = 0;

    const phaseInterval = setInterval(() => {
      elapsed += 250;
      const totalProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setVerificationProgress(totalProgress);

      // Check phase transitions
      for (let i = VERIFICATION_PHASES.length - 1; i >= 0; i--) {
        if (totalProgress >= phaseEndProgress[i]) {
          if (currentPhase !== i + 1) {
            currentPhase = i + 1;
            setVerificationPhase(Math.min(i + 1, VERIFICATION_PHASES.length - 1));
          }
          break;
        }
      }

      // Add random log messages
      if (Math.random() > 0.6) {
        const phase = VERIFICATION_PHASES[Math.min(currentPhase, VERIFICATION_PHASES.length - 1)];
        const msgs = getRandomMessages(phase?.key || "scanning", 1);
        if (msgs.length > 0) {
          const newLog: VerificationLog = {
            timestamp: new Date().toLocaleTimeString(),
            message: msgs[0],
            icon: phase?.key as VerificationLog["icon"] || "scan",
          };
          allLogs.push(newLog);
          setVerificationLogs([...allLogs]);
        }
      }

      if (totalProgress >= 100) {
        clearInterval(phaseInterval);
        setIsVerifying(false);
        setVerificationPhase(VERIFICATION_PHASES.length - 1);
        setVerificationProgress(100);

        // Generate the passport
        const generated: SkillPassport = {
          ...SKILLPASSPORT_DEMO_PORTFOLIO,
          id: `sp-${generateId()}`,
          artisanName: userName,
          trade: userTrade,
          createdAt: new Date().toISOString(),
          photos: SKILLPASSPORT_DEMO_PORTFOLIO.photos.slice(0, photoCount),
        };
        setPassport(generated);
        setShowPassport(true);

        // Final logs
        allLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          message: "✓ SkillPassport generated successfully!",
          icon: "check",
        });
        setVerificationLogs([...allLogs]);
        toast.success("SkillPassport AI verification complete!");
      }
    }, 250);

    intervalRef.current = phaseInterval;
  }, [userName, userTrade, photoCount]);

  // ─── Photo Analysis Simulation ────────────────────────────────────────

  const simulatePhotoAnalysis = useCallback(async () => {
    setAnalyzingPhoto(true);
    setAnalyzedPhotos([]);

    const photos = [
      { id: "p-1", title: "Heavy-Duty Gate" },
      { id: "p-2", title: "Window Grills" },
      { id: "p-3", title: "Structural Steelwork" },
    ];

    for (let i = 0; i < photos.length; i++) {
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
      setAnalyzedPhotos((prev) => [...prev, photos[i].id]);
      toast.success(`AI analyzed: ${photos[i].title}`);
    }

    setAnalyzingPhoto(false);
    toast.success("All photos analyzed! You can now generate the SkillPassport.");
  }, []);

  // ─── Render: Welcome Screen ───────────────────────────────────────────

  if (viewStep === "welcome") {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">SkillPassport AI</h2>
              <p className="text-xs text-muted-foreground">AI-powered artisan verification & credentialing</p>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setViewStep("generator")}
            className="cursor-pointer bg-white dark:bg-zinc-900 rounded-xl border border-border p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-md active:scale-[0.98]"
          >
            <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center mb-3">
              <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Artisan Generator</h3>
            <p className="text-xs text-muted-foreground">Upload portfolio photos, simulate AI verification, and generate a digital SkillPassport with skill ratings and readiness badge.</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Get Started <ChevronRight className="size-3" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setViewStep("evaluator")}
            className="cursor-pointer bg-white dark:bg-zinc-900 rounded-xl border border-border p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-md active:scale-[0.98]"
          >
            <div className="size-10 rounded-lg bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center mb-3">
              <Scan className="size-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Judge Evaluator</h3>
            <p className="text-xs text-muted-foreground">AI-powered laser scanning of workshop photos, automated label detection, and confidence scoring for each craftsmanship element.</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-violet-600 dark:text-violet-400 font-medium">
              Analyze Photos <ChevronRight className="size-3" />
            </div>
          </motion.div>
        </div>

        {/* Demo Passport Preview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-xs text-muted-foreground font-medium mb-2">Preview: AI-Verified Artisan Passport</p>
          <PassportCard passport={SKILLPASSPORT_DEMO_PORTFOLIO} compact />
        </motion.div>
      </div>
    );
  }

  // ─── Render: Artisan Generator ────────────────────────────────────────

  if (viewStep === "generator") {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setViewStep("welcome")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ChevronRight className="size-3 rotate-180" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Artisan Generator</h2>
              <p className="text-xs text-muted-foreground">Upload photos, verify with AI, get your passport</p>
            </div>
          </div>
        </motion.div>

        {/* Step 1: Artisan Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="size-4 text-emerald-600" /> Step 1: Artisan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border-2 border-emerald-200 dark:border-emerald-800">
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-transparent border-b border-border focus:border-emerald-500 outline-none text-sm font-semibold pb-0.5"
                    placeholder="Artisan name"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Trade / Specialization</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PORTFOLIO_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      onClick={() => {
                        setSelectedPortfolio(pt.id);
                        setUserTrade(pt.label);
                      }}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all text-left ${
                        selectedPortfolio === pt.id
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-background border-border text-muted-foreground hover:border-emerald-300"
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Photos to upload ({photoCount})</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={photoCount}
                  onChange={(e) => setPhotoCount(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 2: Upload Photos */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Image className="size-4 text-emerald-600" /> Step 2: Upload Portfolio Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer">
                <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop photos here or tap to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Upload {photoCount} photo{photoCount > 1 ? "s" : ""} of your work</p>
              </div>
              {/* Simulated upload preview */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {Array.from({ length: photoCount }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-border flex items-center justify-center">
                    <Image className="size-6 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step 3: AI Verification */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="size-4 text-emerald-600" /> Step 3: AI Verification
              </CardTitle>
              <CardDescription className="text-[10px]">
                Click "Start Verification" to simulate the 30-second AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Verification Button */}
              <Button
                onClick={startVerification}
                disabled={isVerifying}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/20"
                size="lg"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    AI Working...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-5" />
                    {showPassport ? "Regenerate Passport" : "Start AI Verification"}
                  </span>
                )}
              </Button>

              {/* Progress Bar */}
              <AnimatePresence>
                {isVerifying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium flex items-center gap-1.5">
                        {VERIFICATION_PHASES[Math.min(verificationPhase, VERIFICATION_PHASES.length - 1)] && (
                          <>
                            {(() => {
                              const PhaseIcon = VERIFICATION_PHASES[Math.min(verificationPhase, VERIFICATION_PHASES.length - 1)].icon;
                              return <PhaseIcon className="size-3.5 text-emerald-600 animate-pulse" />;
                            })()}
                            {VERIFICATION_PHASES[Math.min(verificationPhase, VERIFICATION_PHASES.length - 1)]?.label}
                          </>
                        )}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">{verificationProgress}%</span>
                    </div>
                    <Progress value={verificationProgress} className="h-2 bg-emerald-100 dark:bg-emerald-950" />
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Scanning</span>
                      <span>Evaluating</span>
                      <span>Grading</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verification Logs */}
              <AnimatePresence>
                {verificationLogs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1 max-h-32 overflow-y-auto"
                  >
                    {verificationLogs.slice(-8).map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-[10px] font-mono"
                      >
                        <span className="text-muted-foreground min-w-[5ch]">{log.timestamp}</span>
                        {log.icon === "check" ? (
                          <CircleCheck className="size-3 text-emerald-500 shrink-0" />
                        ) : (
                          <div className="size-3 rounded-full bg-emerald-500/30 animate-pulse shrink-0" />
                        )}
                        <span className="text-muted-foreground truncate">{log.message}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Passport */}
        <AnimatePresence>
          {showPassport && passport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Shield className="size-4 text-emerald-600" />
                  Your SkillPassport
                </h3>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0">
                  <Verified className="size-3 mr-1" />
                  AI Verified
                </Badge>
              </div>
              <PassportCard passport={passport} />
              {/* Photos */}
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Analyzed Portfolio Photos</p>
                {passport.photos.map((photo, i) => (
                  <PhotoAnalysisCard key={photo.id} photo={photo} index={i} />
                ))}
              </div>
              {/* Testimonials */}
              {passport.testimonials.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Client Testimonials</p>
                  {passport.testimonials.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white dark:bg-zinc-900 rounded-lg p-3 border border-border">
                      <MessageSquare className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{t}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* Employment Summary */}
              <div className="mt-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="size-4 text-emerald-600" />
                  <span className="text-sm font-semibold">Employer Summary</span>
                </div>
                <p className="text-xs text-muted-foreground">{passport.employmentSummary}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-emerald-600 text-white border-0 text-[10px]">
                    Grade {passport.employmentGrade}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    <Award className="size-3 mr-1" />
                    {passport.readinessBadge} Badge
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Render: Judge Evaluator ──────────────────────────────────────────

  if (viewStep === "evaluator") {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setViewStep("welcome")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ChevronRight className="size-3 rotate-180" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Scan className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Judge Evaluator</h2>
              <p className="text-xs text-muted-foreground">AI-powered photo analysis with laser scanner</p>
            </div>
          </div>
        </motion.div>

        {/* Laser Scanner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Scan className="size-4 text-violet-600" /> AI Laser Scanner
              </CardTitle>
              <CardDescription className="text-[10px]">
                Photonic analysis of workshop photos for quality assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <LaserScanner active={analyzingPhoto || isVerifying} />

              <div className="flex gap-2">
                <Button
                  onClick={simulatePhotoAnalysis}
                  disabled={analyzingPhoto}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {analyzingPhoto ? (
                    <span className="flex items-center gap-2">
                      <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Microscope className="size-4" />
                      Run AI Analysis
                    </span>
                  )}
                </Button>
              </div>

              {/* Analysis Progress */}
              <AnimatePresence>
                {analyzingPhoto && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <div className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                      Analyzing photo {analyzedPhotos.length + 1} of 3...
                    </div>
                    <Progress value={(analyzedPhotos.length / 3) * 100} className="h-1.5 bg-violet-100 dark:bg-violet-950" />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analyzed Photos */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Image className="size-4 text-violet-600" /> Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analyzedPhotos.length === 0 ? (
                <div className="text-center py-6">
                  <Scan className="size-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No photos analyzed yet</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Click "Run AI Analysis" to start</p>
                </div>
              ) : (
                SKILLPASSPORT_DEMO_PORTFOLIO.photos
                  .filter((p) => analyzedPhotos.includes(p.id))
                  .map((photo, i) => (
                    <PhotoAnalysisCard key={photo.id} photo={photo} index={i} />
                  ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="size-4 text-violet-600" /> AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analyzedPhotos.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  AI insights will appear after photo analysis
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs">
                    <CircleCheck className="size-3.5 text-emerald-500" />
                    <span>High-quality workmanship detected across all samples</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CircleCheck className="size-3.5 text-emerald-500" />
                    <span>Consistent welding patterns & structural integrity</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CircleCheck className="size-3.5 text-emerald-500" />
                    <span>Professional-grade finishing & material selection</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="size-3.5 text-amber-500" />
                    <span>Minor surface oxidation detected — recommend anti-rust treatment</span>
                  </div>
                  <div className="mt-2 p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                    <p className="text-[10px] text-violet-700 dark:text-violet-300 font-medium">Overall Assessment</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This artisan demonstrates strong craftsmanship with professional-grade output.
                      Recommended for commercial and residential metalwork projects.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Generate Passport from Evaluation */}
        {analyzedPhotos.length === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => setViewStep("generator")}
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-lg"
              size="lg"
            >
              <Sparkles className="size-5 mr-2" />
              Generate SkillPassport with Results
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  return null;
}