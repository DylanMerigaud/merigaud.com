// Central next/font definitions. Mona Sans carries display AND body (its width
// axis is the display voice: wide for the deterministic line, narrow for the
// messy one); Geist Mono carries the trace annotations, tags, and figures.
import { Geist_Mono, Mona_Sans } from "next/font/google";

export const fontSans = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
