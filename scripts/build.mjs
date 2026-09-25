/**
 * Builds Ratchet.
 *
 * For each bundle in bundles.mjs, the sources are concatenated in order and written as:
 *
 *   dist/js/<name>.js                 plain browser script
 *   dist/js/<name>.min.js (+ .map)    minified, with a source map back to the original files
 *   dist/components/ratchet/<file>    UMD/AMD module (what Cloud CMS loads as "ratchet/...")
 *
 * dist/components/ratchet also gets component.json, the web/ styles and the dynamic/ gadgets.
 *
 * Usage:
 *   node scripts/build.mjs            build once
 *   node scripts/build.mjs --watch    build, then rebuild on changes
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import { bundles } from "./bundles.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const JS_DIR = path.join(DIST, "js");
const COMPONENT_DIR = path.join(DIST, "components", "ratchet");

// esbuild won't emit syntax newer than this (the sources already use let / for...of)
const TARGET = "es2015";

// strips any UTF-8 BOM so it doesn't end up in the middle of a concatenated file
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^﻿/, "");

const pkg = () => JSON.parse(read("package.json"));

/**
 * Concatenates source files, returning the code plus a line-level source map back to the originals.
 * Files are joined with a newline since most of them don't end with one.
 */
function concat(files, { header = "" } = {})
{
    const code = [];
    const mappings = [];
    let prevSource = 0;
    let prevLine = 0;

    // header lines map to nothing
    if (header)
    {
        code.push(header);
        for (let i = 0; i < header.split("\n").length - 1; i++) {
            mappings.push("");
        }
    }

    const contents = files.map(read);
    contents.forEach((text, sourceIndex) => {
        code.push(text, "\n");

        const lineCount = text.split("\n").length;
        for (let line = 0; line < lineCount; line++)
        {
            // [generated column, source index delta, source line delta, source column]
            mappings.push(vlq(0) + vlq(sourceIndex - prevSource) + vlq(line - prevLine) + vlq(0));
            prevSource = sourceIndex;
            prevLine = line;
        }
    });

    return {
        code: code.join(""),
        map: {
            version: 3,
            sources: files.map((file) => path.relative(JS_DIR, path.join(ROOT, file)).split(path.sep).join("/")),
            sourcesContent: contents,
            names: [],
            mappings: mappings.join(";")
        }
    };
}

const VLQ_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function vlq(value)
{
    let v = value < 0 ? ((-value) << 1) | 1 : value << 1;
    let out = "";
    do {
        let digit = v & 31;
        v >>>= 5;
        if (v > 0) {
            digit |= 32;
        }
        out += VLQ_CHARS[digit];
    } while (v > 0);
    return out;
}

/**
 * Wraps a script as a UMD module (AMD, CommonJS or browser global).
 */
function umd(script, { deps, params, globals, variable })
{
    return `/**
 * UMD wrapper for compatibility with browser, Node and AMD.
 *
 * Based on:
 *   https://github.com/umdjs/umd/blob/master/returnExports.js
 */
(function (root, factory)
{
    var umdEnabled = true;
    if (root && typeof(root.umd) != "undefined") {
        umdEnabled = root.umd;
    }

    if (umdEnabled && typeof exports === 'object')
    {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    }
    else if (umdEnabled && typeof define === 'function' && define.amd)
    {
        // AMD. Register as an anonymous module.
        define(${JSON.stringify(deps)}, factory);
    }
    else
    {
        // Browser globals
        root["${variable}"] = factory(${globals.join(", ")});
    }

}(this, function (${params.join(", ")}) {

${script}

    return ${variable};

}));
`;
}

async function buildBundle(name, bundle, banner, componentBanner)
{
    // plain script
    const { code, map } = concat(bundle.files);
    const js = banner + code;
    fs.writeFileSync(path.join(JS_DIR, `${name}.js`), js);

    // minified, with the concatenation's source map passed in so the output maps to the original files
    const inlineMap = Buffer.from(JSON.stringify(map)).toString("base64");
    const minified = await esbuild.transform(`${code}\n//# sourceMappingURL=data:application/json;base64,${inlineMap}\n`, {
        loader: "js",
        minify: true,
        target: TARGET,
        sourcemap: "external",
        sourcefile: `${name}.js`,
        legalComments: "inline",
        logLevel: "error"
    });
    fs.writeFileSync(path.join(JS_DIR, `${name}.min.js`), `${banner}${minified.code}//# sourceMappingURL=${name}.min.js.map\n`);
    fs.writeFileSync(path.join(JS_DIR, `${name}.min.js.map`), shiftMap(minified.map, banner));

    // UMD component
    fs.writeFileSync(path.join(COMPONENT_DIR, bundle.component.file), componentBanner + umd(banner + code, bundle.component));

    return { name, bytes: js.length, minBytes: minified.code.length };
}

/**
 * Offsets a source map by the lines of the banner prepended to the minified file.
 */
function shiftMap(mapJson, banner)
{
    const map = JSON.parse(mapJson);
    map.mappings = ";".repeat(banner.split("\n").length - 1) + map.mappings;
    return JSON.stringify(map);
}

function buildComponentAssets(version)
{
    // everything in components/ratchet (styles etc.), with the version stamped into component.json
    fs.cpSync(path.join(ROOT, "components", "ratchet"), COMPONENT_DIR, { recursive: true, filter: notJunk });
    const componentJson = JSON.parse(read("components/ratchet/component.json"));
    componentJson.version = version;
    fs.writeFileSync(path.join(COMPONENT_DIR, "component.json"), JSON.stringify(componentJson, null, 4) + "\n");

    // dynamic gadgets are shipped as-is and loaded by AMD as "ratchet/dynamic/..."
    fs.cpSync(path.join(ROOT, "dynamic"), path.join(COMPONENT_DIR, "dynamic"), { recursive: true, filter: notJunk });
}

const notJunk = (src) => ![".DS_Store", ".idea"].includes(path.basename(src));

export async function build()
{
    const start = Date.now();
    const { version } = pkg();

    const banner = read("license.txt").replace(/Ratchet Version \S+/, `Ratchet Version ${version}`) + "\n";
    const componentBanner = read("js/license.js") + "\n";

    fs.rmSync(DIST, { recursive: true, force: true });
    fs.mkdirSync(JS_DIR, { recursive: true });
    fs.mkdirSync(COMPONENT_DIR, { recursive: true });

    const results = await Promise.all(Object.entries(bundles).map(([name, bundle]) => buildBundle(name, bundle, banner, componentBanner)));
    buildComponentAssets(version);

    console.log(`Built Ratchet ${version} in ${Date.now() - start}ms`);
    for (const { name, bytes, minBytes } of results) {
        console.log(`  ${name.padEnd(20)} ${String(bytes).padStart(8)} bytes  ->  ${String(minBytes).padStart(7)} min`);
    }
}

export function watch()
{
    let timer = null;
    const rebuild = () => {
        clearTimeout(timer);
        timer = setTimeout(() => build().catch((err) => console.error(err)), 100);
    };
    for (const dir of ["js", "thirdparty", "dynamic", "components"]) {
        fs.watch(path.join(ROOT, dir), { recursive: true }, rebuild);
    }
    console.log("Watching js/, thirdparty/, dynamic/ and components/ for changes...");
}

// run as script
if (process.argv[1] === fileURLToPath(import.meta.url))
{
    try {
        await build();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

    if (process.argv.includes("--watch")) {
        watch();
    }
}
