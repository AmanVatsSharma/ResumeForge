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

  // Professional
  { id: "professional-basic", name: "Professional Basic", description: "Traditional ATS-optimized layout", category: "professional", premium: false, price: 0, preview: previewFor("professional-basic"), tags: ["ats", "classic"], componentKey: "professional" },
  { id: "professional-1", name: "Professional Two-Column", description: "Two-column with sidebar for skills & education", category: "professional", premium: true, price: 499, preview: previewFor("professional-1"), tags: ["two-column"], componentKey: "professional" },
  { id: "professional-2", name: "Professional Advanced", description: "Advanced layout with strong work history emphasis", category: "professional", premium: true, price: 499, preview: previewFor("professional-2"), tags: ["advanced"], componentKey: "professional" },
  { id: "professional-3", name: "Professional Compact", description: "Space-efficient without sacrificing readability", category: "professional", premium: true, price: 399, preview: previewFor("professional-3"), tags: ["compact"], componentKey: "professional" },

  // Creative
  { id: "creative-1", name: "Creative Classic", description: "Geometric accents with dynamic styling", category: "creative", premium: false, price: 0, preview: previewFor("creative-1"), tags: ["artistic"], componentKey: "creative" },
  { id: "creative-2", name: "Creative Portfolio Lite", description: "Showcase creative work with style", category: "creative", premium: false, price: 0, preview: previewFor("creative-2"), tags: ["portfolio"], componentKey: "creative" },
  { id: "creative-premium-1", name: "Creative Portfolio", description: "Premium artistic template with timeline view", category: "creative", premium: true, price: 499, preview: previewFor("creative-premium-1"), tags: ["portfolio", "bold"], componentKey: "creative" },
  { id: "creative-premium-2", name: "Creative Designer", description: "Custom accents and bold typography", category: "creative", premium: true, price: 599, preview: previewFor("creative-premium-2"), tags: ["designer"], componentKey: "creative" },
  { id: "creative-premium-3", name: "Creative Showcase", description: "Unique showcase with patterns & vibrant colors", category: "creative", premium: true, price: 699, preview: previewFor("creative-premium-3"), tags: ["showcase"], componentKey: "creative" },

  // Executive
  { id: "executive-1", name: "Executive Elite", description: "Sophisticated design for leadership roles", category: "executive", premium: true, price: 599, preview: previewFor("executive-1"), tags: ["leadership"], componentKey: "executive" },
  { id: "executive-2", name: "C‑Suite", description: "Premium layout for executives and directors", category: "executive", premium: true, price: 599, preview: previewFor("executive-2"), tags: ["c-suite"], componentKey: "executive" },
  { id: "executive-3", name: "Corporate Leadership", description: "Authority-forward professional executive template", category: "executive", premium: true, price: 599, preview: previewFor("executive-3"), tags: ["corporate"], componentKey: "executive" },

  // Elegant
  { id: "elegant-1", name: "Elegant Premium", description: "Luxurious accents and refined typography", category: "elegant", premium: true, price: 599, preview: previewFor("elegant-1"), tags: ["serif"], componentKey: "elegant" },
  { id: "elegant-2", name: "Elegant Serif", description: "Timeless elegance with classic serif", category: "elegant", premium: true, price: 599, preview: previewFor("elegant-2"), tags: ["classic"], componentKey: "elegant" },

  // Basic / Minimal
  { id: "basic-1", name: "Simple Clean", description: "No‑frills, straightforward layout", category: "basic", premium: false, price: 0, preview: previewFor("basic-1"), tags: ["simple"], componentKey: "base" },
  { id: "basic-2", name: "Entry Level", description: "Perfect for students and early careers", category: "basic", premium: false, price: 0, preview: previewFor("basic-2"), tags: ["student"], componentKey: "base" },
  { id: "minimal-1", name: "Minimal", description: "Simple and elegant design", category: "minimal", premium: false, price: 0, preview: previewFor("minimal-1"), tags: ["minimal"], componentKey: "modern" },
  { id: "minimal-2", name: "Clean Professional", description: "Clean, professional layout", category: "minimal", premium: false, price: 0, preview: previewFor("minimal-2"), tags: ["clean"], componentKey: "modern" },

  // Specialized
  { id: "tech-1", name: "Tech Specialist", description: "Optimized for developers and IT roles", category: "specialized", premium: true, price: 499, preview: previewFor("tech-1"), tags: ["developer", "it"], componentKey: "modern" },
  { id: "academic-1", name: "Academic CV", description: "Comprehensive layout for academia", category: "academic", premium: true, price: 499, preview: previewFor("academic-1"), tags: ["cv"], componentKey: "base" },
  { id: "medical-1", name: "Medical Professional", description: "For healthcare professionals", category: "specialized", premium: true, price: 599, preview: previewFor("medical-1"), tags: ["healthcare"], componentKey: "professional" },
  { id: "legal-1", name: "Legal Professional", description: "Tailored for legal roles", category: "specialized", premium: true, price: 599, preview: previewFor("legal-1"), tags: ["legal"], componentKey: "elegant" },
  { id: "consulting-1", name: "Management Consultant", description: "Strategic layout for consultants", category: "specialized", premium: true, price: 499, preview: previewFor("consulting-1"), tags: ["consulting"], componentKey: "executive" },

  // Business themed
  { id: "startup-1", name: "Startup Profile", description: "Modern, energetic layout for startups", category: "startup", premium: true, price: 399, preview: previewFor("startup-1"), tags: ["startup"], componentKey: "modern" },
  { id: "corporate-1", name: "Corporate Professional", description: "Traditional corporate style with modern elements", category: "corporate", premium: true, price: 499, preview: previewFor("corporate-1"), tags: ["corporate"], componentKey: "professional" },
  { id: "digital-creative-1", name: "Digital Creative", description: "Modern design for digital professionals", category: "digital", premium: true, price: 499, preview: previewFor("digital-creative-1"), tags: ["digital"], componentKey: "creative" },
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

