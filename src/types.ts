export interface UserProfile {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  services: string[];
  experience: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  userId: string;
  title: string;
  customerName: string;
  customerPhone: string;
  customerLocation: string;
  items: LineItem[];
  materials: string;
  labour: number;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: "draft" | "sent" | "accepted" | "paid";
  type: "quotation" | "invoice";
  createdAt: string;
  notes: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: "quote_created" | "invoice_sent" | "payment_received" | "profile_updated";
  description: string;
  value: number;
  createdAt: string;
}

export interface DashboardStats {
  totalQuotes: number;
  totalValue: number;
  topCategories: { name: string; count: number }[];
  monthlyGrowth: number;
  creditScore: number;
  recentActivity: Activity[];
}

// ─── SkillPassport AI Types ────────────────────────────────────────────────

export interface PassportPhoto {
  id: string;
  title: string;
  url: string;
  aiLabels: string[];
  aiConfidence: number;
}

export interface VoiceNote {
  id: string;
  duration: number;
  transcript: string;
  createdAt: string;
}

export interface SkillRating {
  name: string;
  score: number; // 0-100
  color: string;
}

export interface SkillPassport {
  id: string;
  userId: string;
  artisanName: string;
  trade: string;
  experienceEstimate: string;
  experienceYears: number;
  skillRatings: SkillRating[];
  photos: PassportPhoto[];
  voiceNote: VoiceNote | null;
  testimonials: string[];
  employmentGrade: string;
  employmentSummary: string;
  readinessBadge: string;
  createdAt: string;
  portfolioType: "welding" | "tailoring" | "carpentry" | "custom";
}

export interface VerificationLog {
  timestamp: string;
  message: string;
  icon: "scan" | "check" | "microscope" | "zap" | "brain" | "shield";
}

export const EMPTY_USER: UserProfile = {
  id: "",
  name: "",
  businessName: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  services: [],
  experience: "",
  createdAt: "",
};