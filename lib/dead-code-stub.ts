// Empty-ish module, referenced only from next.config.ts's `turbopack.resolveAlias` (a raw string
// path, invisible to knip and to every import graph in this repo, hence the ignore entry in
// knip.json).
//
// This is the Next-documented fallback for a dependency graph that reaches code Turbopack cannot
// bundle (nextjs.org's v16 upgrade guide gives the identical recipe for a Node builtin pulled
// into a client bundle: alias it to an empty file). Here the unreachable code is not a Node
// builtin but a kit packaging defect (VERIFIED by build failure, not guessed):
// `@dylanmerigaud/microsaas-kit/analytics/components`'s barrel co-bundles `ConsentBanner` (needs
// class-variance-authority, radix-ui, and, via the kit's own `cn()` helper, clsx +
// tailwind-merge) together with `PostHogClient`/`TrackClicks` (app/layout.tsx via
// components/posthog-client.tsx, which this site does need). Importing either of the latter two
// therefore also resolves `ConsentBanner`'s dependencies, even though this site imports neither
// `ConsentBanner` nor shadcn (components/consent-banner.tsx is this site's own; see that file's
// doc comment for why). None of the four packages below are reachable at runtime: nothing in
// this repo renders the kit's `ConsentBanner` or calls into its `ui/button.tsx`.
//
// Turbopack validates named exports statically even for a module nothing ever calls into, so a
// truly empty file is not enough: every binding the dead import chain destructures has to exist
// here, hence one stub export per aliased package below.
//
// TODO(kit): the correct fix lives upstream, moving `ConsentBanner` out of
// `/analytics/components` into its own subpath so a consumer with no shadcn never resolves it.
// Flagged in the task-H report; this file is the stopgap until that ships.
export const cva = (..._args: readonly unknown[]): string => ""; // class-variance-authority
export const Slot = {}; // radix-ui
export const clsx = (..._args: readonly unknown[]): string => ""; // clsx
export const twMerge = (...classLists: readonly string[]): string => classLists.join(" "); // tailwind-merge
