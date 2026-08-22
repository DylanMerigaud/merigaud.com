/**
 * Serialize a JSON-LD object for a <script type="application/ld+json"> tag. A raw `<` is
 * escaped to its \u003c form so a hostile closing script tag inside copy (a title, a
 * description) cannot break out of the script element and inject HTML; JSON.parse reverses the
 * escape so the emitted markup is unaffected. Same behavior as
 * @dylanmerigaud/microsaas-kit/structured-data's own serializeJsonLd, kept local rather than
 * imported: the kit's export only types SoftwareApplication / FAQPage / BlogPosting, and this
 * site's JSON-LD (a ProfilePage @graph, a BreadcrumbList, a BlogPosting + BreadcrumbList @graph)
 * does not use the kit's builders at all, so there is no narrower type to bind here. PROPAGATE
 * finding, 2026-08-21: this site was passing a raw JSON.stringify at app/blog/[slug]/page.tsx,
 * app/page.tsx and app/work/[slug]/page.tsx while every other repo built on the kit already
 * escaped.
 */
export const serializeJsonLd = (schema: Record<string, unknown>): string =>
  JSON.stringify(schema).replaceAll("<", String.raw`\u003c`);
