// Bundled into the "ratchet" bundle by esbuild (see scripts/bundles.mjs) as a self-contained IIFE, so that
// morphdom neither leaks a global nor registers itself with an AMD loader.
import morphdom from "morphdom";

Ratchet.morphdom = morphdom;
