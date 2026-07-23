import Link from "next/link";

import { notFound } from "@/lib/copy";

export default function NotFound() {
  return (
    <main className="on-dark bg-ink-deep flex min-h-svh flex-col items-start justify-center px-6 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <p className="eyebrow text-trace-dark">{notFound.eyebrow}</p>
        <h1 className="h1-display h1-wide text-paper mt-6 max-w-4xl">{notFound.heading}</h1>
        <Link
          href="/"
          className="link-arrow bg-paper text-ink hover:bg-paper-dim mt-10 inline-flex min-h-11 items-center rounded-md px-6 py-3 font-medium transition-colors"
        >
          {notFound.cta}
        </Link>
      </div>
    </main>
  );
}
