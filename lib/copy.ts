// Every word on the site lives here. Metadata, JSON-LD, and components all
// render from this file; edit copy here, never in components.

export const site = {
  url: "https://merigaud.com",
  name: "Dylan Mérigaud",
  title: "Dylan Mérigaud | Freelance AI Full-Stack Engineer, Fintech",
  description:
    "Dylan Mérigaud, freelance AI full-stack engineer for fintech: AP automation, invoice extraction, approval workflows, agents, evals. 9 years in startups.",
  ogTitle: "Dylan Mérigaud, freelance AI engineer for fintech",
  email: "dylan@merigaud.com",
  links: {
    linkedin: "https://www.linkedin.com/in/dylanmerigaud",
    github: "https://github.com/DylanMerigaud",
    npm: "https://www.npmjs.com/~dylanmerigaud",
    calendly: "https://calendly.com/dylanmerigaud-pro/intro",
  },
} as const;

export const hero = {
  eyebrow: "Dylan Mérigaud · Freelance AI\u{A0}Engineer\u{A0}·\u{A0}Fintech",
  h1Line1: "Code decides the money.",
  h1Line2: "AI reads the mess.",
  sub: "I ship the AI and the product around it: orchestration, integrations, evals, the parts that survive real usage. 9 years full-stack, ex-Pivot (procurement fintech).",
  ctaEmailLabel: "dylan@merigaud.com",
  ctaWorkLabel: "See the work",
  scrollCue: "scroll · trace begins",
  videoPause: "Pause video",
  videoPlay: "Play video",
} as const;

type WorkLink = {
  label: string;
  href: string;
};

export type WorkItem = {
  stage: string;
  index: string;
  slug: string;
  title: string;
  lead: string;
  body: string[];
  links: WorkLink[];
  tags: string[];
  figure: {
    kind: "image" | "video";
    src: string;
    poster?: string;
    width: number;
    height: number;
    alt: string;
    caption: string;
  };
};

export const workSection = {
  eyebrow: "the trace",
  heading: "Selected work",
  intro: "Three public reference systems. Every demo is live; every repo is open.",
} as const;

export const work: WorkItem[] = [
  {
    stage: "match",
    index: "01",
    slug: "ledgerloop",
    title: "ledgerloop",
    lead: "An agent reads a company's HRIS and derives the whole approval workflow. Then invoices route through it.",
    body: [
      "A vendor PDF is extracted by a vision model, matched 2/3-way against open purchase orders captured from a live QuickBooks org, and routed through an approval DAG derived from real BambooHR data. Nobody draws a workflow canvas: the agent derives it from the org chart and you maintain it in plain language.",
      "AI sits only where it earns its keep: reading messy documents, mapping org titles to signing authority, investigating flagged exceptions. The money path is deterministic, unit-tested code, and nothing posts before a human approves. Every run lands as an append-only audit row, replayable with zero tokens. Swap the QuickBooks adapter for NetSuite and nothing downstream changes.",
    ],
    links: [
      { label: "Case study", href: "/work/ledgerloop" },
      { label: "Live demo", href: "https://ledgerloop-eta.vercel.app/" },
      { label: "GitHub", href: "https://github.com/DylanMerigaud/ledgerloop" },
    ],
    tags: ["Mastra", "Next.js", "TypeScript strict", "Zod", "Drizzle", "QuickBooks", "BambooHR"],
    figure: {
      kind: "image",
      src: "/work/ledgerloop.png",
      width: 2000,
      height: 1023,
      alt: "ledgerloop live demo: an invoice run traversing a derived approval workflow, with the execution trace panel open",
      caption: "fig. 01 · derived approval DAG · ledgerloop",
    },
  },
  {
    stage: "route",
    index: "02",
    slug: "approvals-ui",
    title: "approvals-ui",
    lead: "The approval workflow screen, as shadcn components.",
    body: [
      "Quorum gates, amount thresholds, a policy lint that knows what segregation of duties means, and plain-language editing where a human reviews the diff before anything lands. One command and the code lands in your project, yours to edit. Built on react-flow-auto-layout, my published npm package that lays out React Flow graphs the way dagre should.",
    ],
    links: [
      { label: "Case study", href: "/work/approvals-ui" },
      { label: "Live playground", href: "https://approvals-ui.vercel.app" },
      { label: "GitHub", href: "https://github.com/DylanMerigaud/approvals-ui" },
      { label: "npm", href: "https://www.npmjs.com/package/react-flow-auto-layout" },
    ],
    tags: ["shadcn registry", "React Flow", "react-flow-auto-layout"],
    figure: {
      kind: "video",
      src: "/work/approvals-ui.mp4",
      poster: "/work/approvals-ui-poster.jpg",
      width: 1280,
      height: 820,
      alt: "Typing a plain-language rule adds a CFO gate to the approval workflow canvas, with a reviewed diff before it lands",
      caption: "fig. 02 · plain-language edit · approvals-ui",
    },
  },
  {
    stage: "audit",
    index: "03",
    slug: "fintech-roast",
    title: "fintech-roast",
    lead: "An agent that roasts the code that touches money.",
    body: [
      "A rulebook of 41 researched rules across 10 domains, applied per-language to TypeScript, Python, and Java, with every finding adversarially verified before it is reported. Read-only: it never edits your code. 53 findings on the planted-bug fixture. Run it on your own repo in two commands.",
    ],
    links: [
      { label: "Case study", href: "/work/fintech-roast" },
      { label: "GitHub", href: "https://github.com/DylanMerigaud/fintech-roast" },
      {
        label: "Sample report",
        href: "https://github.com/DylanMerigaud/fintech-roast/blob/main/docs/sample-report.md",
      },
    ],
    tags: ["Claude Code plugin", "41 rules", "read-only"],
    figure: {
      kind: "video",
      src: "/work/fintech-roast.mp4",
      poster: "/work/fintech-roast-poster.jpg",
      width: 1184,
      height: 840,
      alt: "fintech-roast running over its eval fixture and reporting verified findings with rule ids and file lines",
      caption: "fig. 03 · verified findings · fintech-roast",
    },
  },
];

