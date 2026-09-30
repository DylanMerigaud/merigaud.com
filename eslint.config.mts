import { next } from "@dylanmerigaud/config/eslint/next";

export default [
  // references/ holds copy-me starter files (the AI generator, the WDK wiring) that
  // no bet imports until it copies them out. They are intentionally not part of this
  // app, so lint/knip/tsc all skip them here; a bet lints them after copying.
  //
  // packages/microsaas-kit is the imported kit: a published library, not this Next app, and
  // several of the preset's bans describe what it legitimately IS (subpath index/barrel files
  // ARE its export map, src/env IS the process.env reader, src/logger IS the console user). It
  // is ignored HERE and linted THERE, by packages/microsaas-kit/eslint.config.mts, which carves
  // out exactly those and keeps every real rule. This line is not a lint exemption: CI runs the
  // kit's own lint alongside its build and tests. A bet clone resolves it from npm, inert as
  // source.
  //
  // .claude/ holds agent worktrees, which are full copies of this repo. Neither ESLint nor
  // Prettier reads .gitignore, so without this every finding gets reported once per live
  // worktree; the same ignore is repeated in .prettierignore.
  { ignores: ["references/**", "packages/**", ".claude/**"] },

  ...next({ tsconfigRootDir: import.meta.dirname }),

  // Next's file convention requires a default export here; the preset's
  // app-router allowlist covers page/layout/route/sitemap/robots but misses manifest.
  {
    files: ["app/manifest.ts"],
    rules: {
      "import-x/no-default-export": "off",
    },
  },

  // shadcn/ui components are vendored: `shadcn add` writes them as
  // `function Button() {}` declarations. Relaxing `func-style` here (and nothing
  // else) keeps `shadcn add` friction-free instead of hand-editing every
  // component to an arrow const. App code outside components/ui stays fully strict.
  {
    files: ["components/ui/**/*.tsx"],
    rules: {
      "func-style": "off",
    },
  },

  // lib/logger.ts is the ONE sanctioned console user (the logger everything else
  // routes through). Lift the console ban here only.
  {
    files: ["lib/logger.ts"],
    rules: {
      "custom/no-console-use-logger": "off",
    },
  },

  // Standalone CLI entrypoints (the DB seed, scripts) legitimately `process.exit`
  // on bad config; unicorn's no-process-exit is for library code, not CLIs.
  {
    files: ["db/seed.ts", "scripts/**/*.ts", "setup/**/*.ts"],
    rules: {
      "unicorn/no-process-exit": "off",
    },
  },

  // setup/ is the setup CLI (`pnpm setup`): a standalone tsx entrypoint exactly like
  // scripts/. This mirrors the preset's standing scripts/** relaxation (see
  // @dylanmerigaud/config eslint/next.ts: terminal output and raw env access ARE a
  // CLI's job), applied to the setup dir; it is not a new exception class.
  {
    files: ["setup/**/*.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "no-console": "off",
      "custom/no-console-use-logger": "off",
    },
  },
];
