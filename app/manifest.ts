import type { MetadataRoute } from "next";

import { site } from "@/lib/copy";

const manifest = (): MetadataRoute.Manifest => ({
  name: site.name,
  short_name: "Merigaud",
  description: site.description,
  start_url: "/",
  display: "browser",
  background_color: "#0a0b0d",
  theme_color: "#0a0b0d",
  icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
});

export default manifest;
