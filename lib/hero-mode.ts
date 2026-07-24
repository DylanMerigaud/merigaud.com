// One source for the "should the ink3d hero run?" decision, shared by the
// runtime gate (hero-gate.tsx) and the pre-paint flash guard (the inline script
// in layout.tsx). The two MUST agree: if they drift, the headline-flash bug
// comes back. The media-query strings below are the shared constants, and
// PRE_INK_SCRIPT is built from them so the inline guard cannot diverge from
// wantsInkHero().

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const DESKTOP = "(min-width: 768px)";

const hasWebgl2 = (): boolean => {
  try {
    return document.createElement("canvas").getContext("webgl2") !== null;
  } catch {
    return false;
  }
};

// Desktop + WebGL2 + motion allowed + not data-saver. Client-only (reads window).
export const shouldRunInkHero = (): boolean => {
  if (window.matchMedia(REDUCED_MOTION).matches) return false;
  if (!window.matchMedia(DESKTOP).matches) return false;
  const connection: unknown = Reflect.get(navigator, "connection");
  if (
    typeof connection === "object" &&
    connection !== null &&
    "saveData" in connection &&
    connection.saveData === true
  ) {
    return false;
  }
  return hasWebgl2();
};

// Runs before the hero paints (a raw string: no imports are available that
// early), mirrors shouldRunInkHero(), and marks <html class="pre-ink"> so CSS
// holds the headline hidden through the loading shell (no flash).
//
// This MUST stay a single plain string literal. Building it by interpolating the
// query constants above made the production minifier mangle it into broken JS
// (the IIFE threw, pre-ink was never set, the headline flashed). It only shows in
// a minified build, not in dev. So: hand-mirror the same checks as
// shouldRunInkHero() here, and keep them in sync by eye. Keep it literal.
export const PRE_INK_SCRIPT =
  "(function(){try{var d=document.documentElement,m=window.matchMedia;if(m('(prefers-reduced-motion: reduce)').matches)return;if(!m('(min-width: 768px)').matches)return;var c=navigator.connection;if(c&&c.saveData===true)return;var g=false;try{g=!!document.createElement('canvas').getContext('webgl2')}catch(e){}if(g)d.classList.add('pre-ink')}catch(e){}})();";
