import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkFigure } from "@/components/work-figure";
import { site } from "@/lib/copy";
import { caseSlugs, getCasePage } from "@/lib/work-pages";

export const generateStaticParams = () => caseSlugs.map((slug) => ({ slug }));

type PageParams = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({ params }: PageParams): Promise<Metadata> => {
  const { slug } = await params;
  const result = getCasePage(slug);
  if (result === null) return {};
  return {
    title: result.page.metaTitle,
    description: result.page.metaDescription,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "article",
      url: `${site.url}/work/${slug}`,
      siteName: site.name,
      title: result.page.metaTitle,
      description: result.page.metaDescription,
      images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    },
  };
};

const CaseStudyPage = async ({ params }: PageParams) => {
  const { slug } = await params;
  const result = getCasePage(slug);
  if (result === null) notFound();
  const { page, item } = result;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "the trace", item: `${site.url}/#work` },
      { "@type": "ListItem", position: 2, name: item.title, item: `${site.url}/work/${slug}` },
    ],
  };

  return (
    <main className="sheet relative min-h-svh">
      <script
        type="application/ld+json"
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- static JSON-LD from our own data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <nav aria-label="Breadcrumb" className="eyebrow text-trace">
          <Link
            href="/#work"
            className="hover:text-ink underline-offset-4 transition-colors hover:underline"
          >
            the trace
          </Link>{" "}
          / {item.index} · {item.stage} / {item.title}
        </nav>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">{item.title}</h1>
        <p className="text-ink/90 mt-4 max-w-2xl text-xl leading-snug font-medium">{item.lead}</p>
        <p className="text-ink/75 mt-4 max-w-2xl leading-relaxed">{page.intro}</p>

        <ul className="mt-8 flex flex-wrap items-center gap-4">
          {item.links
            .filter((link) => !link.href.startsWith("/work"))
            .map((link, index) =>
              index === 0 && /demo|playground/i.test(link.label) ? (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="link-arrow bg-stamp hover:bg-stamp/85 inline-flex min-h-11 items-center rounded-md px-5 py-2.5 font-medium text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ) : (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="link-arrow text-stamp decoration-stamp/40 hover:decoration-stamp font-medium underline underline-offset-4"
                  >
                    {link.label}
                  </a>
                </li>
              )
            )}
        </ul>

        {/* Spec strip: hard, checkable facts up top for a scanning CTO. */}
        <dl className="border-ink/15 divide-ink/15 mt-12 grid max-w-3xl grid-cols-3 divide-x border-y">
          {page.specs.map((spec) => (
            <div key={spec.label} className="px-5 py-4 first:pl-0">
              <dt className="eyebrow text-trace">{spec.label}</dt>
              <dd className="mt-1 text-lg font-semibold tracking-tight">{spec.value}</dd>
            </div>
          ))}
        </dl>

        {/* Text left, figure sticky right so the empty column carries evidence. */}
        <div className="mt-16 lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="space-y-12 lg:col-span-7">
            {page.sections.map((section) => (
              <section key={section.heading} className="max-w-[62ch]">
                <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="text-ink/75 mt-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
          <div className="mt-10 lg:col-span-5 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <WorkFigure figure={item.figure} />
            </div>
          </div>
        </div>

        <ul aria-label="Stack" className="mt-14 flex flex-wrap gap-x-4 gap-y-1.5">
          {item.tags.map((tag) => (
            <li key={tag} className="eyebrow text-trace">
              {tag}
            </li>
          ))}
        </ul>

        <div className="border-ink/15 mt-16 flex flex-wrap items-center gap-6 border-t pt-10">
          <a
            href={`mailto:${site.email}`}
            className="bg-ink text-paper inline-flex min-h-11 items-center rounded-md px-6 py-3 font-medium transition-opacity hover:opacity-85"
          >
            {site.email}
          </a>
          <Link
            href="/#work"
            className="link-arrow text-stamp decoration-stamp/40 hover:decoration-stamp font-medium underline underline-offset-4"
          >
            Back to the trace
          </Link>
        </div>
      </div>
    </main>
  );
};

export default CaseStudyPage;
