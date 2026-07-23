"use client";

const ErrorPage = ({ reset }: { error: Error; reset: () => void }) => (
  <main className="on-dark bg-ink-deep flex min-h-svh flex-col items-start justify-center px-6 md:px-10">
    <div className="mx-auto w-full max-w-6xl">
      <p className="eyebrow text-trace-dark">error · flagged for review</p>
      <h1 className="h1-display h1-wide text-paper mt-6 max-w-4xl">Something failed mid-trace.</h1>
      <button
        type="button"
        onClick={reset}
        className="bg-paper text-ink hover:bg-paper-dim mt-10 inline-flex min-h-11 items-center rounded-md px-6 py-3 font-medium transition-colors"
      >
        Run it again
      </button>
    </div>
  </main>
);

export default ErrorPage;
