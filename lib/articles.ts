// The notes: long-form writing, canonical here and syndicated elsewhere.
//
// Same "copy as data" contract as lib/copy.ts and lib/work-pages.ts: content is
// typed data, components only render it. That is deliberate over an MDX
// pipeline. It keeps tsc as the proofreader (a malformed article fails
// `pnpm validate`, not the build output), it adds zero dependencies, and the
// block union is trivially serializable to the markdown dev.to's API wants for
// syndication. If prose ever outgrows this, the escape hatch is one component
// (components/article-body.tsx); no article data has to move.
//
// PROVENANCE of the seven July notes, and it is the whole reason they carry a
// July date. None of them was written for the blog, because the blog did not
// exist yet:
//   - 3 were published on Medium (the rulebook on dev.to first, Medium second),
//     with NO canonical link, so those platforms currently own the search ranking
//     for Dylan's own writing. Fixing that is why the pages had to exist here
//     first, then the platform copies get a canonical pointing back. Only the
//     author can set it, on both Medium and dev.to.
//   - 4 are LinkedIn posts, restored at full length. LinkedIn optimises for the
//     fold, so the web versions get back what the fold cut: the structure, the
//     thresholds, the caveat.
// Dates are the original publication dates. "onboarding-is-where-the-deal-dies"
// merges the 07-14 and 07-16 posts, which argued the same thing at two zoom
// levels, and carries the later date. The 07-08 post named in growth-cockpit is
// deliberately absent: it is not in the LinkedIn activity feed, so there is no
// source text to restore and nothing was invented to fill the gap.

// Inline markup allowed inside any `text` field, rendered by ArticleBody:
//   [label](https://url)  ->  link (internal paths go through next/link)
//   `snippet`             ->  inline code
//   **phrase**            ->  bold
// Nothing else. No raw HTML, ever, so nothing here can inject markup.
// A code sample containing a bare `{x}` will trip
// unicorn/no-incorrect-template-string-interpolation; disable that rule at the
// top of this file when it happens, the samples are data, not interpolations.
export type ArticleBlock =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string; id: string }
  | { kind: "code"; lang: string; code: string; caption?: string }
  | { kind: "list"; items: string[] }
  | { kind: "aside"; text: string };

export type Article = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  // The standfirst. Doubles as the list-page summary and the OG description
  // fallback, so it has to stand alone away from the article.
  lead: string;
  publishedAt: string;
  tags: string[];
  blocks: ArticleBlock[];
};

