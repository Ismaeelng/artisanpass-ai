import { UserProfile, Quote, LineItem, Activity, DashboardStats, SkillPassport, PassportPhoto, SkillRating, VerificationLog } from "./types";

export const BRAND_NAME = "ArtisanPass AI";
export const CONTACT_EMAIL = "hello@artisanpass.ai";

export const SERVICE_CATEGORIES = [
  "Metal Fabrication",
  "Carpentry & Woodwork",
  "Plumbing & Piping",
  "Electrical Installation",
  "Painting & Decorating",
  "Masonry & Tiling",
  "Roofing & Waterproofing",
  "Welding & Steelwork",
  "Furniture Making",
  "General Repairs",
];

export const MOCK_USER: UserProfile = {
  id: "user-1",
  name: "Musa Ibrahim",
  businessName: "Musa Metal Works",
  email: "musa@example.com",
  phone: "+234 801 234 5678",
  location: "Kano, Nigeria",
  bio: "Expert metal fabricator with 12+ years of experience in custom gates, burglary-proof doors, window grills, and structural steelwork.",
  services: ["Metal Fabrication", "Welding & Steelwork", "General Repairs"],
  experience: "12 years",
  createdAt: "2024-01-15T08:00:00Z",
};

export const MUSA_QUOTE_TEMPLATE: Quote = {
  id: "q-001",
  userId: "user-1",
  title: "Burglary-Proof Gate & Window Grills",
  customerName: "Alhaji Suleiman",
  customerPhone: "+234 802 345 6789",
  customerLocation: "Sabon Gari, Kano",
  items: [
    { id: "li-1", description: "Heavy-duty burglary-proof main gate (3m x 2.4m)", quantity: 1, unit: "unit", unitPrice: 350000, total: 350000 },
    { id: "li-2", description: "Window grills with decorative patterns (1.2m x 1.5m)", quantity: 4, unit: "unit", unitPrice: 45000, total: 180000 },
    { id: "li-3", description: "Steel door frame reinforcement", quantity: 2, unit: "unit", unitPrice: 25000, total: 50000 },
    { id: "li-4", description: "Industrial-grade padlock & latch set", quantity: 2, unit: "unit", unitPrice: 12000, total: 24000 },
  ],
  materials: "14mm iron rods, 3mm angle iron, 2mm mild steel sheets, industrial hinges, anti-rust primer, automotive paint",
  labour: 120000,
  subtotal: 604000,
  tax: 0,
  discount: 0,
  grandTotal: 724000,
  status: "draft",
  type: "quotation",
  createdAt: "2024-06-20T10:30:00Z",
  notes: "Payment terms: 50% deposit, 50% on completion. Installation included.",
};

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parseInputToQuote(input: string, userName: string, businessName: string): Quote {
  const lower = input.toLowerCase();

  // Musa metal works keyword detection
  if (
    lower.includes("musa") ||
    (lower.includes("metal") && (lower.includes("gate") || lower.includes("grill") || lower.includes("burglary")))
  ) {
    return { ...MUSA_QUOTE_TEMPLATE, id: generateId(), createdAt: new Date().toISOString() };
  }

  // Generic intelligent parsing
  const words = input.split(/\s+/).filter(Boolean);
  const title = words.length > 3 ? words.slice(0, 4).join(" ") + "..." : input;
  const lines: LineItem[] = [];
  let labour = 0;
  let materials = "";
  let customerName = "";
  let customerLocation = "";

  // Try to extract customer name
  const nameMatch = input.match(/for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (nameMatch) customerName = nameMatch[1];

  // Try to extract location
  const locMatch = input.match(/in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (locMatch) customerLocation = locMatch[1];

  // Try to identify items and materials
  if (lower.includes("repair") || lower.includes("fix")) {
    lines.push({
      id: generateId(),
      description: `Repair work: ${input.slice(0, 60)}`,
      quantity: 1,
      unit: "job",
      unitPrice: Math.floor(Math.random() * 50000) + 15000,
      total: 0,
    });
    materials = "Standard repair materials, fasteners, lubricants";
    labour = Math.floor(Math.random() * 30000) + 10000;
  } else if (lower.includes("build") || lower.includes("construct") || lower.includes("make")) {
    lines.push({
      id: generateId(),
      description: `Custom fabrication: ${input.slice(0, 60)}`,
      quantity: 1,
      unit: "unit",
      unitPrice: Math.floor(Math.random() * 150000) + 50000,
      total: 0,
    });
    materials = "Industrial-grade materials, finishing supplies";
    labour = Math.floor(Math.random() * 60000) + 20000;
  } else if (lower.includes("install") || lower.includes("fitting")) {
    lines.push({
      id: generateId(),
      description: `Installation service: ${input.slice(0, 60)}`,
      quantity: 1,
      unit: "job",
      unitPrice: Math.floor(Math.random() * 80000) + 20000,
      total: 0,
    });
    materials = "Mounting hardware, connectors, sealants";
    labour = Math.floor(Math.random() * 40000) + 15000;
  } else {
    // Generic fallback - create items from keywords
    const keywords = input.split(/[,.;]+/).filter((s) => s.trim().length > 5);
    if (keywords.length > 0) {
      keywords.slice(0, 4).forEach((kw) => {
        const price = Math.floor(Math.random() * 80000) + 10000;
        lines.push({
          id: generateId(),
          description: kw.trim(),
          quantity: 1,
          unit: "unit",
          unitPrice: price,
          total: price,
        });
      });
      materials = "Standard materials as per specification";
      labour = Math.floor(Math.random() * 50000) + 15000;
    } else {
      lines.push({
        id: generateId(),
        description: input.slice(0, 80),
        quantity: 1,
        unit: "job",
        unitPrice: Math.floor(Math.random() * 100000) + 20000,
        total: 0,
      });
      materials = "Materials as required";
      labour = Math.floor(Math.random() * 40000) + 10000;
    }
  }

  // Calculate totals
  lines.forEach((l) => { l.total = l.quantity * l.unitPrice; });
  const subtotal = lines.reduce((s, l) => s + l.total, 0) + labour;

  return {
    id: generateId(),
    userId: "user-1",
    title: title.length > 60 ? title.slice(0, 60) + "..." : title,
    customerName: customerName || "Valued Customer",
    customerPhone: "",
    customerLocation: customerLocation || "Local Area",
    items: lines,
    materials,
    labour,
    subtotal,
    tax: 0,
    discount: 0,
    grandTotal: subtotal,
    status: "draft",
    type: "quotation",
    createdAt: new Date().toISOString(),
    notes: "Thank you for your business!",
  };
}

export function generateDefaultStats(quotes: Quote[]): DashboardStats {
  const totalQuotes = quotes.length;
  const totalValue = quotes.reduce((s, q) => s + q.grandTotal, 0);
  const categoryCount: Record<string, number> = {};
  quotes.forEach((q) => {
    const cat = q.items[0]?.description?.slice(0, 20) || "General";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Credit score based on quote volume and value
  const creditScore = Math.min(100, Math.floor(totalQuotes * 10 + totalValue / 50000));

  const activity: Activity[] = quotes.map((q) => ({
    id: q.id,
    userId: q.userId,
    type: q.type === "invoice" ? "invoice_sent" : "quote_created",
    description: `${q.title} - ${q.customerName}`,
    value: q.grandTotal,
    createdAt: q.createdAt,
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    totalQuotes,
    totalValue,
    topCategories,
    monthlyGrowth: totalQuotes > 0 ? Math.floor(Math.random() * 30) + 5 : 0,
    creditScore,
    recentActivity: activity.slice(0, 20),
  };
}

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── SkillPassport AI Demo Data ────────────────────────────────────────────

export const SKILLPASSPORT_VERIFICATION_MESSAGES: Record<string, string[]> = {
  scanning: [
    "Scanning workshop photos...",
    "Analyzing tool inventory...",
    "Detecting completed projects...",
    "Extracting workmanship quality...",
    "Verifying materials used...",
  ],
  evaluating: [
    "Cross-referencing with trade standards...",
    "Evaluating skill proficiency...",
    "Measuring experience consistency...",
    "Assessing complexity of work...",
    "Generating employability score...",
  ],
  grading: [
    "Assigning readiness badge...",
    "Calculating final verification score...",
    "Compiling SkillPassport dossier...",
    "Preparing employer summary...",
    "Finalizing assessment report...",
  ],
};

export const SKILLPASSPORT_DEMO_PORTFOLIO: SkillPassport = {
  id: "sp-001",
  userId: "user-1",
  artisanName: "Musa Ibrahim",
  trade: "Metal Fabrication & Welding",
  experienceEstimate: "12+ years",
  experienceYears: 12,
  skillRatings: [
    { name: "Welding", score: 94, color: "emerald" },
    { name: "Metal Cutting", score: 88, color: "blue" },
    { name: "Design", score: 76, color: "violet" },
    { name: "Finishing", score: 82, color: "amber" },
    { name: "Installation", score: 90, color: "cyan" },
  ],
  photos: [
    { id: "p-1", title: "Burglary-Proof Gate", url: "", aiLabels: ["Heavy-duty gate", "3mm steel", "Custom pattern"], aiConfidence: 96 },
    { id: "p-2", title: "Window Grills", url: "", aiLabels: ["Decorative grills", "Powder coated", "4 units"], aiConfidence: 92 },
    { id: "p-3", title: "Structural Steelwork", url: "", aiLabels: ["Beam framework", "Welded joints", "Industrial grade"], aiConfidence: 88 },
  ],
  voiceNote: {
    id: "vn-001",
    duration: 120,
    transcript: "I have been a metal fabricator for over 12 years. I specialize in custom gates, window grills, and structural steelwork. I have completed over 200 projects across Kano state.",
    createdAt: "2024-06-20T10:30:00Z",
  },
  testimonials: [
    "Musa delivered our main gate on time. The workmanship is excellent. — Alhaji Suleiman",
    "Very professional and detailed. Our window grills look beautiful. — Mrs. Okafor",
    "He welded our entire building framework. Solid work. — Engineer Mohammed",
  ],
  employmentGrade: "A+",
  employmentSummary: "Highly skilled metal fabricator with 12+ years of experience. Consistently delivers high-quality work with attention to detail. Suitable for commercial and residential projects requiring structural metalwork, custom fabrication, and installation.",
  readinessBadge: "Gold",
  createdAt: "2024-06-20T10:30:00Z",
  portfolioType: "welding",
};

export function generateDefaultSkillPassport(userName: string, trade: string): SkillPassport {
  return {
    ...SKILLPASSPORT_DEMO_PORTFOLIO,
    id: `sp-${generateId()}`,
    artisanName: userName,
    trade: trade || "Artisan",
    createdAt: new Date().toISOString(),
  };
}

export const PORTFOLIO_TYPES = [
  { id: "welding", label: "Metal Fabrication", icon: "Hammer" },
  { id: "tailoring", label: "Tailoring & Fashion", icon: "Scissors" },
  { id: "carpentry", label: "Carpentry & Woodwork", icon: "Square" },
  { id: "custom", label: "Other Trade", icon: "Wrench" },
];