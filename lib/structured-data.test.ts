import assert from "node:assert/strict";
import { test } from "node:test";

import { serializeJsonLd } from "@/lib/structured-data";

// The injection gate: a title or description containing a closing script tag must never be
// able to break out of the JSON-LD <script> element. Regression for the 2026-08-21 kit
// divergence finding: this site previously passed a raw JSON.stringify to
// dangerouslySetInnerHTML on three pages instead of escaping through this function.

test("serializeJsonLd escapes a raw < so a closing script tag cannot break out", () => {
  const hostile = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "</script><script>alert(1)</script>",
  };

  const before = JSON.stringify(hostile);
  const after = serializeJsonLd(hostile);

  // The raw (unsafe) serialization DOES contain literal script tags, proving the input is
  // genuinely hostile and not already inert.
  assert.ok(before.includes("<script>"), "the unescaped baseline must contain a raw <script>");
  assert.ok(before.includes("</script>"), "the unescaped baseline must contain a raw </script>");

  // The escaped output must contain no raw "<" at all: a browser parsing the surrounding
  // HTML can never read a closing script tag as markup there, only as JSON text.
  assert.ok(!after.includes("<"), "serializeJsonLd output must contain zero raw < characters");

  // The escape must round-trip: parsing the serialized string yields back the exact same
  // object, so nothing about the payload itself changed, only its script-safety.
  assert.deepEqual(JSON.parse(after), hostile, "escaping must round-trip to the exact same object");
});

test("serializeJsonLd is a no-op for content with no <", () => {
  const clean = { "@context": "https://schema.org", "@type": "WebPage", name: "About" };
  assert.equal(serializeJsonLd(clean), JSON.stringify(clean));
});
