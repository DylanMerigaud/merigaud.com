// The site's copy and structured data. Metadata, JSON-LD, and the home-page
// components render from here; edit copy here, never in components. The longer
// case-study prose lives in lib/work-pages.ts.

export const site = {
  url: "https://dylan.merigaud.com",
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

// What the hero's live run prints once the invoice clears, and what the social
// poster freezes as its proof line. Shared so the two can never disagree.
export const runReceipt = {
  vendor: "NORDWIND SUPPLY",
  amount: "$48,250.00 · NET 30",
  approved: "APPROVED · human in the loop",
} as const;

export type WorkLink = {
  label: string;
  href: string;
};

// The one rule for the primary CTA: the clickable live demo is the shortest
// trust path, so it becomes the single filled button (everything else stays a
// quiet text link). Shared by the work list and the case page so they can never
// disagree on which link is primary.
export const primaryLink = (links: readonly WorkLink[]): WorkLink | undefined =>
  links.find((link) => /demo|playground/i.test(link.label));

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
  intro: "Three public reference systems. Live where a browser can show it, every repo open.",
} as const;

export const work: WorkItem[] = [
  {
    stage: "match",
    index: "A",
    slug: "ledgerloop",
    title: "ledgerloop",
    lead: "An agent reads a company's HRIS and derives the whole approval workflow. Then invoices route through it.",
    body: [
      "A vendor PDF is extracted by a vision model, matched 2/3-way against open purchase orders captured from a live QuickBooks org, and routed through an approval DAG derived from real BambooHR data. Nobody draws a workflow canvas: the agent derives it from the org chart and you maintain it in plain language.",
      "AI sits only where it earns its keep: reading messy documents, mapping org titles to signing authority, investigating flagged exceptions. The money path is deterministic, unit-tested code, and nothing posts before a human approves. Every run lands as an append-only audit row, replayable with zero tokens. Swap the QuickBooks adapter for NetSuite and nothing downstream changes.",
    ],
    links: [
      { label: "Case study", href: "/work/ledgerloop" },
      { label: "Live demo", href: "https://ledgerloop.merigaud.com/" },
      { label: "GitHub", href: "https://github.com/DylanMerigaud/ledgerloop" },
    ],
    tags: ["Mastra", "Next.js", "TypeScript strict", "Zod", "Drizzle", "QuickBooks", "BambooHR"],
    figure: {
      kind: "image",
      src: "/work/ledgerloop-dag.png",
      width: 810,
      height: 280,
      alt: "The approval workflow ledgerloop derived from a client HRIS: manager review by Riley Carter for anything over 1,000 dollars, director review by Cameron Diaz over 10,000, department head review by Sam Patel on product only, then the bill posts to NetSuite",
      caption: "fig. 01 · derived approval DAG · ledgerloop",
    },
  },
  {
    stage: "route",
    index: "B",
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
    index: "C",
    slug: "fintech-roast",
    title: "fintech-roast",
    lead: "An agent that roasts the code that touches money.",
    body: [
      "A rulebook of 41 researched rules across 10 domains, from ledger integrity and rounding to FX, tax, webhooks, and time, applied per-language to TypeScript, Python, and Java, with every finding adversarially verified before it is reported. Read-only: it never edits your code. Run it on your own repo in two commands.",
    ],
    links: [
      { label: "Case study", href: "/work/fintech-roast" },
      { label: "GitHub", href: "https://github.com/DylanMerigaud/fintech-roast" },
      {
        label: "Bug found in Medusa",
        href: "https://github.com/medusajs/medusa/issues/16012",
      },
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
    { label: "Live demo", href: "https://invoice-parser.merigaud.com/" },
    { label: "GitHub", href: "https://github.com/DylanMerigaud/ai-invoice-parser" },
  ],
} as const;

export const testimonials = {
  eyebrow: "vouched for",
  heading: "People who shipped with me at Pivot",
  quotes: [
    {
      quote:
        "Dylan doesn't just write code, he thinks strategically about the user experience, business goals, and long-term scalability. He's the kind of engineer who proactively identifies problems before they arise, suggests smart solutions, and executes with precision.",
      name: "Christian Hamelin",
      title: "Co-founder @ Sprout",
      avatar: "/testimonials/christian.jpg",
    },
    {
      quote:
        "His full-stack expertise and sharp product sense made a real difference. He has this rare ability to switch effortlessly between backend and frontend, always spotting potential issues early and offering smart, pragmatic fixes.",
      name: "Reda Benchraa",
      title: "Senior Software Engineer",
      avatar: "/testimonials/reda.jpg",
    },
    {
      quote:
        "Dylan combines incredible speed of execution with a laser focus on quality: he gets things done fast, and he gets them done right. What really sets him apart is his strong customer-first mentality.",
      name: "Pascal Greilich",
      title: "Software Engineer",
      avatar: "/testimonials/pascal.jpg",
    },
  ],
} as const;

export const experience = {
  stage: "trace",
  index: "01",
  eyebrow: "nine years of runs",
  heading: "Experience",
  rows: [
    {
      label: "Pivot · procurement fintech, Paris",
      text: "Shipped the PO approval flow and the NetSuite integration. Cut client onboarding time ~90% by automating the approval setup.",
    },
    {
      label: "Neige · founder",
      text: "Fintech consulting and software production. Empty repo to revenue, solo.",
    },
    {
      label: "Runtime · 9 years",
      text: "Full-stack, exclusively in startups and scale-ups.",
    },
  ],
} as const;

export const approach = {
  stage: "policy",
  index: "02",
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

export const engagement = {
  stage: "scope",
  index: "04",
  eyebrow: "how we start",
  heading: "Work with me",
  rows: [
    {
      title: "Start with a paid pilot.",
      body: "One scoped problem, a fixed one to three week sprint, a deliverable you run in your own repo. Low risk for you, fast proof for both of us. It grows into a larger build or it doesn't, and either way the work is yours to keep.",
    },
    {
      title: "A bridge while you hire.",
      body: "A senior hire takes months to land. I ship the AI piece that can't wait now, on a defined scope, while you run the search. The contract ends whenever you want it to. Open to a permanent role later if it clicks on both sides.",
    },
    {
      title: "Available now.",
      body: "Remote, working US hours with full overlap, on-site in NY or SF for key milestones, Paris too. Fixed-scope pilots and two to four week builds.",
    },
  ],
  pricing: "Pilots and builds are fixed-price, hourly for open-ended work, rates on the call.",
} as const;

export const contact = {
  stage: "approve",
  index: "05",
  eyebrow: "let's talk",
  heading: "Building AI into a fintech product? Let's talk.",
  ctaEmailLabel: "dylan@merigaud.com",
  ctaCallLabel: "Book 30 min",
  location: "Remote, working US hours. On-site in NY/SF for key milestones. Paris available too.",
  stamp: "APPROVED",
  stampNote: "trace complete · human approved",
  // The face under the stamp: the note says a human approved the run, this says
  // which one. Last thing seen before the email button.
  portrait: {
    src: "/portrait.jpg",
    width: 720,
    height: 900,
    alt: "Dylan Mérigaud",
    name: "Dylan Mérigaud",
    role: "freelance ai engineer",
  },
} as const;

export const footer = {
  note: "© 2026 Dylan Mérigaud",
  links: [
    { label: "Notes", href: "/blog" },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "GitHub", href: site.links.github },
    { label: "npm", href: site.links.npm },
    { label: "Calendly", href: site.links.calendly },
    { label: "Privacy", href: "/privacy" },
  ],
} as const;

export const notFound = {
  eyebrow: "404 · rejected",
  heading: "This route was never approved.",
  cta: "Back to the trace",
} as const;

// components/consent-banner.tsx renders this; it never authors copy itself.
export const consentBanner = {
  text: "This site uses cookies for analytics.",
  privacyLabel: "Privacy",
  accept: "Accept",
  decline: "Decline",
} as const;

// app/privacy/page.tsx renders this; the page authors nothing itself.
export const privacy = {
  eyebrow: "privacy",
  heading: "Privacy",
  intro:
    "What this site tracks, why, and who sees it. No forms, no accounts, no ad trackers, nothing sold.",
  updatedLabel: "Last updated",
  updatedAt: "2026-07-30",
  updated: "July 30, 2026",
  backCta: "Back to the trace",
  sections: [
    {
      heading: "Analytics",
      paragraphs: [
        "PostHog runs product analytics: pageviews, autocapture of clicks, and Core Web Vitals, the load and responsiveness numbers Google uses for ranking.",
        "Four named events track outbound intent: email_click, call_click, demo_click, repo_click. Each just records that a link of that kind was clicked and which part of the page it was in.",
        "Events go through this site's own domain, not a third-party one: PostHog is proxied at /hue.",
        "Vercel Analytics runs alongside it: anonymous pageviews. Vercel is also this site's host.",
      ],
    },
    {
      heading: "Session replay",
      paragraphs: [
        "PostHog records session replay, but only on /blog and /work pages. Every other route, the homepage included, is excluded by default.",
        "All input is masked, though there is little to mask: this site has no forms, no login, no accounts, nothing typed to capture in the first place.",
      ],
    },
    {
      heading: "Cookies and consent",
      paragraphs: [
        "Visiting from the EU, the EEA, the UK, Switzerland, or Gibraltar gets you a banner before anything identifiable is captured.",
        "Decline and PostHog switches to a cookieless rotating hash rather than turning off: you're still counted in the pageview total, never identified, never followed across sessions. Accept and it behaves like it does for everyone else from that point on.",
        "Everyone outside that list is captured in normal cookie mode from the first pageview, no banner.",
        "Your region is resolved once, server-side, from the hosting network's own IP geolocation, into a small cookie named cw that just records which mode applies. Your browser never re-derives your location.",
      ],
    },
    {
      heading: "Error reporting",
      paragraphs: [
        "If something breaks, PostHog is told: unhandled errors and rejections in your browser, and, on the server, the request path, method, and matched route. Never the request body, never anything you typed.",
      ],
    },
    {
      heading: "What isn't collected",
      paragraphs: [
        "No forms, no newsletter, no account, no payment. There is nothing here to fill in.",
        "Every conversion on this site is a mailto: link or an outbound link to Calendly. Click one and you're on Dylan's email or on Calendly, each governed by its own policy, not this one.",
      ],
    },
    {
      heading: "Who processes this",
      paragraphs: [
        "Vercel: hosting, anonymous analytics. PostHog: product analytics, session replay, error reporting. That's the whole list.",
        "Nothing here is sold, rented, or shared for advertising. No ad trackers, no cross-site tracking.",
      ],
    },
    {
      heading: "Questions or requests",
      paragraphs: [
        "Email dylan@merigaud.com: what's held about you, a deletion request, or just a question about this page.",
      ],
    },
  ],
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
        image: `${site.url}/avatar.jpg`,
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
        // No workLocation on purpose (Dylan, 07-28). It used to declare Mexico
        // City, which is the framing being dropped everywhere. Naming a
        // different city here instead would be worse than saying nothing: this
        // is machine-readable structured data, so an inaccurate address is an
        // explicit claim to Google rather than a soft profile field. The prose
        // says "US hours" and stops there, and so does this.
        sameAs: [site.links.linkedin, site.links.github, site.links.npm],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: "Dylan Mérigaud",
      url: site.url,
      about: { "@id": `${site.url}/#person` },
    },
  ],
} as const;
