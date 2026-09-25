/**
 * Test harness for Ratchet.
 *
 * Each call to createRatchet() boots a fresh jsdom window with jQuery and the built Ratchet bundles
 * (from dist/js) loaded as plain browser globals, exactly like <script> tags would.
 * Run `npm run build` first (`npm test` does this for you).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DIST = path.join(ROOT, "dist");

const cache = {};
const source = (file) => (cache[file] ??= fs.readFileSync(file, "utf8"));

const JQUERY = require.resolve("jquery/dist/jquery.js");

export function distFile(...parts)
{
    const file = path.join(DIST, ...parts);
    if (!fs.existsSync(file)) {
        throw new Error(`Missing ${path.relative(ROOT, file)} - run "npm run build" first`);
    }
    return file;
}

/**
 * @param {Object} options
 * @param {String[]} options.bundles   bundle names from dist/js, loaded in order
 * @param {Boolean} options.min        load the .min.js variants
 * @param {String[]} options.scripts   extra scripts (relative to the repo root) loaded after the bundles
 * @param {String} options.body        initial <body> html
 */
export function createRatchet({ bundles = ["ratchet"], min = false, scripts = [], body = "" } = {})
{
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${body}</body></html>`, {
        url: "http://localhost/",
        runScripts: "outside-only",
        pretendToBeVisual: true
    });
    const { window } = dom;

    window.eval(source(JQUERY));
    for (const bundle of bundles) {
        window.eval(source(distFile("js", `${bundle}${min ? ".min" : ""}.js`)));
    }
    for (const script of scripts) {
        window.eval(source(path.join(ROOT, script)));
    }

    return {
        window,
        document: window.document,
        $: window.jQuery,
        Ratchet: window.Ratchet,
        close: () => window.close()
    };
}

/**
 * Waits for pending work (microtasks and short timers) to flush.
 */
export const settle = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls until `predicate` returns truthy.
 */
export async function until(predicate, { timeout = 2000, message = "condition" } = {})
{
    const start = Date.now();
    while (!predicate())
    {
        if (Date.now() - start > timeout) {
            throw new Error(`Timed out waiting for ${message}`);
        }
        await settle(5);
    }
}