// Newest first, hand-ordered, same contract as `work` in lib/copy.ts: a new note
// goes on top. Not sorted at runtime on purpose, `toSorted` is ES2023 and the
// shared tsconfig pins lib to ES2022; one array sort is not worth diverging for.
export const articles: readonly Article[] = [
  {
    slug: "recall-1000-blind-to-dust",
    title: "I Published a Perfect Recall. Then I Measured Dust.",
    metaTitle: "I Published a Perfect Recall. Then I Measured Dust. | Dylan Mérigaud",
    metaDescription:
      "Nine detector thresholds read off precision/recall curves and validated on a held-out seed, and the one measurement that turns 1.000 into 0.000.",
    lead: "A detector that scores perfectly on your benchmark is telling you something about your benchmark.",
    publishedAt: "2026-08-27",
    tags: ["evals", "measurement", "document-verification", "python"],
    blocks: [
      {
        kind: "p",
        text: "`dossier-preflight` answers one question: is this dossier going to be rejected at the counter. Not extraction, not document generation. It checks a set of filed documents against an external reference, and it measures what is actually PRINTED on the sheet, because an AcroForm field can carry a value that never prints while the clerk reads paper. The code and every number below are public at [github.com/DylanMerigaud/dossier-preflight](https://github.com/DylanMerigaud/dossier-preflight).",
      },
      {
        kind: "h2",
        id: "nine-thresholds",
        text: "Nine thresholds, none of them picked by hand",
      },
      {
        kind: "p",
        text: "Nine checks: a required field left empty, a box left unticked, a missing signature, an expired piece, two pieces whose data disagree, a forbidden value reappearing, a scan too coarse to read, a truncated page, an upside-down page. Each one emits a continuous score, and each threshold is read off a precision/recall curve instead of chosen by eye (commit `db72954`).",
      },
      {
        kind: "p",
        text: "The rig behind that: 384 cells (6 rotation angles x 4 resolutions x 4 JPEG qualities x 4 noise levels) x 3 seeds = 1152 dossiers, 13,824 image readings, 121 minutes on 13 local workers. Inside the nominal domain of 150 dpi and up, eight of the nine checks hold a recall of 1.000 at zero false positives per target. The ninth, forbidden values, holds 0.997 at 0.00058 per target.",
      },
      {
        kind: "p",
        text: "The rate a user actually feels is neither of those. It is the chance that an entirely clean dossier still sets something off: 4 dossiers out of 864, 0.46%, all four from the forbidden-value check. A gate that cries for nothing gets skimmed, and the rule sitting next to it gets skimmed with it.",
      },
      {
        kind: "h2",
        id: "held-out-seed",
        text: "The seed I did not look at",
      },
      {
        kind: "p",
        text: "Choosing an operating point on a set of draws and then reporting its score on those same draws inflates it by an amount nobody can recover afterwards. The protocol against that is in LIMITS.md at [github.com/DylanMerigaud/dossier-preflight](https://github.com/DylanMerigaud/dossier-preflight), in the words it was written in:",
      },
      {
        kind: "aside",
        text: "The threshold is chosen on seeds 11 and 23, and the published figure is the one from seed 37, never looked at beforehand. Choosing a threshold and reporting its recall on the same draws always overestimates it.",
      },
      {
        kind: "p",
        text: "That splits every table in that file in three rows: calibration on 576 positives, validation on 288, overall on 864. The required-field check reads 1.000 with a 95% interval of [0.987, 1.000] on the held-out seed alone. It is a real holdout, and it is the cheapest discipline in the whole project. It also did nothing at all for the failure that comes next.",
      },
      {
        kind: "h2",
        id: "ink-never-added",
        text: "The grid moved ink. It never added any.",
      },
      {
        kind: "p",
        text: 'Four factors vary in that grid: angle, resolution, JPEG quality, noise. All four move, blur or dirty the ink already on the page. Not one of them puts new ink where there was none. And the sensor that won the duel for "is this required field empty" is an ink sensor: it does not read anything, it measures how much darker a zone got compared to the blank form (commit `3a4e682`).',
      },
      {
        kind: "code",
        lang: "text",
        caption: "The duel for the empty-required-field check",
        code: `sensor                                         recall  false positives per target
---------------------------------------------  ------  --------------------------
added ink, threshold 128 (retained)            1.000   0.0000
full-page plus per-zone OCR, min confidence 0  1.000   0.0003
OCR alone, min confidence 10 and up            0.000   0.0000`,
      },
      {
        kind: "p",
        text: "It won on ground built to favour it. For a while the limits file said so as a hypothesis, which is the polite way of shelving a problem.",
      },
      {
        kind: "h2",
        id: "the-cliff",
        text: "A cliff, not a slope",
      },
      {
        kind: "p",
        text: "A separate probe put a number on it, 528 readings, on 2026-08-21. Three shapes of foreign ink laid on the clean render before degradation, so each one goes through the same rotation, blur, noise and compression as the page: a speck, a fold shadow, a pen stroke spilling over from the neighbouring field. Target: the exact field that the empty-required-field variant leaves blank. The control with no parasite returns zero false negatives and zero false positives on all four sensors, so the bench itself is sound (commit `c96c5ac`).",
      },
      {
        kind: "code",
        lang: "text",
        caption:
          "False negatives, an empty field declared filled, once at least 0.5% foreign ink is in the zone, n=151",
        code: `sensor                                   false negatives  95% CI
---------------------------------------  ---------------  --------------
ink, threshold 128 (retained)            1.000            [0.975, 1.000]
union of the word sensors, confidence 0  0.272            [0.207, 0.347]
full-page OCR                            0.185            [0.132, 0.255]
per-zone OCR                             0.106            [0.066, 0.165]`,
      },
      {
        kind: "p",
        text: "Those are false negatives, the expensive side: the counter rejects the dossier and the tool said nothing. The shape is the part I did not expect. The published threshold is 0.345% added ink. The sensor fires 97 times out of 97 up to 0.323%, and 0 times out of 167 from 0.380% on. The two populations do not overlap by one single reading. That is a step, and it sits on the exact number I had published.",
      },
      {
        kind: "p",
        text: "For that field, 15,770 canonical pixels, 0.35% is a 9 x 8 px speck at 200 dpi. That is a piece of dust on the scanner glass. A pen stroke barely spilling out of the neighbouring field already adds 0.61%.",
      },
      {
        kind: "h2",
        id: "why-it-stayed",
        text: "Why the threshold did not move anyway",
      },
      {
        kind: "p",
        text: "A probe on one field, two cells and three ink shapes shows that a choice was settled on biased ground. It is not enough to move a threshold. So the grid was replayed with parasitic ink as a fifth factor, laid on the very field a variant empties, over 27 cells and 3 seeds (commit `aa7e0ed`).",
      },
      {
        kind: "code",
        lang: "text",
        caption: "Recall by parasitic ink level on the damaged field, 27 cells x 3 seeds",
        code: `sensor                         clean  at 0.2% ink  at 1%  at 4%  false positives at 4%
-----------------------------  -----  -----------  -----  -----  ---------------------
ink, threshold 128 (retained)  1.000  0.333        0.000  0.000  0.000
union, confidence 0            1.000  0.778        0.679  0.519  0.296
full-page OCR                  1.000  1.000        1.000  0.778  0.556
per-zone OCR                   1.000  0.778        0.679  0.630  0.481`,
      },
      {
        kind: "p",
        text: "Past 1% of foreign ink on the damaged field, the retained sensor is completely blind. In exchange it never cries wolf, at any level, while the word sensors raise false alarms on 30 to 56% of clean pages at 4%. One of those degrades a gate. The other destroys it.",
      },
      {
        kind: "p",
        text: "The sensor stayed, and the reason is written down rather than assumed:",
      },
      {
        kind: "aside",
        text: "The operating point is chosen on clean pages, deliberately: the four parasite levels exist in equal proportion for statistical power, and choosing a threshold on the pooled set would silently assume that three pages in four carry foreign ink.",
      },
      {
        kind: "p",
        text: "What changed is what ships beside the number. `thresholds.json` now carries `recall_with_ink_on_the_damaged_field` in the same object as `recall`, so the required-field entry reads 1.0 and 0.0 next to each other and nobody can quote the first without meeting the second. If your scans come off a dirty glass, full-page OCR is the sensor to prefer, and you pay for it in false alarms. That trade is yours. The measurement is there so you can make it.",
      },
      {
        kind: "h2",
        id: "three-questions",
        text: "Three questions for any benchmark that returns 1.000",
      },
      {
        kind: "p",
        text: "Read against my own, on 2026-08-27, and every one of them cost me something before it became a question.",
      },
      {
        kind: "p",
        text: "What does the generator never produce? Mine never added ink, and the sensor it crowned was an ink sensor. The blind spot of the benchmark and the blind spot of the winner were the same shape, so the grid could not see it by construction, no matter how many cells it ran.",
      },
      {
        kind: "p",
        text: "Was the threshold read on the same draws it is reported on? If yes, the number is optimistic by an amount nobody can recover after the fact. A held-out seed costs one extra run.",
      },
      {
        kind: "p",
        text: "Does the failure mode ship in the same file as the score? A limits document nobody opens is not a disclosure. The number and the thing that kills it belong in one object.",
      },
      {
        kind: "p",
        text: "Same instinct as [the rulebook whose agent refutes its own findings](/blog/a-rulebook-of-how-money-code-breaks): the work that pays is the work spent trying to break your own result, and a result is worth what the attempt to break it was worth. A recall of 1.000 is not a property of a detector. It is a property of a detector and a generator, and only one of those two is going to meet a real scanner.",
      },
      {
        kind: "h2",
        id: "method",
        text: "Method",
      },
      {
        kind: "p",
        text: "Repo read 2026-08-27 at [github.com/DylanMerigaud/dossier-preflight](https://github.com/DylanMerigaud/dossier-preflight), HEAD `42732f0`, public, local tooling only and no remote service. Grid: `grid/run.py`, 384 cells (angle x dpi x JPEG quality x noise) x 3 seeds = 1152 dossiers and 13,824 image readings, 121 minutes on 13 workers; 864 of those dossiers fall inside the nominal domain of 150 dpi and up. Thresholds are written by `grid/analyze.py --publish` into `thresholds.json` and `LIMITS.md`, calibrated on seeds 11 and 23, with the published figure measured on seed 37, never looked at while choosing. Operating point rule: the highest recall holding a false positive rate under 0.2% per target. Two thresholds do not come from their own curve and the file says so: `expiry` is frozen at zero by definition, and `resolution` is set at the other checks' readability floor minus 1%. Parasitic ink probe: `parasitic-ink-probe/experiment.py`, 528 readings on a `git archive` of commit `3a4e682`, measured 2026-08-21, two cells, six seeds, seven intensities plus a no-parasite control, target field `employment` / City or Town. Fifth-factor replay: `grid/run.py --parasite`, 27 cells x 3 seeds, commit `aa7e0ed`. Corpus: three blank forms exactly as their administration publishes them, W-9 (IRS) and I-9 (USCIS) in the public domain, Cerfa 14011*02 under Etalab Open Licence 2.0, with producer, source, retrieval date, licence and sha256 recorded in `corpus/CORPUS.md`. One fictional dossier, one invented person, one defect per check. No real scan and no document ever issued to anybody entered the measurement, so a recall of 1.000 here is that of the same defect seen 864 times, not of 864 different defects.",
      },
    ],
  },
  {
    slug: "thirty-pages-google-indexed-zero",
    title: "I Built 30 Programmatic Pages. Google Indexed Zero.",
    metaTitle: "I Built 30 Programmatic Pages. Google Indexed Zero. | Dylan Mérigaud",
    metaDescription:
      "30 programmatic city pages, 99.4% average pairwise similarity, 416 of 435 pairs over threshold, zero indexed in six months. The method and the noindex call.",
    lead: "I built one landing page per US city for RentalReels, thirty of them. Six months after the pages went live, Google had indexed zero of them.",
    publishedAt: "2026-08-26",
    tags: ["seo", "programmatic-seo", "measurement", "typescript"],
    blocks: [
      {
        kind: "p",
        text: 'RentalReels turns a listing\'s photos into a video walkthrough. Early on I built one landing page per US city: `/cities/miami`, `/cities/austin`, thirty of them, each opening with a line like "turn your Miami Airbnb listing into a video tour" and then the same pitch, the same pricing, the same FAQ underneath. Standard programmatic SEO. The shape every pSEO guide tells you to ship.',
      },
      {
        kind: "p",
        text: "Six months after the pages went live, Google had indexed zero of them.",
      },
      {
        kind: "h2",
        id: "search-console",
        text: "What Search Console actually showed",
      },
      {
        kind: "p",
        text: 'The coverage report, read 2026-08-23, labeled the thirty city pages "Discovered, currently not indexed," last crawl N/A. Not deindexed. Not penalized. Never crawled at all.',
      },
      {
        kind: "p",
        text: 'The proximate cause was a bug, not a policy. The sitemap listed the pages under the apex domain (rentalreels.com), the apex 307-redirects to www, and the www page that actually served content declared its own canonical back at the apex. Google had no way out of that loop: fetch the apex, get redirected, land on a page whose canonical tag says "the real one is over there," repeat. Fixed on 2026-08-23 in commit `ac1117c9`, one host chosen (www, the domain the hosting config already served in production) and every canonical pointed the right way.',
      },
      {
        kind: "h2",
        id: "measured-first",
        text: "Before the crawl reached them, I measured what it would find",
      },
      {
        kind: "p",
        text: "With the redirect loop closed, Google was about to crawl thirty city pages for the first time in the site's history. Before that happened, I ran the served HTML through a thin-content and near-duplicate check. Measured 2026-08-25, commit `5cd74a82`:",
      },
      {
        kind: "aside",
        text: '"30 pages, 1227 to 1230 tokens each, mean pairwise similarity 99.4 percent, min 98.2, max 100.0, 416 of 435 pairs at or above the doorway threshold, 30 of 30 flagged thin."',
      },
      {
        kind: "p",
        text: "Eight of the thirty (Miami, Orlando, San Diego, San Francisco, Los Angeles, Napa, Key West, Destin) were byte-identical to each other once each page's own slug was stripped out of the text. Not similar. Identical.",
      },
      {
        kind: "h2",
        id: "the-method",
        text: "The method, so the number is checkable",
      },
      {
        kind: "p",
        text: "The check that produced those numbers, unpacked: the module is `microsaas-kit/src/pseo`, and this run is commit `5cd74a82`. It reads the text actually served inside `<main>`, not the source template, so it measures what a crawler sees, not what the code author intended.",
      },
      {
        kind: "p",
        text: "For every page: lowercase the body, strip the page's own slug from it (split the slug on hyphens, remove each resulting word wherever it occurs as a literal substring), then tokenize with `Intl.Segmenter`'s word-boundary detection rather than a whitespace split, so a script with no spaces between words is not silently counted as one giant token. Build the set of every contiguous 3-word shingle in what is left. Compare every pair of pages with Jaccard similarity: the size of the intersection of their shingle sets divided by the size of the union. Two identical texts score 1.0. Two texts sharing no 3-word phrase score 0.0.",
      },
      {
        kind: "p",
        text: "A pair counts as a near-duplicate at 0.75 Jaccard or above, the threshold this check calls a doorway page: same sentence template, a word or two swapped. A page also fails on its own if it carries fewer than 15 tokens once its own slug is stripped, too short to be a real page whether or not it collides with anything. Both numbers are module defaults, chosen against a false-positive stress test rather than picked to make one failing case pass, and they are the same defaults the rest of the portfolio's page sets run under.",
      },
      {
        kind: "p",
        text: 'The corpus was every pair among the thirty pages, 435 of them. 416 of those pairs, 95.6 percent, cleared 0.75. The eight-page byte-identical cluster is not the method finding something extreme. It is what "swap the city name, keep the rest" looks like once you actually measure it instead of eyeballing two pages side by side.',
      },
      {
        kind: "h2",
        id: "nothing-local",
        text: "Why there was nothing local to write",
      },
      {
        kind: "p",
        text: "I looked for real differentiation before deciding there wasn't any, because inventing it was the other option, and a worse one. The job runs from a listing link: a customer pastes a URL, gets a video back. Nobody visits the property. Nothing about the price, the turnaround or the edit changes between Miami and Dallas. There was exactly one sample video in the codebase and it belonged to no city. The database held no delivered order to cite per market. Writing \"Gatlinburg is all cabins, we shoot for the mountain look\" would have been exactly the kind of unmeasured claim this same site had spent the prior week removing from its own homepage: invented satisfaction percentages, testimonials from people who do not exist, a client logo wall for companies with no relationship to the product. A city page for a service with no local dimension has nothing honest to say that the other twenty-nine city pages don't already say.",
      },
      {
        kind: "h2",
        id: "noindex",
        text: "Noindex, before Google ever got there",
      },
      {
        kind: "p",
        text: "The decision: the thirty pages stay live and answer `noindex, follow`. Live, because an old ad or a direct link should still land on a page that sells something, and a `noindex` is reversible the day the offer grows an actual local dimension. Noindex, because letting Google index thirty copies of the same page right after its first real crawl of them is how a scaled-content flag gets earned, not avoided.",
      },
      {
        kind: "p",
        text: "In their place, the sitemap now offers one page, `/cities`, written once, saying directly what the thirty implied by omission: the service has no local edition. The same check run against the home page, computed on 2026-08-25: 1.6 percent similarity, 495 of its own tokens, 0 of 2 flagged thin.",
      },
      {
        kind: "h2",
        id: "the-denominator",
        text: "What this changes, and what it doesn't",
      },
      {
        kind: "p",
        text: "This moves a denominator worth naming so a later reading of it isn't misread. The bet carries a pre-declared kill signal: if cumulative impressions on the `/cities` pages stay under 300 by mid-November, and zero real signups arrive in the meantime, the bet dies. The same sitemap that feeds Search Console reporting went from 31 URLs to 2 the day the noindex landed. A jump in the indexed-page ratio at the next reading is that sitemap edit, not organic gain. The impressions half of the gate is untouched either way: the thirty pages produced zero impressions across the whole six months they were live, so pulling them from the sitemap removes a population that had never contributed anything the gate was counting.",
      },
      {
        kind: "h2",
        id: "what-its-for",
        text: "What the number is actually for",
      },
      {
        kind: "p",
        text: "Every guide on programmatic SEO I have read argues from the win: here is how we shipped ten thousand pages and traffic went up forty times. None of them show the check that would have told them, before publishing, which of those pages were real. Google's own scaled-content policy, updated 2026-05-15, does not leave this ambiguous:",
      },
      {
        kind: "aside",
        text: '"Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users. This abusive practice is typically focused on creating large amounts of unoriginal content that provides little to no value to users, no matter how it\'s created."',
      },
      {
        kind: "p",
        text: "\"No matter how it's created\" is the part that matters here. The pages were not written badly. They were written correctly, thirty times, for a service that has exactly one thing to say. The mistake was picking the city as the axis for a page set before checking whether the city changed anything measurable about the content. It didn't, and a script that took a few minutes to write said so in one run, on text that had not yet been seen by a single crawler.",
      },
      {
        kind: "p",
        text: "I would rather find that out from my own measurement than from Google's next core update. Same instinct as [the straight-through limit](/blog/the-straight-through-limit) I wrote about earlier: a threshold that only lives in someone's head is not a control, and neither is an assumption about how a page will read to a crawler. Write the check, run it before publishing, and let the number decide instead of the intent behind the page.",
      },
      {
        kind: "h2",
        id: "method",
        text: "Method",
      },
      {
        kind: "p",
        text: "Source: served `<main>` HTML of the thirty live `/cities/<slug>` pages on rentalreels.com, measured 2026-08-25, commit `5cd74a82`. Tool: `microsaas-kit/src/pseo`, TypeScript, no dependency beyond `Intl.Segmenter`. Per page: lowercase the body, strip the page's own slug (split on hyphens, remove each resulting word as a literal substring wherever it appears), segment into words with `Intl.Segmenter({granularity: \"word\"})`, build the set of contiguous 3-word shingles. Pairwise score: Jaccard similarity of the two shingle sets, computed for all 435 unordered pairs among the 30 pages. Flags: any page under 15 tokens on its own; any pair at or above 0.75 Jaccard; any exact match after stripping. Thresholds are the module's defaults, not tuned for this result, documented in the same file that runs the check (`packages/microsaas-kit/src/pseo/index.ts`). Coverage status: Search Console UI, property `sc-domain:rentalreels.com`, read 2026-08-23.",
      },
    ],
  },
  {
    slug: "the-straight-through-limit",
    title: "I built the approval gate, then put a price on it",
    metaTitle: "Where the straight-through limit belongs in AP automation | Dylan Mérigaud",
    metaDescription:
      "A company raised $30M to take the human out of agent payments. I agree with them, up to a thousand dollars. The thresholds, and who should set them.",
    lead: "In ledgerloop, a clean invoice under $1,000 posts with no human involved. I built the approval gate, then put a price on it.",
    publishedAt: "2026-07-28",
    tags: ["fintech", "ap-automation", "agents", "controls"],
    blocks: [
      {
        kind: "p",
        text: "A company raised $30M last week to take the human out of agent payments. The expected take from someone with my background is a post defending the human. I agree with them, up to a thousand dollars.",
      },
      {
        kind: "h2",
        id: "the-gate",
        text: "Two conditions, and nothing else",
      },
      {
        kind: "p",
        text: "The manager gate fires on two conditions: any exception, or a clean bill over $1,000. Below that, a clean three-way match posts straight through and no one signs.",
      },
      {
        kind: "p",
        text: "From the seeded scenarios: $730 clean goes straight through. $9,360 clean still stops, because a material bill gets a human whatever the match says. A steel bar invoiced 9% over the PO stops. Invoiced 100 units, received 80, stops.",
      },
      {
        kind: "aside",
        text: "Two things exactly, and they are the load-bearing ones. Below the floor, what posts the invoice is deterministic tested code, not the model: the agent reads, investigates and proposes, it does not decide an amount. And these are seeded demo scenarios, not production traffic.",
      },
      {
        kind: "h2",
        id: "the-real-argument",
        text: "The argument I actually want",
      },
      {
        kind: "p",
        text: 'It is not whether humans should approve payments. It is that "a human approves payments" stops being a control the moment no one wrote down which payments.',
      },
      {
        kind: "p",
        text: "An unwritten threshold is not a policy, it is a habit, and a habit cannot be audited. The number itself is arguable and probably wrong for your business. Its existence, in code, with a reason next to it, is not.",
      },
      {
        kind: "p",
        text: "If you run AP: what is your straight-through limit, and who set it? The whole loop, an agent deriving the workflow then a real invoice routed through it, is in the [ledgerloop case study](/work/ledgerloop).",
      },
    ],
  },
  {
    slug: "what-one-eval-pass-costs",
    title: "One pass of my eval bills $9.14 on the API and $0 through the CLI",
    metaTitle: "What one eval pass costs: Claude Code CLI vs the API | Dylan Mérigaud",
    metaDescription:
      "27 calls, same model. The CLI prints the API-equivalent cost while billing the subscription, structured output took format reliability from 7/15 to 15/15, and one env var silently bills the wrong account.",
    lead: "One pass of my board eval bills $9.14 on the Anthropic API. Through Claude Code it bills $0. Same model, claude-opus-4-8.",
    publishedAt: "2026-07-27",
    tags: ["ai", "evals", "claude", "tooling"],
    blocks: [
      {
        kind: "p",
        text: "That is 27 calls, and it is not an estimate. The CLI prints a `total_cost_usd` in its envelope: what the run would have cost on the API. It bills the subscription instead, so the number is a receipt for money nobody spent.",
      },
      {
        kind: "h2",
        id: "reliability",
        text: "The switch fixed something better than the bill",
      },
      {
        kind: "p",
        text: "Running with `--output-format json` and `--json-schema` rides the same structured-output machinery the API does, an internal forced tool call. Format reliability on my suite went from 7 out of 15 to 15 out of 15.",
      },
      {
        kind: "p",
        text: "The schema needs relaxing first: strip `pattern`, `minLength`, `maxLength`, `minItems`, `maxItems`, `format` and the `$schema` meta-ref, because the CLI validator rejects draft-2020-12. The strict version stays in Zod on the caller side, so nothing is actually loosened, the validation just moves to where it can run.",
      },
      {
        kind: "h2",
        id: "the-trap",
        text: "One trap is worth the whole post",
      },
      {
        kind: "p",
        text: "If `ANTHROPIC_API_KEY` sits in the child process environment, the CLI quietly bills the API account rather than the subscription. Nothing errors. Nothing warns. The invoice arrives. It gets stripped explicitly at spawn.",
      },
      {
        kind: "aside",
        text: "This is the failure mode I would look for first in anyone else's runner: the money leak is silent, and the only symptom is a bill at the end of the month for a run you believed was free.",
      },
      {
        kind: "h2",
        id: "the-limit",
        text: "And the limit, which matters more than the savings",
      },
      {
        kind: "p",
        text: 'This is a dev-loop tool. Anthropic\'s consumer terms prohibit automated access "except when you are accessing our Services via an Anthropic API Key or where we otherwise explicitly permit it", and the commercial terms governing API use do not cover consumer subscriptions. An eval runner on my own machine is the CLI used as designed. A shipped service is not.',
      },
      {
        kind: "p",
        text: "Iterate on the CLI, ship on the API. What does one pass of your eval suite cost, and does anyone know it?",
      },
    ],
  },
  {
    slug: "onboarding-is-where-the-deal-dies",
    title: "Enterprise fintech deals die in onboarding, and the config already exists",
    metaTitle: "Onboarding is where enterprise fintech deals die | Dylan Mérigaud",
    metaDescription:
      "Two years inside a procurement fintech: the product demos great, the contract gets signed, then setup drags for weeks. What cut onboarding time by 90%, and why the workflow was never missing in the first place.",
    lead: "Enterprise fintech deals don't die in the demo. They die in week six of onboarding, while someone re-types the customer's approval rules into a canvas.",
    publishedAt: "2026-07-16",
    tags: ["fintech", "onboarding", "procure-to-pay", "ai"],
    blocks: [
      {
        kind: "p",
        text: "I spent two years inside a procurement fintech and the pattern was consistent: the product demos great, the contract gets signed, and then comes the wall. Setup that drags for weeks. Change requests every single week. Users who don't fully understand what was configured for them, so they ask instead of doing.",
      },
      {
        kind: "h2",
        id: "the-three-things",
        text: "The three things that cut onboarding time by 90%",
      },
      {
        kind: "p",
        text: "**Integrating end to end with the systems the client already runs.** The ERP connection wasn't a checkbox: granular sync per data type, bulk imports, master data flowing both ways. Every field the client doesn't re-enter is a support ticket that never exists.",
      },
      {
        kind: "p",
        text: "**Generating a v1 of their approval workflow instead of handing them a blank canvas**: business rules and best practices, applied to the real people pulled from their HRIS. The client reviews and adjusts a draft. Nobody designs from zero.",
      },
      {
        kind: "p",
        text: '**Giving clients simple tools to help themselves**, including a chatbot, so "how do I change this?" stopped requiring us.',
      },
      {
        kind: "p",
        text: "None of it was glamorous. All of it was product engineering aimed at time-to-first-value. A CTO building in this space told me recently that time-to-first-value, not features, is what decides procurement deals. That matches everything I saw from the inside.",
      },
      {
        kind: "h2",
        id: "already-exists",
        text: "The workflow was never missing",
      },
      {
        kind: "p",
        text: "Watch an enterprise onboarding for any workflow product and you'll see the same ritual: a kickoff call, a shared screen, and someone rebuilding the org's approval logic box by box. Who approves above $10k. Who signs off on IT purchases. What happens when the manager is on leave.",
      },
      {
        kind: "p",
        text: "None of that information is new. It sits in the HRIS (who reports to whom, titles, departments) and in the ERP (vendors, open POs, spend history). The customer is being asked to re-enter reality the software could have read.",
      },
      {
        kind: "h2",
        id: "next-iteration",
        text: "What the next iteration looks like",
      },
      {
        kind: "p",
        text: "[ledgerloop](/work/ledgerloop) is that idea taken further. An agent reads the HRIS and derives the approval workflow, each gate resolved to a real person from the org chart. Rules get you a solid draft; the genuinely fuzzy part, mapping titles to actual approval authority, is where an LLM earns its place.",
      },
      {
        kind: "p",
        text: "Dirty data gets flagged for a human before anything else: a terminated manager still listed as an approver, two people who both look like the CEO, junk records. Derived does not mean trusted.",
      },
      {
        kind: "p",
        text: 'Then you maintain the workflow in plain language: "above $25k, also require CFO." You get a preview, you approve or revert. Nothing applies until a human says so. And the money path stays deterministic code: matching, thresholds, routing. The AI reads and proposes. It never decides a payment.',
      },
      {
        kind: "aside",
        text: 'Here is the 2026 twist: everyone is adding AI to the product surface. Copilots, chat, insights. Almost nobody is pointing it at onboarding. Yet "read the customer\'s systems, derive their configuration, have a human review it" is exactly the kind of fuzzy, one-shot, reviewable task current models are genuinely good at. The AI feature gets the meeting. Onboarding gets the renewal.',
      },
      {
        kind: "p",
        text: "Today this mapping is done by hand, by forward-deployed engineers, and they are a big part of what onboarding costs. If you build or buy B2B fintech: how long from signed contract to the first real invoice or PO through the system?",
      },
    ],
  },
  {
    slug: "a-rulebook-of-how-money-code-breaks",
    title: "A rulebook of how money code breaks, and an agent that refutes its own findings",
    metaTitle: "A rulebook of how money code breaks | Dylan Mérigaud",
    metaDescription:
      "41 researched rules across 10 domains, applied by an agent whose second pass only tries to refute its own findings. On Medusa it killed 10 of 16 and confirmed a real concurrency cluster.",
    lead: "Money bugs are rare per repository and expensive when they happen. They also pass review, because the code compiles and the tests pass, and the tests pass precisely because they use round numbers and one currency.",
    publishedAt: "2026-07-12",
    tags: ["fintech", "code-review", "agents", "typescript"],
    blocks: [
      {
        kind: "h2",
        id: "money-bugs-pass-review",
        text: "Money bugs pass review",
      },
      {
        kind: "p",
        text: "Rounding that loses a cent per invoice, a webhook that captures a payment twice on retry, a cached balance that quietly drifts from the ledger. These do not look like bugs in review. The code compiles, the tests pass, and the tests pass precisely because they use round numbers and one currency, which is itself one of the failure modes.",
      },
      {
        kind: "p",
        text: "Most AI code review aimed at this problem is a single prompt that pattern-matches on `float` and calls it a day. That catches the easy cases and misses the part that actually costs money, which is semantic and spread across files: an allocation that does not sum to its total, a counter updated without a lock, a tax total rounded at the wrong level.",
      },
      {
        kind: "h2",
        id: "rulebook-not-prompt",
        text: "Put the value in a rulebook, not a prompt",
      },
      {
        kind: "p",
        text: "[fintech-roast](/work/fintech-roast) is built the other way around. The product is a rulebook of 41 rules across 10 domains: storage and types, rounding and allocation, idempotency and concurrency, ledger design, FX, time and dates, aggregation, taxes, API serialization, and testing. Each rule has per-language detection and fixes for TypeScript, Python, and Java, at least two sources you can check (language specs, ISO standards, tax-authority manuals, engineering write-ups from practitioners), and its own false-positive notes documenting where it cries wolf.",
      },
      {
        kind: "p",
        text: "A rule is a claim you can check, not a regex. So a human can read the reasoning and decide instead of trusting the tool. The same rule keeps working when the executor is a cheaper model next year. And when a rule is wrong, you can argue with the specific claim.",
      },
      {
        kind: "p",
        text: "An example, abbreviated. Rule ROU-2, pro-rata allocation that loses or creates cents: detect a total split by looping over shares and rounding each independently with no reconciliation of the residual. Why it breaks: the rounded parts do not sum back to the total, so a 100.00 split three ways becomes 33.33 + 33.33 + 33.33 = 99.99 and a cent vanishes. The fix: allocate with an explicit remainder pass (largest-remainder, or push the residual to the last bucket). False positives: a high-precision internal allocation that carries the residual forward and only rounds once at the end is fine, do not flag it.",
      },
      {
        kind: "h2",
        id: "how-the-agent-applies-it",
        text: "How the agent applies it",
      },
      {
        kind: "p",
        text: "The agent is a Claude Code plugin, read-only, running on your own session. It scans the repo for where money lives, then fans out one auditor subagent per domain, each pointed at that domain's rule file and the candidate code. Then a second agent runs whose only job is to refute each finding: is this display-only, a rate rather than an amount, dead code, already guarded a layer up, a misreading? Refuted findings are dropped before you ever see them. The survivors come back with a severity, a confidence tier from the verifier, the offending code, a fix direction, and the rule citation.",
      },
      {
        kind: "h2",
        id: "what-happened-on-real-code",
        text: "What happened on real code",
      },
      {
        kind: "p",
        text: "The eval fixtures in the repo are bugs I planted, which is useful for measuring recall but proves nothing about false positives on code that is mostly correct. So I ran it on real codebases.",
      },
      {
        kind: "p",
        text: "On Medusa, the open-source commerce platform, I pointed it at the money-core files across six domains, at a pinned commit. The auditors emitted 16 findings; the verifier refuted 10, downgraded 2 to narrower claims, and confirmed 4. The confirmed 4 are one concurrency cluster. Simplified, the payment capture path does this:",
      },
      {
        kind: "code",
        lang: "typescript",
        caption: "Medusa payment capture, simplified: read, guard, write, none of it serialized",
        code: `// read how much has already been captured
const capturedAmount = payment.captures.reduce(/* sum */, 0)
// guard: refuse to capture more than authorized minus already-captured
if (newCaptureAmount > authorizedAmount - capturedAmount) throw new Error()
// insert the capture
await this.captureService_.create({ /* ... */ })`,
      },
      {
        kind: "p",
        text: "The read, the guard, and the write are not serialized. Under the default READ COMMITTED isolation, two concurrent captures of a 100 authorization both read captured = 0, both see 100 remaining, both pass the guard, and both insert. Result: 200 captured against a 100 authorization. There is no row lock, no version check, and no unique constraint to catch it.",
      },
      {
        kind: "p",
        text: "The same shape appears in refunds and in two promotion-budget counters. The gateway does not save you: the bundled Stripe provider swallows the already-captured error, so both capture rows persist, and each refund row carries its own idempotency key, so `stripe.refunds.create` moves real money twice. I filed the cluster upstream with a failing test that drops straight into Medusa's own concurrency test block; it is filed, not yet triaged, so judge it by the test: [medusajs/medusa#16012](https://github.com/medusajs/medusa/issues/16012).",
      },
      {
        kind: "h2",
        id: "the-refutations",
        text: "The refutations are the interesting part",
      },
      {
        kind: "p",
        text: "The verifier killed 10 of the 16 Medusa findings, and that is the number I would judge the tool on. A tool that dumps raw findings costs you an afternoon per false positive and loses your trust on the first wrong one.",
      },
      {
        kind: "p",
        text: "One example. An auditor flagged that Medusa stores tax rates in a single-precision `REAL` column, and by the letter of the rule that is a hit. The verifier worked the whole chain mechanically: a float32 stored rate, read back through PostgreSQL 12+'s shortest-round-trip text output, parsed by node-postgres, then converted to the exact decimal. Every rate tested (0.21, 8.25, 9.975, 8.0625, 13.9125) round-trips exactly; corruption would need a rate with seven or more significant digits. The finding died on the rule's own test: does an inexact binary value ever actually reach the money math? The answer was no.",
      },
      {
        kind: "aside",
        text: "That refutation used a false-positive note I had added to the rulebook the same day, which is the feedback loop working. All ten kills are published with their mechanisms in the field report, so a wrong kill is itself checkable.",
      },
      {
        kind: "h2",
        id: "honest-limits",
        text: "Honest limits",
      },
      {
        kind: "list",
        items: [
          "86% recall on the cold scan is a best case, not proof: I planted the bugs and wrote the answer key, the fixture only holds bug classes I already knew to write rules for, and the scan still missed 5 of the 35. The misses are in the repo.",
          "On that fixture the verifier refuted nothing (0 of 53): every file is dense with planted bugs, so the fixture says nothing about false-positive suppression. The kill rates on real code are the evidence: 10 of 16 on Medusa, 14 of 36 on the private repo.",
          "The verifier is adversarial, not human. Confirmed means the finding survived an attack by a second model, not that a person proved it.",
          "One of my two field writeups is on a private, anonymized codebase you cannot reproduce. The Medusa one you can, and its issue is filed upstream, not yet accepted.",
          "No Go or Ruby yet.",
          "A whole-repo run costs real tokens on your own account (the two runs in field report 1 cost roughly 2.2M subagent tokens total). Diff mode is the cheap day-to-day run.",
        ],
      },
      {
        kind: "h2",
        id: "try-it",
        text: "Try it, or argue with a rule",
      },
      {
        kind: "code",
        lang: "shell",
        code: `/plugin marketplace add DylanMerigaud/fintech-roast
/plugin install fintech-roast@fintech-roast
/fintech-roast:roast`,
      },
      {
        kind: "p",
        text: "The rules are claims about how money code breaks. If one is wrong, overstated, or missing a jurisdiction nuance, that is the most valuable contribution you can make. The rulebook, the evals with their misses, and both field reports are all in the repo: [DylanMerigaud/fintech-roast](https://github.com/DylanMerigaud/fintech-roast).",
      },
    ],
  },
  {
    slug: "its-just-an-approval-workflow",
    title:
      '"It\'s just an approval workflow" is the most expensive sentence in procurement software',
    metaTitle: "Why an approval workflow engine is never three boxes | Dylan Mérigaud",
    metaDescription:
      "Six questions the canvas never asks, from two years shipping an approval workflow engine. Plus the trade-off we picked: freeze the workflow at init, and what that quietly declines.",
    lead: "In the demo, it's three boxes: request, manager, CFO. Everyone nods. Then production shows up with questions the canvas never asked.",
    publishedAt: "2026-07-10",
    tags: ["procure-to-pay", "workflow-engine", "fintech", "product"],
    blocks: [
      {
        kind: "h2",
        id: "the-questions",
        text: "The questions the canvas never asked",
      },
      {
        kind: "list",
        items: [
          "The approver left the company last month, and the workflow still points at them.",
          "The amount lands exactly on the threshold. Above 10k goes to finance. Is 10k above 10k?",
          "The request was approved, then someone edited one line. Does the whole chain re-run, or just the delta? Who decides that?",
          "The manager is on leave and delegated their approvals. Does the delegate's own delegation count? Until when?",
          "Approval by group: any of the five? All of them? Three out of five? In what order?",
          "A condition depends on an answer given two steps earlier. That answer just changed.",
        ],
      },
      {
        kind: "p",
        text: "I spent two years shipping and maintaining an approval workflow engine at a procurement fintech. The three boxes took a sprint. The list above took the rest.",
      },
      {
        kind: "h2",
        id: "freeze-at-init",
        text: "How we actually answered it",
      },
      {
        kind: "p",
        text: "We froze the workflow at init: conditions resolved once at launch, and a running request never re-derived them. Mid-flight edits simply didn't exist. Approval groups came straight from the teams in the HRIS. Vacations earned a proper feature, a replacement approver that applied even to workflows already running, because absence is the one thing you can't freeze. And the approver who had left the company? Fixed by hand, more often than I'd like to admit.",
      },
      {
        kind: "aside",
        text: "Freezing at init isn't a hack. It's the honest trade-off: deterministic, auditable, and it quietly declines half the list above.",
      },
      {
        kind: "h2",
        id: "the-opinion",
        text: "A workflow builder is a programming language your users never asked to learn",
      },
      {
        kind: "p",
        text: "Every condition is syntax, every unhandled edge case is a bug they'll file. So my opinion hasn't moved: keep the engine boring, deterministic, tested code, and derive the configuration from the systems that already know the answer, editable in plain language.",
      },
      {
        kind: "p",
        text: "That is what [ledgerloop](/work/ledgerloop) does with the HRIS, and what the components in [approvals-ui](/work/approvals-ui) model directly: quorum gates, amount thresholds, and a policy lint that knows what segregation of duties means. Which one of these bit you first?",
      },
    ],
  },
  {
    slug: "where-not-to-use-ai",
    title: "The hard part of an AI feature is knowing where NOT to use AI",
    metaTitle: "The hard part of an AI feature is knowing where NOT to use AI | Dylan Mérigaud",
    metaDescription:
      "A payment decision has to be exact and repeatable. So the money logic is deterministic code, and the agent only touches the three places where judgement is genuinely open-ended.",
    lead: "A payment decision has to be exact and repeatable. So in the product I built, the money logic is deterministic code, and the agent only touches the parts where judgement is genuinely open-ended.",
    publishedAt: "2026-07-06",
    tags: ["ai", "fintech", "agents", "procure-to-pay"],
    blocks: [
      {
        kind: "p",
        text: "Every AI demo right now is an agent doing everything. Point it at the problem, let it reason end to end, marvel at the trace. It demos beautifully. Then you try to put it in front of a real workflow with real money and it falls apart, because the thing that makes a demo impressive, the model deciding freely, is exactly the thing you cannot allow when the output is a payment.",
      },
      {
        kind: "p",
        text: "I spent a while building a procure-to-pay product: a vendor invoice comes in, gets extracted, matched against a purchase order, routed through an approval workflow, and reconciled. It is the kind of thing everyone now wants to put an agent on. So I did, sort of. But the interesting decision, the one that took the longest to get right, was not where to add the agent. It was where to refuse to.",
      },
      {
        kind: "h2",
        id: "exact-and-repeatable",
        text: "The rule: a payment decision must be exact and repeatable",
      },
      {
        kind: "p",
        text: 'A model is a probability distribution. Ask it the same question twice and you can get two answers. That is a feature when the task is fuzzy and a liability when the task is "does this $48,200 invoice match this purchase order". Matching, the approval engine, reconciliation: these have to be exact, auditable, and identical every run. So they are plain deterministic code. No model in the path. If a controller asks why this got approved, the answer is a code path they can read, not "the model felt it was fine".',
      },
      {
        kind: "p",
        text: "That sounds obvious written down. It is not how most people are building AI features right now. The default has become: agent first, and carve out the deterministic parts only when something breaks. I did the opposite. Deterministic by default, agent only where the trajectory is genuinely open-ended.",
      },
      {
        kind: "h2",
        id: "where-the-agent-earns-it",
        text: "The three places the agent actually earns its keep",
      },
      {
        kind: "p",
        text: "Once you hold that line, the places where AI belongs get very clear, because they are exactly the places a deterministic rule would be brittle or impossible.",
      },
      {
        kind: "p",
        text: "**Reading the messy vendor PDF.** Invoices are a thousand different layouts. A parser built on regex and rules is a losing game. This is real fuzziness: vision model in, structured data out, validated against a schema. The model does the perception; code does everything downstream once the data is structured.",
      },
      {
        kind: "p",
        text: "**Deriving the approval workflow from the org chart.** Onboarding a client used to be a forward-deployed engineer reading their HR system and hand-building the approval rules. The genuinely hard part is mapping titles to signing authority: which role approves what, resolved to a real person, with the data-quality problems (a terminated manager, two people who both look like the CEO) flagged for a human. That judgement is fuzzy, so the agent makes it. But it produces a proposal, not a decision: a human reviews and edits it in plain language before anything goes live.",
      },
      {
        kind: "p",
        text: "**Investigating a flagged exception.** When a bill trips a rule, someone has to judge it against unstructured context, notes, prior invoices, vendor history, and recommend. That is reading and reasoning over messy evidence, which is what models are good at. So the agent investigates and recommends. It does not act. A human sees the recommendation and decides.",
      },
      {
        kind: "aside",
        text: "Notice the pattern in all three: the model does perception or judgement over unstructured input, and hands a proposal to either deterministic code or a human. It never holds the pen on the outcome.",
      },
      {
        kind: "h2",
        id: "human-in-the-loop",
        text: "Human in the loop is a design principle, not a disclaimer",
      },
      {
        kind: "p",
        text: '"Human in the loop" usually shows up as a safety label bolted onto an otherwise autonomous system. Here it is structural. Nothing posts until a person approves. The agent derives, reads, investigates, recommends, and then stops. The interesting engineering is in making that handoff good: showing the human exactly what the agent concluded and why, right where they decide, so the review is fast instead of a rubber stamp or a bottleneck.',
      },
      {
        kind: "p",
        text: 'That is also the honest answer to "will AI replace this job". In a system that touches money, the agent removes the tedium (reading the PDF, drafting the workflow, triaging the exception) and leaves the decision with the person accountable for it. That is not a limitation I worked around. It is the product.',
      },
      {
        kind: "h2",
        id: "the-actual-skill",
        text: "Why this is the actual skill",
      },
      {
        kind: "p",
        text: "The prompt was never the hard part. Wiring a model to a task is a weekend. The hard part is the judgement about the system: which parts must be exact, which parts are genuinely open-ended, and how the two halves hand off without the fuzzy half ever making a decision the exact half should own. Get that wrong and you have an impressive demo that no finance team will ever trust. Get it right and the AI disappears into the places it belongs, and the rest is boring, auditable, correct code, which is exactly what you want when the output is someone's money.",
      },
      {
        kind: "p",
        text: "If you want to see the whole loop, an agent deriving an approval workflow from an HR system, then a real invoice routed through it with a live trace, paused for a human at the gate: the [ledgerloop case study](/work/ledgerloop) has it, the [demo is live](https://ledgerloop-eta.vercel.app/), and the [source is on GitHub](https://github.com/DylanMerigaud/ledgerloop). Built with [Mastra](https://mastra.ai).",
      },
    ],
  },
  {
    slug: "react-flow-auto-layout-with-dagre-variable-size-nodes",
    title: "React Flow auto layout with dagre for custom, variable-size nodes",
    metaTitle: "React Flow auto layout with dagre for variable-size nodes | Dylan Mérigaud",
    metaDescription:
      "Variable-size nodes break dagre's centering, first paint flickers, and straight chains render with kinked edges. The why and the fix for each, plus the package that does all three.",
    lead: "Variable-size nodes break dagre's centering, first paint flickers, and straight chains render with kinked edges. Here is the why and the fix for each.",
    publishedAt: "2026-07-06",
    tags: ["react-flow", "dagre", "layout", "typescript"],
    blocks: [
      {
        kind: "p",
        text: "Every React Flow and dagre tutorial shows the same thing: uniform gray boxes, laid out in a neat tree, everything centered. You copy the pattern, wire it up, and it works. Then you replace the gray boxes with real cards. A title that wraps to two lines. A card with a description and one without. And the layout starts to look subtly wrong: a parent sits off-center from its children, edges bend where they should be straight, and everything flashes in the top-left corner for a frame before jumping into place.",
      },
      {
        kind: "p",
        text: "I hit all three building an approval-workflow graph for a fintech app. The nodes were cards with variable content, so none of the fixed-size assumptions held. It took a while to understand that these are three separate bugs with three separate causes. So here is each one, why it happens, and the fix. At the end: the small package where I put all of it, so you do not have to rebuild this.",
      },
      {
        kind: "h2",
        id: "barycenter",
        text: "Why dagre centers nodes off-balance (and the bounding-box fix)",
      },
      {
        kind: "p",
        text: "dagre centers a parent on the barycenter of its children, meaning the average of their center positions. That is correct when every child is the same size. It is visibly wrong when they are not.",
      },
      {
        kind: "p",
        text: "Concrete numbers from a graph I probed. A parent with two children, one 40px tall and one 200px tall. dagre puts the children at centers y=20 and y=180, so the parent lands at their average, y=100. But the visual middle of that group, the midpoint of the bounding box from the top of the small child to the bottom of the tall one, is y=140. The parent is 40px off from where your eye says it should be, and the taller the imbalance, the worse it gets.",
      },
      {
        kind: "p",
        text: "The fix is a post-pass on dagre's output: for every parent with two or more children, recompute its cross-axis position as the midpoint of the children's bounding box, walking deepest rank first so children settle before their parents. Join nodes get the mirrored treatment, centered on their parents' box.",
      },
      {
        kind: "h2",
        id: "flicker",
        text: "Fixing the React Flow layout flicker on first render",
      },
      {
        kind: "p",
        text: "React Flow can only measure a node after it renders. dagre needs the sizes before it can lay out. So the naive order is: render at 0,0, measure, lay out, move. The user sees every node stacked in the corner for a frame, then the jump. There is a long-running xyflow discussion about exactly this ([xyflow/xyflow#2973](https://github.com/xyflow/xyflow/issues/2973)).",
      },
      {
        kind: "p",
        text: "The sequence that works: seed every node with `visibility: hidden` so nothing paints. Wire `onNodesChange`, or the measurements never flow back and `useNodesInitialized` never flips. When it is true, run the layout with the measured sizes, apply positions, and flip to `visibility: visible` in the same update.",
      },
      {
        kind: "aside",
        text: "The trap inside the trap: right after a node resizes, `node.measured` can hold the stale value for a tick. Read sizes off the dimensions change events instead; they carry the new size at the moment it changes.",
      },
      {
        kind: "h2",
        id: "kinks",
        text: "Straight edges in React Flow: fixing dagre curved connectors",
      },
      {
        kind: "p",
        text: "A chain A to B to C, single edge in and out, should read as one straight line. Instead the connector often steps down and back up ([xyflow/xyflow#3218](https://github.com/xyflow/xyflow/issues/3218)). The cause: a smoothstep edge places its elbow at the midpoint between the two handles, and handles sit at node centers, so different heights mean different centers and the connector bends.",
      },
      {
        kind: "p",
        text: "For linear chains, snap the child's cross-axis center onto the source's so the run is colinear. For fan-outs and joins, anchor the elbow to the shared hub so every elbow lines up whatever the node sizes.",
      },
      {
        kind: "h2",
        id: "fan-out-order",
        text: "A fourth one, which is not a layout problem at all",
      },
      {
        kind: "p",
        text: "dagre runs crossing-minimisation, which is the correct thing for a general graph and the wrong thing for an approval flow. It reshuffles fan-out branches to reduce edge crossings, so the order you declared your edges in is not the order they render in.",
      },
      {
        kind: "p",
        text: "That matters when the order carries meaning. In an approval flow the branches are not interchangeable, they are a policy someone wrote in a specific sequence and will be asked to defend. So the library keeps fan-out in your declared edge order and accepts the extra crossing. Three of the four fixes here are not smarter graph theory, they are refusing a defensible default that is wrong for this domain.",
      },
      {
        kind: "h2",
        id: "the-library",
        text: "The library: react-flow-auto-layout",
      },
      {
        kind: "p",
        text: "I extracted all of this into a small library. Install it with `npm i react-flow-auto-layout`. The `useAutoLayout` hook handles the whole measure-then-layout dance; there is also a pure layout function, plus `AlignedStepEdge` and `withAlignedElbows` for the hub-anchored elbows. dagre underneath, dual ESM and CJS, typed, MIT.",
      },
      {
        kind: "code",
        lang: "tsx",
        caption: "The measurement dance, hidden behind one hook",
        code: `const { nodes, edges, onNodesChange, onEdgesChange } =
  useAutoLayout({ nodes: sourceNodes, edges: sourceEdges });`,
      },
      {
        kind: "p",
        text: "Honest limits: the elbow alignment only applies to step edges, and dagre suits the graph sizes React Flow is typically used at, tens of nodes in a few milliseconds, not thousands. The measurement pass also costs a hidden render, which is invisible at approval-flow sizes and would not be at graph-explorer sizes. I have not measured where that stops being free, so I am not going to claim a number for it.",
      },
      {
        kind: "p",
        text: "It lays out the canvas in [approvals-ui](/work/approvals-ui) and the approval flow in [ledgerloop](/work/ledgerloop). [npm](https://www.npmjs.com/package/react-flow-auto-layout) · [source](https://github.com/DylanMerigaud/react-flow-auto-layout) · [live demo](https://react-flow-auto-layout-ecru.vercel.app).",
      },
    ],
  },
];

