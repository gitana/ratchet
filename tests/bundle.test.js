import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { createRequire } from "node:module";
import { describe, it, expect } from "vitest";
import { bundles } from "../scripts/bundles.mjs";
import { ROOT, DIST, distFile, createRatchet } from "./harness.js";

const require = createRequire(import.meta.url);
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const read = (...parts) => fs.readFileSync(distFile(...parts), "utf8");

describe("dist/js", () => {
    it.each(Object.keys(bundles))("builds %s, minified, with a source map", (name) => {
        const js = read("js", `${name}.js`);
        const min = read("js", `${name}.min.js`);
        const map = JSON.parse(read("js", `${name}.min.js.map`));

        for (const code of [js, min]) {
            expect(code.startsWith("/*!")).toBe(true);
            expect(code).toContain(`Ratchet Version ${pkg.version}`);
        }
        expect(min.length).toBeLessThan(js.length);
        expect(min).toContain(`//# sourceMappingURL=${name}.min.js.map`);

        // the map points back at the original source files, not the concatenated bundle
        expect(map.sources).toEqual(bundles[name].files.map((file) => `../../${file}`));
        expect(map.sourcesContent).toHaveLength(bundles[name].files.length);
    });

    it("minified bundles only use syntax the sources already use", () => {
        // guards against the minifier emitting newer syntax than the sources (e.g. optional chaining)
        const min = read("js", "ratchet.min.js");
        expect(min).not.toMatch(/\?\.[a-zA-Z_$(]/);
        expect(min).not.toMatch(/\?\?/);
    });
});

describe("dist/ratchet", () => {
    const COMPONENTS = path.join(DIST, "ratchet");

    it("writes component.json with the package version", () => {
        const json = JSON.parse(read("ratchet", "component.json"));
        expect(json.name).toBe("ratchet");
        expect(json.version).toBe(pkg.version);
        expect(json.main).toEqual(["ratchet.js"]);
    });

    it("ships the dynamic gadgets and web styles", () => {
        const dynamic = fs.readdirSync(path.join(ROOT, "src", "dynamic"), { recursive: true }).filter((f) => !f.endsWith(".DS_Store"));
        for (const file of dynamic) {
            expect(fs.existsSync(path.join(COMPONENTS, "dynamic", file)), file).toBe(true);
        }
        expect(fs.existsSync(path.join(COMPONENTS, "web", "core.css"))).toBe(true);
    });

    it("loads every module through AMD with the declared dependencies", () => {
        const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "http://localhost/", runScripts: "outside-only" });
        const { window } = dom;
        window.eval(fs.readFileSync(require.resolve("jquery/dist/jquery.js"), "utf8"));
        window.eval(fs.readFileSync(path.join(ROOT, "lib", "handlebars", "handlebars.js"), "utf8"));

        // a tiny synchronous AMD loader
        const modules = {
            "jquery": window.jQuery,
            "handlebars": window.Handlebars,
            "jquery-tmpl": {},
            "gitana": undefined,
            "alpaca": undefined
        };
        let pending = null;
        window.define = (deps, factory) => { pending = { deps, factory }; };
        window.define.amd = {};

        // same order Cloud CMS resolves them in
        const order = ["ratchet", "ratchet-config", "ratchet-messages", "ratchet-actions", "ratchet-web", "ratchet-handlebars", "ratchet-tmpl", "ratchet-gitana"];
        for (const name of order)
        {
            const { file, deps } = bundles[name].component;
            pending = null;
            window.eval(read("ratchet", file));

            expect(pending, `${file} calls define()`).not.toBeNull();
            expect(pending.deps).toEqual(deps);
            for (const dep of pending.deps) {
                expect(dep in modules, `${file} depends on ${dep}, which is loaded first`).toBe(true);
            }
            // like RequireJS, call the factory with no `this` (the sources rely on it being the global)
            modules[`ratchet/${file.replace(/\.js$/, "")}`] = pending.factory.apply(undefined, pending.deps.map((d) => modules[d]));
        }

        const Ratchet = modules["ratchet/ratchet"];
        expect(typeof Ratchet).toBe("function");
        expect(modules["ratchet/web"]).toBe(Ratchet);
        expect(modules["ratchet/config"]).toBe(Ratchet.Configuration);
        expect(modules["ratchet/messages"]).toBe(Ratchet.Messages);
        expect(modules["ratchet/actions"]).toBe(Ratchet.Actions);
        expect(typeof Ratchet.DynamicRegistry).toBe("object");
        expect(typeof Ratchet.AbstractDynamicGadget).toBe("function");
        expect(Ratchet.TemplateEngineRegistry.find("handlebars")).toBeTruthy();
        expect(window.jQuery.fn.ratchet).toBeTypeOf("function");

        window.close();
    });

    it("falls back to browser globals when there is no AMD loader", () => {
        const env = createRatchet({ bundles: [] });
        env.window.eval(read("ratchet", "ratchet.js"));
        env.window.eval(read("ratchet", "config.js"));

        expect(typeof env.window.Ratchet).toBe("function");
        expect(typeof env.window.Ratchet.Configuration.evaluate).toBe("function");
        env.close();
    });
});
