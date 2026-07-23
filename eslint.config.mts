import { next } from "@dylanmerigaud/config/eslint/next";

export default [
  ...next({ tsconfigRootDir: import.meta.dirname }),

  // Next's file convention requires a default export here; the preset's
  // app-router allowlist covers robots/sitemap but misses manifest.
  {
    files: ["app/manifest.ts"],
    rules: {
      "import-x/no-default-export": "off",
    },
  },

  // scripts/ holds standalone tsx CLIs (the hero-video generator). Terminal
  // output and raw env access ARE a CLI's job; mirrors the preset's standing
  // scripts/** relaxation in the template.
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "no-console": "off",
      "custom/no-console-use-logger": "off",
      "unicorn/no-process-exit": "off",
    },
  },
];
