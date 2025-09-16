// Centralized template catalog shared by client and server
// Contains only framework-agnostic metadata (no React components)

export type TemplateCategory =
  | "modern"
  | "professional"
  | "creative"
  | "executive"
  | "elegant"
  | "basic"
  | "specialized"
  | "minimal"
  | "technical"
  | "academic"
  | "startup"
  | "corporate"
  | "digital";

export interface TemplateMeta {
  id: string; // unique stable id, used across client/server
  name: string;
  description: string;
  category: TemplateCategory;
  premium: boolean;
  price: number; // price in INR (rupees), server converts to paise
  preview?: string; // absolute path under public (fallback applied client-side)
  tags?: string[];
  componentKey: "base" | "modern" | "creative" | "professional" | "executive" | "elegant";
}

// Helper to build preview URL from id
const previewFor = (id: string) => `/images/templates/${id}.svg`;

export const TEMPLATES: TemplateMeta[] = [
  // Modern
  { id: "modern-1", name: "Modern Professional", description: "Clean, contemporary design with customizable accents", category: "modern", premium: false, price: 0, preview: previewFor("modern-1"), tags: ["clean", "ats"], componentKey: "modern" },
  { id: "modern-2", name: "Modern Minimalist", description: "Sleek layout with ample whitespace", category: "modern", premium: false, price: 0, preview: previewFor("modern-2"), tags: ["minimal", "clean"], componentKey: "modern" },
  { id: "modern-3", name: "Modern Tech", description: "Great for technical roles; emphasizes skills & projects", category: "modern", premium: false, price: 0, preview: previewFor("modern-3"), tags: ["tech", "skills"], componentKey: "modern" },
  { id: "modern-4", name: "Modern Edge", description: "Bold accents with clean hierarchy", category: "modern", premium: false, price: 0, preview: previewFor("modern-4"), tags: ["bold", "clean"], componentKey: "modern" },
  { id: "modern-5", name: "Modern Grid", description: "Grid-based layout for high readability", category: "modern", premium: true, price: 399, preview: previewFor("modern-5"), tags: ["grid", "readable"], componentKey: "modern" },
  { id: "modern-6", name: "Neo Modern", description: "Vibrant accents and spacious sections", category: "modern", premium: true, price: 499, preview: previewFor("modern-6"), tags: ["vibrant"], componentKey: "modern" },
  { id: "modern-7", name: "Modern Timeline", description: "Highlight career via timeline visuals", category: "modern", premium: true, price: 499, preview: previewFor("modern-7"), tags: ["timeline"], componentKey: "modern" },
  { id: "modern-8", name: "Modern Subtle", description: "Understated design for conservative roles", category: "modern", premium: false, price: 0, preview: previewFor("modern-8"), tags: ["subtle"], componentKey: "modern" },
  { id: "modern-9", name: "Modern Accent Bar", description: "Accent sidebar with quick facts", category: "modern", premium: true, price: 399, preview: previewFor("modern-9"), tags: ["sidebar"], componentKey: "modern" },
  { id: "modern-10", name: "Modern Executive", description: "Executive-friendly variant of modern", category: "modern", premium: true, price: 599, preview: previewFor("modern-10"), tags: ["executive"], componentKey: "modern" },

  // Professional
  { id: "professional-basic", name: "Professional Basic", description: "Traditional ATS-optimized layout", category: "professional", premium: false, price: 0, preview: previewFor("professional-basic"), tags: ["ats", "classic"], componentKey: "professional" },
  { id: "professional-1", name: "Professional Two-Column", description: "Two-column with sidebar for skills & education", category: "professional", premium: true, price: 499, preview: previewFor("professional-1"), tags: ["two-column"], componentKey: "professional" },
  { id: "professional-2", name: "Professional Advanced", description: "Advanced layout with strong work history emphasis", category: "professional", premium: true, price: 499, preview: previewFor("professional-2"), tags: ["advanced"], componentKey: "professional" },
  { id: "professional-3", name: "Professional Compact", description: "Space-efficient without sacrificing readability", category: "professional", premium: true, price: 399, preview: previewFor("professional-3"), tags: ["compact"], componentKey: "professional" },
  { id: "professional-4", name: "Professional Classic", description: "Classic header with refined typography", category: "professional", premium: true, price: 399, preview: previewFor("professional-4"), tags: ["classic"], componentKey: "professional" },
  { id: "professional-5", name: "Professional Focus", description: "Focus on measurable achievements", category: "professional", premium: true, price: 499, preview: previewFor("professional-5"), tags: ["achievements"], componentKey: "professional" },
  { id: "professional-6", name: "Professional Sidebar", description: "Left sidebar for skills/tools", category: "professional", premium: true, price: 499, preview: previewFor("professional-6"), tags: ["sidebar"], componentKey: "professional" },
  { id: "professional-7", name: "Professional Elegant", description: "Soft accents with balanced whitespace", category: "professional", premium: true, price: 599, preview: previewFor("professional-7"), tags: ["elegant"], componentKey: "professional" },
  { id: "professional-8", name: "Professional Minimal", description: "Minimalist professional for ATS", category: "professional", premium: false, price: 0, preview: previewFor("professional-8"), tags: ["minimal", "ats"], componentKey: "professional" },
  { id: "professional-9", name: "Professional Matrix", description: "Matrix sections for multi-role careers", category: "professional", premium: true, price: 599, preview: previewFor("professional-9"), tags: ["matrix"], componentKey: "professional" },
  { id: "professional-10", name: "Professional Board", description: "Board-ready layout with gravitas", category: "professional", premium: true, price: 699, preview: previewFor("professional-10"), tags: ["board"], componentKey: "professional" },

  // Creative
  { id: "creative-1", name: "Creative Classic", description: "Geometric accents with dynamic styling", category: "creative", premium: false, price: 0, preview: previewFor("creative-1"), tags: ["artistic"], componentKey: "creative" },
  { id: "creative-2", name: "Creative Portfolio Lite", description: "Showcase creative work with style", category: "creative", premium: false, price: 0, preview: previewFor("creative-2"), tags: ["portfolio"], componentKey: "creative" },
  { id: "creative-premium-1", name: "Creative Portfolio", description: "Premium artistic template with timeline view", category: "creative", premium: true, price: 499, preview: previewFor("creative-premium-1"), tags: ["portfolio", "bold"], componentKey: "creative" },
  { id: "creative-premium-2", name: "Creative Designer", description: "Custom accents and bold typography", category: "creative", premium: true, price: 599, preview: previewFor("creative-premium-2"), tags: ["designer"], componentKey: "creative" },
  { id: "creative-premium-3", name: "Creative Showcase", description: "Unique showcase with patterns & vibrant colors", category: "creative", premium: true, price: 699, preview: previewFor("creative-premium-3"), tags: ["showcase"], componentKey: "creative" },
  { id: "creative-3", name: "Creative Mono", description: "Monochrome artistic emphasis", category: "creative", premium: false, price: 0, preview: previewFor("creative-3"), tags: ["mono"], componentKey: "creative" },
  { id: "creative-4", name: "Creative Gradient", description: "Soft gradients with bold headings", category: "creative", premium: true, price: 499, preview: previewFor("creative-4"), tags: ["gradient"], componentKey: "creative" },
  { id: "creative-5", name: "Creative Cards", description: "Card-based sections for visual scanning", category: "creative", premium: true, price: 499, preview: previewFor("creative-5"), tags: ["cards"], componentKey: "creative" },
  { id: "creative-6", name: "Creative Linework", description: "Line accents to guide the eye", category: "creative", premium: true, price: 599, preview: previewFor("creative-6"), tags: ["line"], componentKey: "creative" },
  { id: "creative-7", name: "Creative Photo Header", description: "Optional avatar and standout header", category: "creative", premium: true, price: 599, preview: previewFor("creative-7"), tags: ["avatar"], componentKey: "creative" },
  { id: "creative-8", name: "Creative Studio", description: "Designer portfolio-focused resume", category: "creative", premium: true, price: 699, preview: previewFor("creative-8"), tags: ["portfolio"], componentKey: "creative" },

  // Executive
  { id: "executive-1", name: "Executive Elite", description: "Sophisticated design for leadership roles", category: "executive", premium: true, price: 599, preview: previewFor("executive-1"), tags: ["leadership"], componentKey: "executive" },
  { id: "executive-2", name: "C‑Suite", description: "Premium layout for executives and directors", category: "executive", premium: true, price: 599, preview: previewFor("executive-2"), tags: ["c-suite"], componentKey: "executive" },
  { id: "executive-3", name: "Corporate Leadership", description: "Authority-forward professional executive template", category: "executive", premium: true, price: 599, preview: previewFor("executive-3"), tags: ["corporate"], componentKey: "executive" },
  { id: "executive-4", name: "Executive Heritage", description: "Traditional executive with prestige cues", category: "executive", premium: true, price: 699, preview: previewFor("executive-4"), tags: ["traditional"], componentKey: "executive" },
  { id: "executive-5", name: "Executive Modern", description: "Contemporary executive profile", category: "executive", premium: true, price: 699, preview: previewFor("executive-5"), tags: ["modern"], componentKey: "executive" },
  { id: "executive-6", name: "Executive Compact", description: "Concise yet authoritative", category: "executive", premium: true, price: 599, preview: previewFor("executive-6"), tags: ["compact"], componentKey: "executive" },

  // Elegant
  { id: "elegant-1", name: "Elegant Premium", description: "Luxurious accents and refined typography", category: "elegant", premium: true, price: 599, preview: previewFor("elegant-1"), tags: ["serif"], componentKey: "elegant" },
  { id: "elegant-2", name: "Elegant Serif", description: "Timeless elegance with classic serif", category: "elegant", premium: true, price: 599, preview: previewFor("elegant-2"), tags: ["classic"], componentKey: "elegant" },
  { id: "elegant-3", name: "Elegant Ivory", description: "Ivory accents with refined spacing", category: "elegant", premium: true, price: 599, preview: previewFor("elegant-3"), tags: ["ivory"], componentKey: "elegant" },
  { id: "elegant-4", name: "Elegant Gold", description: "Subtle gold highlights for premium feel", category: "elegant", premium: true, price: 699, preview: previewFor("elegant-4"), tags: ["gold"], componentKey: "elegant" },
  { id: "elegant-5", name: "Elegant Slate", description: "Slate tones with balanced typographic scale", category: "elegant", premium: true, price: 599, preview: previewFor("elegant-5"), tags: ["slate"], componentKey: "elegant" },

  // Basic / Minimal
  { id: "basic-1", name: "Simple Clean", description: "No‑frills, straightforward layout", category: "basic", premium: false, price: 0, preview: previewFor("basic-1"), tags: ["simple"], componentKey: "base" },
  { id: "basic-2", name: "Entry Level", description: "Perfect for students and early careers", category: "basic", premium: false, price: 0, preview: previewFor("basic-2"), tags: ["student"], componentKey: "base" },
  { id: "minimal-1", name: "Minimal", description: "Simple and elegant design", category: "minimal", premium: false, price: 0, preview: previewFor("minimal-1"), tags: ["minimal"], componentKey: "modern" },
  { id: "minimal-2", name: "Clean Professional", description: "Clean, professional layout", category: "minimal", premium: false, price: 0, preview: previewFor("minimal-2"), tags: ["clean"], componentKey: "modern" },
  { id: "basic-3", name: "Straightforward", description: "Straightforward chronological resume", category: "basic", premium: false, price: 0, preview: previewFor("basic-3"), tags: ["chronological"], componentKey: "base" },
  { id: "basic-4", name: "Concise", description: "Concise resume with essentials only", category: "basic", premium: false, price: 0, preview: previewFor("basic-4"), tags: ["concise"], componentKey: "base" },
  { id: "basic-5", name: "Student Focus", description: "Student-first layout with projects", category: "basic", premium: false, price: 0, preview: previewFor("basic-5"), tags: ["student", "projects"], componentKey: "base" },
  { id: "basic-6", name: "Fresher Launch", description: "Entry resume for first-time job seekers", category: "basic", premium: false, price: 0, preview: previewFor("basic-6"), tags: ["entry"], componentKey: "base" },
  { id: "minimal-3", name: "Minimal Lines", description: "Hairline separators; ATS-safe", category: "minimal", premium: false, price: 0, preview: previewFor("minimal-3"), tags: ["lines", "ats"], componentKey: "modern" },
  { id: "minimal-4", name: "Minimal Executive", description: "Minimal layout tuned for exec roles", category: "minimal", premium: true, price: 599, preview: previewFor("minimal-4"), tags: ["executive"], componentKey: "modern" },
  { id: "minimal-5", name: "Minimal Accent", description: "Single accent color; clean grid", category: "minimal", premium: true, price: 399, preview: previewFor("minimal-5"), tags: ["accent"], componentKey: "modern" },

  // Specialized
  { id: "tech-1", name: "Tech Specialist", description: "Optimized for developers and IT roles", category: "specialized", premium: true, price: 499, preview: previewFor("tech-1"), tags: ["developer", "it"], componentKey: "modern" },
  { id: "academic-1", name: "Academic CV", description: "Comprehensive layout for academia", category: "academic", premium: true, price: 499, preview: previewFor("academic-1"), tags: ["cv"], componentKey: "base" },
  { id: "medical-1", name: "Medical Professional", description: "For healthcare professionals", category: "specialized", premium: true, price: 599, preview: previewFor("medical-1"), tags: ["healthcare"], componentKey: "professional" },
  { id: "legal-1", name: "Legal Professional", description: "Tailored for legal roles", category: "specialized", premium: true, price: 599, preview: previewFor("legal-1"), tags: ["legal"], componentKey: "elegant" },
  { id: "consulting-1", name: "Management Consultant", description: "Strategic layout for consultants", category: "specialized", premium: true, price: 499, preview: previewFor("consulting-1"), tags: ["consulting"], componentKey: "executive" },
  { id: "tech-2", name: "Full‑Stack Developer", description: "Projects-forward tech layout", category: "specialized", premium: true, price: 499, preview: previewFor("tech-2"), tags: ["fullstack", "projects"], componentKey: "modern" },
  { id: "tech-3", name: "Data Engineer", description: "Emphasize pipelines & tooling", category: "specialized", premium: true, price: 499, preview: previewFor("tech-3"), tags: ["data", "etl"], componentKey: "modern" },
  { id: "tech-4", name: "ML Engineer", description: "Models, metrics, and impact", category: "specialized", premium: true, price: 599, preview: previewFor("tech-4"), tags: ["ml", "ai"], componentKey: "modern" },
  { id: "tech-5", name: "DevOps/SRE", description: "Reliability, automation, and SLOs", category: "specialized", premium: true, price: 499, preview: previewFor("tech-5"), tags: ["devops", "sre"], componentKey: "modern" },
  { id: "data-1", name: "Data Analyst", description: "Dashboards, SQL, and insights", category: "specialized", premium: true, price: 399, preview: previewFor("data-1"), tags: ["analyst"], componentKey: "professional" },
  { id: "sales-1", name: "Sales Professional", description: "Quotas, wins, and pipeline", category: "specialized", premium: true, price: 399, preview: previewFor("sales-1"), tags: ["sales"], componentKey: "professional" },
  { id: "marketing-1", name: "Marketing Strategist", description: "Campaigns, growth, and brand", category: "specialized", premium: true, price: 399, preview: previewFor("marketing-1"), tags: ["marketing"], componentKey: "creative" },
  { id: "product-1", name: "Product Manager", description: "Roadmaps, outcomes, and leadership", category: "specialized", premium: true, price: 599, preview: previewFor("product-1"), tags: ["product"], componentKey: "executive" },
  { id: "hr-1", name: "HR Generalist", description: "People ops and compliance", category: "specialized", premium: true, price: 399, preview: previewFor("hr-1"), tags: ["hr"], componentKey: "professional" },
  { id: "ops-1", name: "Operations Manager", description: "Process, cost, and KPIs", category: "specialized", premium: true, price: 399, preview: previewFor("ops-1"), tags: ["operations"], componentKey: "professional" },
  { id: "finance-1", name: "Finance Analyst", description: "Modeling, FP&A, and audit", category: "specialized", premium: true, price: 399, preview: previewFor("finance-1"), tags: ["finance"], componentKey: "professional" },
  { id: "teacher-1", name: "Teacher", description: "Education-focused achievements", category: "specialized", premium: true, price: 299, preview: previewFor("teacher-1"), tags: ["education"], componentKey: "base" },
  { id: "academic-2", name: "Academic Researcher", description: "Publications, grants, and service", category: "academic", premium: true, price: 499, preview: previewFor("academic-2"), tags: ["research"], componentKey: "base" },
  { id: "academic-3", name: "Academic Lecturer", description: "Teaching, curricula, and awards", category: "academic", premium: true, price: 499, preview: previewFor("academic-3"), tags: ["lecturer"], componentKey: "base" },
  { id: "medical-2", name: "Nurse", description: "Patient care and certifications", category: "specialized", premium: true, price: 399, preview: previewFor("medical-2"), tags: ["nurse"], componentKey: "professional" },
  { id: "medical-3", name: "Physician", description: "Clinical experience and research", category: "specialized", premium: true, price: 599, preview: previewFor("medical-3"), tags: ["physician"], componentKey: "professional" },
  { id: "legal-2", name: "Corporate Lawyer", description: "Transactions and counsel", category: "specialized", premium: true, price: 599, preview: previewFor("legal-2"), tags: ["law"], componentKey: "elegant" },
  { id: "consulting-2", name: "Strategy Consultant", description: "Case impact and client value", category: "specialized", premium: true, price: 599, preview: previewFor("consulting-2"), tags: ["strategy"], componentKey: "executive" },

  // Business themed
  { id: "startup-1", name: "Startup Profile", description: "Modern, energetic layout for startups", category: "startup", premium: true, price: 399, preview: previewFor("startup-1"), tags: ["startup"], componentKey: "modern" },
  { id: "corporate-1", name: "Corporate Professional", description: "Traditional corporate style with modern elements", category: "corporate", premium: true, price: 499, preview: previewFor("corporate-1"), tags: ["corporate"], componentKey: "professional" },
  { id: "digital-creative-1", name: "Digital Creative", description: "Modern design for digital professionals", category: "digital", premium: true, price: 499, preview: previewFor("digital-creative-1"), tags: ["digital"], componentKey: "creative" },
  { id: "startup-2", name: "Startup Ops", description: "Operator profile for early-stage", category: "startup", premium: true, price: 399, preview: previewFor("startup-2"), tags: ["ops"], componentKey: "modern" },
  { id: "startup-3", name: "Startup Engineer", description: "Owner-operator engineering", category: "startup", premium: true, price: 399, preview: previewFor("startup-3"), tags: ["engineering"], componentKey: "modern" },
  { id: "corporate-2", name: "Corporate Analyst", description: "Enterprise-grade professional format", category: "corporate", premium: true, price: 499, preview: previewFor("corporate-2"), tags: ["analyst"], componentKey: "professional" },
  { id: "corporate-3", name: "Corporate Manager", description: "Leadership-forward corporate style", category: "corporate", premium: true, price: 599, preview: previewFor("corporate-3"), tags: ["manager"], componentKey: "professional" },
  { id: "digital-creative-2", name: "Digital Creator", description: "Content, social, and growth", category: "digital", premium: true, price: 399, preview: previewFor("digital-creative-2"), tags: ["creator"], componentKey: "creative" },
  { id: "digital-creative-3", name: "UX/UI Designer", description: "Case studies and outcomes", category: "digital", premium: true, price: 499, preview: previewFor("digital-creative-3"), tags: ["ux", "ui"], componentKey: "creative" },
  { id: "digital-creative-4", name: "Growth Marketer", description: "Experiments and lift", category: "digital", premium: true, price: 399, preview: previewFor("digital-creative-4"), tags: ["growth"], componentKey: "creative" },
];

// Index by id
export const TEMPLATE_MAP: Record<string, TemplateMeta> = Object.fromEntries(
  TEMPLATES.map(t => [t.id, t])
);

export const TEMPLATE_CATEGORIES: TemplateCategory[] = Array.from(
  new Set(TEMPLATES.map(t => t.category))
) as TemplateCategory[];

export const SUBSCRIPTION_PRICE_RUPEES = 999;

export function getTemplateMeta(templateId: string): TemplateMeta | undefined {
  return TEMPLATE_MAP[templateId];
}

export function getTemplatePriceRupees(templateId: string): number {
  return TEMPLATE_MAP[templateId]?.price ?? 0;
}

export function isTemplateIdPremium(templateId: string): boolean {
  return TEMPLATE_MAP[templateId]?.premium ?? false;
}

