import data from "./files.json";

export type PublishedFile = { title: string; url: string };

const PAGE_URL = /^https:\/\/[a-z0-9-]+\.merigaud\.com\/?$/;

// lib/files.json is written by a machine (growth-cockpit scripts/bet_pages.py
// sync): anything that is not a title and an https merigaud.com URL is dropped
// here rather than rendered.
const isPublishedFile = (value: unknown): value is PublishedFile =>
  typeof value === "object" &&
  value !== null &&
  "title" in value &&
  "url" in value &&
  typeof value.title === "string" &&
  value.title.trim() !== "" &&
  typeof value.url === "string" &&
  PAGE_URL.test(value.url);

const entries: readonly unknown[] = data;

export const publishedFiles: readonly PublishedFile[] = entries.filter(isPublishedFile);

export const hostOf = (url: string): string => new URL(url).host;