export const workMore = {
  label: "also in the trace",
  text: "AI Invoice Parser, a schema-validated extraction demo with an eval harness across 9 messy real-world formats.",
  links: [
    { label: "Live demo", href: "https://ai-invoice-parser-rho.vercel.app/" },
    { label: "GitHub", href: "https://github.com/DylanMerigaud/ai-invoice-parser" },
  ],
} as const;

export const experience = {
  stage: "trace",
  index: "04",
  eyebrow: "nine years of runs",
  heading: "Experience",
  rows: [
    {
      label: "Pivot · procurement fintech, Paris",
      text: "Shipped the PO approval flow and the NetSuite integration. Cut client onboarding time by 90%.",
    },
    {
      label: "Neige · founder",
      text: "AI content-generation pipeline. Empty repo to production, solo.",
    },
    {
      label: "Runtime · 9 years",
      text: "Full-stack, exclusively in startups and scale-ups.",
    },
  ],
} as const;

export const approach = {
  stage: "policy",
  index: "05",
  eyebrow: "no llm on amounts",
  heading: "How I build AI for fintech",
  pullBefore: "An LLM",
  pullNever: "never",
  pullAfter: "decides a payment amount.",
  text: "Deterministic where it must be, agentic only where the trajectory is genuinely open-ended. AI reads the documents, derives the workflows, and investigates the exceptions. Code moves the money.",
  stack: [
    "Next.js",
    "TypeScript",
    "Node",
    "Python / FastAPI",
    "Postgres",
    "Supabase",
    "Mastra",
    "OpenAI & Anthropic APIs",
  ],
} as const;

export const contact = {
  stage: "approve",
  index: "06",
  eyebrow: "let's talk",
  heading: "Building AI into a fintech product? Let's talk.",
  ctaEmailLabel: "dylan@merigaud.com",
  ctaCallLabel: "Book 30 min",
  location:
    "Remote from Mexico City, working US hours (GMT-6). On-site in NY/SF for key milestones. Paris available too.",
  stamp: "APPROVED",
  stampNote: "trace complete · human approved",
} as const;

export const footer = {
  note: "© 2026 Dylan Mérigaud",
  links: [
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "GitHub", href: site.links.github },
    { label: "npm", href: site.links.npm },
    { label: "Calendly", href: site.links.calendly },
  ],
} as const;

export const notFound = {
  eyebrow: "404 · rejected",
  heading: "This route was never approved.",
  cta: "Back to the trace",
} as const;

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      dateModified: "2026-07-23",
      mainEntity: {
        "@type": "Person",
        "@id": `${site.url}/#person`,
        name: "Dylan Mérigaud",
        alternateName: "Dylan Merigaud",
        jobTitle: "Freelance AI Full-Stack Engineer",
        url: site.url,
        image: `${site.url}/og.jpg`,
        email: `mailto:${site.email}`,
        knowsAbout: [
          "AI integration",
          "AP automation",
          "Invoice data extraction",
          "Approval workflows",
          "LLM evals",
          "Fintech",
          "Next.js",
          "TypeScript",
        ],
        workLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Mexico City",
            addressCountry: "MX",
          },
        },
        sameAs: [site.links.linkedin, site.links.github, site.links.npm],
      },
    },
    {
      "@type": "WebSite",
      name: "Dylan Mérigaud",
      url: site.url,
    },
  ],
} as const;
