import { filesSection } from "@/lib/copy";
import { hostOf, publishedFiles } from "@/lib/files";

// The public pages of the data files I sell, listed so a reader who lands here
// from one of my emails finds them. No marker on the trace: it is a list, not
// a stage of the run. Renders nothing while no page is published.
export const FilesSection = () =>
  publishedFiles.length === 0 ? null : (
    <section aria-label="Files" data-ph-surface="files-list" className="py-16 md:py-24">
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <div className="pl-7 md:pl-10">
          <p className="eyebrow text-trace">{filesSection.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {filesSection.heading}
          </h2>
          <p className="text-ink/75 mt-4 max-w-xl leading-relaxed">{filesSection.intro}</p>
          <ul className="border-ink/15 mt-10 max-w-4xl border-t">
            {publishedFiles.map((file) => (
              <li key={file.url} className="border-ink/15 border-b">
                <a href={file.url} className="group block py-5">
                  <p className="eyebrow text-trace">{hostOf(file.url)}</p>
                  <h3 className="group-hover:text-stamp mt-2 max-w-[52ch] text-lg font-semibold tracking-tight transition-colors md:text-xl">
                    {file.title}
                  </h3>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
