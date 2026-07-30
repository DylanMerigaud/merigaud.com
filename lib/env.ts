// The ONE place `process.env` is read on this site (the shared eslint preset
// bans it everywhere else and exempts this filename by name, so no lint
// carve-out is needed here).
//
// Deliberately NOT spreading the kit's `baseClientSchema` / `baseServerSchema`
// (`@dylanmerigaud/microsaas-kit/env`): the client base requires
// `NEXT_PUBLIC_APP_URL` and the server base requires `DATABASE_URL`, and this
// site is a static portfolio with neither and no use for either. The kit's
// analytics pieces (`createServerAnalytics`, `PostHogClient`) take their
// config injected rather than reading env themselves, precisely so a site
// outside the bet mould (no app URL, no database) can still consume them by
// declaring only what it actually needs below.
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
