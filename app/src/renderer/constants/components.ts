export interface ComponentInfo {
  id: string;
  label: string;
  description: string;
}

export const COMPONENTS: ComponentInfo[] = [
  {
    id: "contact-form",
    label: "Contact Form",
    description: "Styled form with Formspree/Netlify support and validation",
  },
  {
    id: "feature-grid",
    label: "Feature Grid",
    description: "2-4 column grid with icon, title, and description",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Customer quotes with optional star ratings and photos",
  },
  {
    id: "pricing-table",
    label: "Pricing Table",
    description: "Tiered pricing comparison cards with feature lists",
  },
  {
    id: "stats-counter",
    label: "Stats Counter",
    description: "Animated number counters for key metrics",
  },
  {
    id: "image-gallery",
    label: "Image Gallery",
    description: "Responsive grid with lightbox support",
  },
  {
    id: "tabs",
    label: "Tabs",
    description: "Tabbed content panels with accessible markup",
  },
  {
    id: "logo-cloud",
    label: "Logo Cloud",
    description: "Partner or client logo display grid",
  },
  {
    id: "newsletter-signup",
    label: "Newsletter Signup",
    description: "Email capture form with validation",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Vertical timeline for history or process steps",
  },
  {
    id: "modal",
    label: "Modal",
    description: "Accessible dialog overlay component",
  },
  {
    id: "social-share",
    label: "Social Share",
    description: "Share buttons for social media platforms",
  },
];
