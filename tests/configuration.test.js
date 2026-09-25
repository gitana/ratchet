/**
 * Ported from the QUnit suites tests/js/config1.js - config6.js.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRatchet } from "./harness.js";

describe.each([
    ["dist/js", false],
    ["dist/js (minified)", true]
])("Ratchet.Configuration - %s", (_, min) => {
    let env;
    let Ratchet;
    let config;

    beforeEach(() => {
        env = createRatchet({ bundles: ["ratchet", "ratchet-config"], min });
        Ratchet = env.Ratchet;
        config = Ratchet.Configuration;
    });

    afterEach(() => env.close());

    it("deep merges global config, applies the type evaluator and honours replace (config1)", () => {
        config.add({
            "config": {
                "title": "Hello World",
                "body": { "message": "First Message" },
                "array": [1, 2, 3]
            }
        });
        let json = config.evaluate(null);
        expect(json.title).toBe("Hello World");
        expect(json.body.message).toBe("First Message");
        expect(json.array).toHaveLength(3);

        // deep merge
        config.add({
            "config": {
                "body": { "message": "Second Message" },
                "array": [4]
            }
        });
        json = config.evaluate(null);
        expect(json.title).toBe("Hello World");
        expect(json.body.message).toBe("Second Message");
        expect(json.array).toHaveLength(4);

        // "type" evaluator
        config.add({
            "evaluator": "type",
            "condition": "folder",
            "config": {
                "title": "Wintermute",
                "array": [5, 6]
            }
        });
        json = config.evaluate({ "type": "folder" });
        expect(json.title).toBe("Wintermute");
        expect(json.body.message).toBe("Second Message");
        expect(json.array).toHaveLength(6);

        json = config.evaluate(null);
        expect(json.title).toBe("Hello World");
        expect(json.array).toHaveLength(4);

        // "replace" for type "file"
        config.add({
            "evaluator": "type",
            "condition": "file",
            "replace": true,
            "config": { "array": [9] }
        });
        json = config.evaluate({ "type": "file" });
        expect(json.title).toBe("Hello World");
        expect(json.body.message).toBe("Second Message");
        expect(json.array).toHaveLength(1);
    });

    describe("gadget evaluator and listeners (config2)", () => {
        const gadget2 = {
            "evaluator": "gadget",
            "condition": { "gadget": "gadget2", "gadgetType": "gadgetType2" }
        };
        const addGadget2 = (buttonGroups) => config.add({ ...gadget2, "config": { buttonGroups } });

        beforeEach(() => {
            config.add({
                "config": {
                    "actions": {
                        "action1": { "title": "Action #1" },
                        "action2": { "title": "Action #2" },
                        "action3": { "title": "Action #3" }
                    }
                }
            });
            config.add({
                "evaluator": "gadget",
                "condition": { "gadget": "gadget1", "gadgetType": "gadgetType1" },
                "config": {
                    "buttonGroups": {
                        "bg1": { "actions": [{ "action": "action1" }, { "action": "action2" }] },
                        "bg2": { "actions": [{ "action": "action3" }] }
                    }
                }
            });
            addGadget2({ "bg1": { "actions": [{ "action": "action1" }] } });
        });

        it("generates binding keys with sorted, flattened properties", () => {
            const key = config.generateBindingKey("a", "b", {
                "name": "caribou",
                "properties": {
                    "p1": "v1",
                    "p3": [1, 2, 3],
                    "p4": { "p5": "v5", "p6": "v6" },
                    "p2": 3
                }
            });
            expect(key).toBe("a&b&name=caribou&properties.p1=v1&properties.p2=3&properties.p3.0=1&properties.p3.1=2&properties.p3.2=3&properties.p4.p5=v5&properties.p4.p6=v6");
        });

        it("evaluates global and gadget-scoped config", () => {
            const json1 = config.evaluate({ "gadget": "gadget1", "gadgetType": "gadgetType1" });
            expect(Object.keys(json1.actions)).toEqual(["action1", "action2", "action3"]);
            expect(json1.buttonGroups.bg1.actions).toHaveLength(2);
            expect(json1.buttonGroups.bg2.actions).toBeTruthy();

            const json2 = config.evaluate({ "gadget": "gadget2", "gadgetType": "gadgetType2" });
            expect(Object.keys(json2.actions)).toEqual(["action1", "action2", "action3"]);
            expect(json2.buttonGroups.bg1.actions).toHaveLength(1);
        });

        it("notifies listeners until they are removed", () => {
            let fired = 0;
            const listener = () => fired++;

            config.addListener(gadget2, listener);
            addGadget2({ "bg1": { "actions": [{ "action": "action2" }] } });
            expect(fired).toBe(1);
            addGadget2({ "bg1": { "actions": [{ "action": "action3" }] } });
            expect(fired).toBe(2);

            config.removeListener(gadget2, listener);
            addGadget2({ "bg2": { "actions": [{ "action": "action1" }] } });
            expect(fired).toBe(2);

            config.addListener(gadget2, listener);
            config.removeAllListeners(gadget2);
            addGadget2({ "bg2": { "actions": [{ "action": "action1" }] } });
            expect(fired).toBe(2);
        });
    });

    it("supports the 'and' logic evaluator (config3)", () => {
        config.add({
            "evaluator": "and",
            "condition": [
                { "evaluator": "page", "condition": "abc" },
                { "evaluator": "locale", "condition": "en" }
            ],
            "config": { "albumTitle": "Achtung Baby" }
        });

        expect(config.evaluate({ "page": "abc", "locale": "en" }).albumTitle).toBe("Achtung Baby");
        expect(config.evaluate({ "page": "abc", "locale": "es" }).albumTitle).toBeUndefined();
        expect(config.evaluate({ "page": "def", "locale": "es" }).albumTitle).toBeUndefined();
    });

    it("supports the 'or' logic evaluator (config4)", () => {
        config.add({
            "evaluator": "or",
            "condition": [
                { "evaluator": "page", "condition": "abc" },
                { "evaluator": "locale", "condition": "en" }
            ],
            "config": { "albumTitle": "Achtung Baby" }
        });

        expect(config.evaluate({ "page": "abc" }).albumTitle).toBe("Achtung Baby");
        expect(config.evaluate({ "locale": "en" }).albumTitle).toBe("Achtung Baby");
        expect(config.evaluate({ "page": "def", "locale": "es" }).albumTitle).toBeUndefined();
    });

    it("supports the 'not' logic evaluator", () => {
        config.add({
            "evaluator": "not",
            "condition": { "evaluator": "page", "condition": "abc" },
            "config": { "albumTitle": "Zooropa" }
        });

        expect(config.evaluate({ "page": "abc" }).albumTitle).toBeUndefined();
        expect(config.evaluate({ "page": "def" }).albumTitle).toBe("Zooropa");
    });

    it.each([
        ["page", (i) => ({ "evaluator": "page", "condition": "abc" + i })],
        ["and", (i) => ({
            "evaluator": "and",
            "condition": [
                { "evaluator": "page", "condition": "abc" + i },
                { "evaluator": "locale", "condition": "en" }
            ]
        })]
    ])("evaluates quickly against a large '%s' sample set (config5 / config6)", (_, block) => {
        for (let i = 0; i < 1000; i++) {
            config.add({ ...block(i), "config": { "albumTitle": "Hail to the Thief", "band": "radiohead", "reviewers": ["joe"] } });
        }

        const start = performance.now();
        const json = config.evaluate({ "page": "abc10", "locale": "en" });
        const elapsed = performance.now() - start;

        expect(json.band).toBe("radiohead");
        expect(elapsed).toBeLessThan(1000);
    });
});
