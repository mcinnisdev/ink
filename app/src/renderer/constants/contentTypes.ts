import {
  FileText,
  BookOpen,
  Users,
  Briefcase,
  MapPin,
  Star,
  Layout,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export interface ContentTypeInfo {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Included in the starter template by default */
  inStarter?: boolean;
}

export const CONTENT_TYPES: ContentTypeInfo[] = [
  {
    id: "blog",
    label: "Blog",
    description: "Posts with dates, categories, and author info",
    icon: FileText,
  },
  {
    id: "services",
    label: "Services",
    description: "Service offerings with descriptions and pricing",
    icon: Briefcase,
    inStarter: true,
  },
  {
    id: "team",
    label: "Team / Staff",
    description: "Team member profiles with photos and bios",
    icon: Users,
    inStarter: true,
  },
  {
    id: "docs",
    label: "Documentation",
    description: "Organized docs with sidebar navigation",
    icon: BookOpen,
  },
  {
    id: "features",
    label: "Features",
    description: "Product or service feature highlights",
    icon: Star,
  },
  {
    id: "service-areas",
    label: "Service Areas",
    description: "Location-based pages for local SEO",
    icon: MapPin,
  },
  {
    id: "portfolio",
    label: "Portfolio / Projects",
    description: "Showcase work with images and case studies",
    icon: Layout,
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Frequently asked questions organized by topic",
    icon: HelpCircle,
  },
];

/** Map from content type id to its info */
export const CONTENT_TYPE_MAP = Object.fromEntries(
  CONTENT_TYPES.map((t) => [t.id, t])
);
