import type { WorkItem } from "@/lib/copy";

// Case-study pages: the canonical home of each project on merigaud.com.
// Every claim here is verifiable in the linked repos.
import { work } from "@/lib/copy";

type CaseSection = {
  heading: string;
  paragraphs: string[];
};

export type CasePage = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: CaseSection[];
};

const casePages: CasePage[] = [
  {
    slug: "ledgerloop",
    metaTitle: "ledgerloop · agent-derived approval workflows | Dylan Mérigaud",
    metaDescription:
      "Case study: an agent reads a company's HRIS and derives the whole approval workflow, then invoices route through it. Mastra, Next.js, TypeScript strict, Zod.",
    intro:
      "A procure-to-pay product in two halves that form one loop: onboarding derives the approval workflow from the org chart, operations routes real invoices through it.",
    sections: [
      {
        heading: "Nobody draws the workflow canvas",
        paragraphs: [
          "Ramp, Zip, and every workflow builder make you draw the approval graph by hand. Here the agent reads the client's HRIS (a real BambooHR pull, captured and replayed), derives who signs off on what, resolves each gate to a real person from the org chart, and flags the dirty data (a terminated manager, two people who look like the CEO, junk records) for a human to fix first.",
          'You then maintain the workflow conversationally: "above $25k also require the CFO" produces a previewed diff you approve or revert. Nothing applies until you do.',
        ],
      },
      {
        heading: "AI only where it earns its keep",
        paragraphs: [
          "Three AI touchpoints, no more. Extraction reads the messy vendor PDF (vision to schema-validated JSON). Onboarding discovery maps org titles to signing authority, genuinely fuzzy judgement. The investigator agent judges a flagged exception against deliberately unstructured records (price history, PO notes), chooses its own tools, and recommends legitimate, overcharge, or unclear. It decides nothing about the money.",
          "Everything else is pure unit-tested code: 2/3-way matching against open POs pulled from a live QuickBooks org, master-data controls (inactive vendor, off-catalog SKU, already-posted duplicate), the conditional-approval DAG engine, reconciliation. An LLM never decides a payment amount, and nothing posts before a human approves.",
        ],
      },
      {
        heading: "The engineering that holds up under scrutiny",
        paragraphs: [
          "Every run lands as an append-only audit row, replayable with zero tokens: the audit trail an AP buyer asks for first. Human-in-the-loop is stateless and replay-based: Approve or Reject recomputes the deterministic prefix, no persisted run snapshots, so a saved run can never change a future verdict.",
          "The HRIS and ERP adapters are real, captured, and replayed: committed fixtures are actual BambooHR and QuickBooks output, so the demo and CI run with zero API keys. One factory picks live versus recorded; swap QuickBooks for NetSuite behind the same adapter interface and nothing downstream changes. Zod is the single source of truth: it constrains the model, validates every boundary, and its types flow to Drizzle, the stream, and the UI.",
        ],
      },
    ],
  },
  {
    slug: "approvals-ui",
    metaTitle: "approvals-ui · the approval screen as shadcn components",
    metaDescription:
      "Quorum gates, amount thresholds, a segregation-of-duties policy lint, and plain-language editing, shipped as a shadcn registry for React Flow.",
    intro:
      "The approval workflow screen every finance-ops product rebuilds, shipped as shadcn-style components you own: one command and the code lands in your project.",
    sections: [
      {
        heading: "A registry, not a package",
        paragraphs: [
          "npx shadcn add and the workflow canvas, the plain-language edit panel, and the validation panel land in your codebase with their dependencies resolved, yours to edit. No black-box npm dependency for the screen your auditors will ask about.",
          "The components model the real domain: quorum gates (2 of 3 approvers), amount thresholds, conditional routes, and a policy lint that knows what segregation of duties means and flags the graph that lets a requester approve their own spend.",
        ],
      },
      {
        heading: "Plain language in, reviewed diff out",
        paragraphs: [
          'Type "above $50k also require the CFO" and a proposal appears: 1 added, 1 changed, rendered on the canvas with the affected gates ringed. A human reviews the diff before anything lands, the same review-then-apply gate the ledgerloop onboarding uses.',
          "The demo ships with a bundled deterministic parser, no model and no API key; in production you swap it for an LLM that emits the same validated EditOp JSON. The gate stays exactly the same.",
        ],
      },
      {
        heading: "Built on its own published foundation",
        paragraphs: [
          "The canvas lays out with react-flow-auto-layout, my npm package that fixes what a plain dagre pass gets wrong on variable-size nodes: true bounding-box centering and straightened linear edges. Strict TypeScript, dual ESM/CJS, published with provenance.",
        ],
      },
    ],
  },
  {
    slug: "fintech-roast",
    metaTitle: "fintech-roast · an agent that roasts money code | Dylan Mérigaud",
    metaDescription:
      "Case study: a 41-rule researched rulebook applied by an adversarially verified agent to the code that touches money. Read-only, TypeScript, Python, Java.",
    intro:
      "An agent that scans a repository for the surfaces where money lives, audits them against a sourced rulebook of how money-handling code actually breaks, and reports only what survives adversarial verification.",
    sections: [
      {
        heading: "The value is the rulebook, not the prompt",
        paragraphs: [
          'Most AI code review for money is a single prompt that pattern-matches on "float" and calls it a day. Here the asset is 41 rules across 10 domains, from ledger integrity and rounding to FX, tax, serialization, webhooks, aggregation, and time-handling, each researched against primary sources: specs, standards, tax-authority manuals, canonical engineering literature.',
          "Each rule carries per-language detection and fixes for TypeScript, Python, and Java, plus its own false-positive notes. Every finding then goes through an adversarial pass whose only job is to refute it; only survivors get reported, with the rule and the sources behind them.",
        ],
      },
      {
        heading: "Read-only, reproducible, honest",
        paragraphs: [
          'It never edits your code, opens PRs, or files issues. "No findings" is a valid outcome; it does not force findings out of a repo that has no money code.',
          "The eval fixture seeds 35 planted bugs; a scored run surfaces 53 findings, each adversarially verified before it is shown and carrying its rule id and file line, and the complete report is checked into the repo, so you can read exactly what you would get before running it. It runs as a Claude Code plugin on your own session: two commands, no API key to configure.",
        ],
      },
    ],
  },
];

export const getCasePage = (slug: string): { page: CasePage; item: WorkItem } | null => {
  const page = casePages.find((candidate) => candidate.slug === slug);
  const item = work.find((candidate) => candidate.slug === slug);
  if (page === undefined || item === undefined) return null;
  return { page, item };
};

export const caseSlugs = casePages.map((page) => page.slug);
