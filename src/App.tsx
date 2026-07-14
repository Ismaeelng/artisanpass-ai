import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { LayoutDashboard, FileText, User, Mic, Plus, LogIn, Hammer, Sparkles, Shield, Scan, Brain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Dashboard from "@/components/Dashboard";
import SkillPassportView from "@/components/SkillPassportView";
import { UserProfile, EMPTY_USER } from "@/types";
import { MOCK_USER, SERVICE_CATEGORIES, getInitials } from "@/constants";

const STORAGE_KEY = "artisanpass_user";

function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : EMPTY_USER;
    } catch {
      return EMPTY_USER;
    }
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authView, setAuthView] = useState<"login" | "register">("register");
  const [formName, setFormName] = useState("");
  const [formBusiness, setFormBusiness] = useState("");
  const [formServices, setFormServices] = useState<string[]>([]);
  const [formPhone, setFormPhone] = useState("");

  const isLoggedIn = !!user.id;

  useEffect(() => {
    if (user.id) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const handleLogin = useCallback(() => {
    setUser({
      ...MOCK_USER,
      id: `user-${Date.now()}`,
      name: formName || MOCK_USER.name,
      businessName: formBusiness || MOCK_USER.businessName,
      phone: formPhone || MOCK_USER.phone,
      services: formServices.length > 0 ? formServices : MOCK_USER.services,
    });
  }, [formName, formBusiness, formPhone, formServices]);

  const handleLogout = useCallback(() => {
    setUser(EMPTY_USER);
    setActiveTab("dashboard");
  }, []);

  const toggleService = (s: string) => {
    setFormServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-white dark:from-emerald-950 dark:via-zinc-950 dark:to-zinc-950 flex items-center justify-center p-4">
        <Toaster position="top-center" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <Card className="border-0 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-900/20">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <div className="size-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Hammer className="size-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl tracking-tight">ArtisanPass AI</CardTitle>
              <CardDescription className="text-sm">
                AI-powered quotes and invoices for artisans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setAuthView("register")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    authView === "register"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Get Started
                </button>
                <button
                  onClick={() => setAuthView("login")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    authView === "login"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Sign In
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Your full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
                <Input
                  placeholder="Business name (e.g. Musa Metal Works)"
                  value={formBusiness}
                  onChange={(e) => setFormBusiness(e.target.value)}
                />
                <Input
                  placeholder="Phone number"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />

                {authView === "register" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Select your services (tap to choose)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SERVICE_CATEGORIES.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleService(s)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            formServices.includes(s)
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-background text-muted-foreground border-border hover:border-emerald-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleLogin}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                size="lg"
              >
                <LogIn className="size-4" />
                {authView === "register" ? "Create Account" : "Sign In"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your data stays on your device. No account needed.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "create", label: "New Quote", icon: Plus },
    { id: "quotes", label: "Quotes", icon: FileText },
    { id: "skillpassport", label: "SkillPassport", icon: Shield },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      <Toaster position="top-center" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-r border-border z-40">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="size-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Hammer className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">ArtisanPass</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">AI Assistant</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <tab.icon className="size-5 shrink-0" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto size-1.5 rounded-full bg-emerald-500"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30">
            <Avatar className="size-8 border-2 border-emerald-200 dark:border-emerald-800">
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.businessName}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              <Sparkles className="size-2.5 mr-0.5" />
              AI
            </Badge>
          </div>
        </div>
      </aside>

      {/* Header (mobile only) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Hammer className="size-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">ArtisanPass</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            <Sparkles className="size-3 mr-1" />
            AI Ready
          </Badge>
          <Avatar className="size-8 border-2 border-emerald-200 dark:border-emerald-800">
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-y-auto pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="h-full"
          >
            {activeTab === "skillpassport" ? (
              <SkillPassportView user={user} />
            ) : (
              <Dashboard
                activeTab={activeTab}
                user={user}
                onLogout={handleLogout}
                onUpdateUser={setUser}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar (mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                activeTab === tab.id
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="size-5 relative z-10" />
              <span className="text-[10px] font-medium relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;