export const articleSlugs = articles.map((article) => article.slug);

export const getArticle = (slug: string): Article | null =>
  articles.find((article) => article.slug === slug) ?? null;

// Derived, never hand-declared: a stated reading time that drifts from the body
// is a small lie on a page whose whole argument is that the numbers are real.
// 200 wpm, rounded up, code counted at a third since it is scanned, not read.
export const readingMinutes = (article: Article): number => {
  const words = article.blocks.reduce((total, block) => {
    if (block.kind === "code") return total + block.code.split(/\s+/u).length / 3;
    if (block.kind === "list") return total + block.items.join(" ").split(/\s+/u).length;
    return total + block.text.split(/\s+/u).length;
  }, article.lead.split(/\s+/u).length);
  return Math.max(1, Math.ceil(words / 200));
};

export const formatArticleDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

// `stage` and `index` place the homepage Notes section on the trace, between
// policy (02) and scope (04). Keep them in step with the stages in lib/copy.ts,
// which owns the numbering rule: PAGE SECTIONS take 01..05 and the three
// PROJECTS take A, B, C, because one shared 01..08 run made a project and a
// section look like the same kind of thing.
export const notes = {
  stage: "record",
  index: "03",
  eyebrow: "the record",
  // The marker label on the homepage. Separate from `eyebrow` because the marker
  // already prints the stage: "03 · record / the record" stutters, and the
  // breadcrumb on /blog wants the noun, not this claim.
  sectionLabel: "published here first",
  heading: "Notes",
  intro:
    "Long-form writing on the parts that survive real usage. Published here first, syndicated after.",
  empty: "Nothing published yet.",
  backLabel: "All notes",
} as const;
