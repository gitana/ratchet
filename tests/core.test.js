/**
 * Observables, events, actions and messages - ported from the QUnit suites in tests/js - plus
 * a smoke test that mounts a ratchet and renders routes and gadgets.
 */
import { describe, it, expect, afterEach } from "vitest";
import { createRatchet, until } from "./harness.js";

describe.each([
    ["dist/js", false],
    ["dist/js (minified)", true]
])("Ratchet core - %s", (_, min) => {
    let env;

    afterEach(() => env && env.close());

    it("stores scoped observables and notifies subscribers (observables1)", () => {
        env = createRatchet({ min });
        const { observable, subscribe, unsubscribe } = env.Ratchet;

        observable("v1").set("redsox");
        observable("v2").set("brewers");
        expect(observable("v1").get()).toBe("redsox");
        expect(observable("v2").get()).toBe("brewers");

        // alternative scope
        observable("test", "v1").set("indians");
        expect(observable("test", "v1").get()).toBe("indians");
        expect(observable("v1").get()).toBe("redsox");

        const calls = [];
        const listener = (newValue, oldValue) => calls.push([newValue, oldValue]);
        subscribe("v2", listener);
        observable("v2").set("BREWERS");
        expect(calls).toEqual([["BREWERS", "brewers"]]);

        unsubscribe("v2", listener);
        observable("v2").set("brewers");
        expect(calls).toHaveLength(1);
    });

    it("triggers global and scoped events (events1)", () => {
        env = createRatchet({ min });
        const { Events } = env.Ratchet;

        // global scope
        let a1 = 0;
        Events.on("t1", (params) => { a1 += params.amount; });
        Events.trigger("t1", { amount: 1 });
        Events.trigger("t1", { amount: 1 });
        Events.trigger("t1", { amount: 1 });
        expect(a1).toBe(3);

        // multiple handlers on one event
        let a2 = 0;
        Events.on("t2", (params) => { a2 += params.amount; });
        Events.on("t2", (params) => { a2 -= params.amount; });
        Events.trigger("t2", { amount: 100 });
        expect(a2).toBe(0);

        // scopes operate independently
        let a31 = 0;
        let a32 = 0;
        Events.on("s31", "t3", (params) => { a31 += params.amount; });
        Events.on("s32", "t3", (params) => { a32 += params.amount; });
        Events.trigger("t3", { amount: 1000 }); // no impact
        Events.trigger("s31", "t3", { amount: 100 });
        Events.trigger("s32", "t3", { amount: 10 });
        expect(a31).toBe(100);
        expect(a32).toBe(10);

        // unsubscribe
        let a4 = 0;
        const f4 = (params) => { a4 += params.amount; };
        Events.on("t4", f4);
        Events.trigger("t4", { amount: 1 });
        Events.off("t4", f4);
        Events.trigger("t4", { amount: 1 });
        expect(a4).toBe(1);
    });

    it("executes registered actions (actions1)", () => {
        env = createRatchet({
            min,
            bundles: ["ratchet", "ratchet-config", "ratchet-actions"],
            scripts: ["js/actions/TestAction.js"]
        });
        const { Ratchet } = env;

        let result;
        Ratchet.Actions.execute("test", null, { "booya": "shakka" }, (err, data) => {
            result = { err, data };
        });

        expect(Ratchet.___test.booya).toBe("shakka");
        expect(result.err.message).toBe("hello");
        expect(result.data.success).toBe(true);
    });

    it("resolves locale messages with fallback and formats dates (messages1)", () => {
        env = createRatchet({ min, bundles: ["ratchet", "ratchet-config", "ratchet-messages"] });
        const { Ratchet, window } = env;
        const messages = Ratchet.Messages;

        // (the QUnit suite predates "ago" becoming its own message)
        let bundle = messages.using(messages.DEFAULT_LOCALE);
        expect(bundle.message("date-format.default")).toBe("ddd mmm dd yyyy HH:MM:ss");
        expect(bundle.message("relative.minutes")).toBe("{0} minutes");
        expect(bundle.message("relative.minutes", [42])).toBe("42 minutes");
        expect(bundle.message("relative.ago")).toBe("ago");

        // unknown locale falls back to the default
        expect(messages.using("ES_es").message("relative.minutes")).toBe("{0} minutes");

        // country-specific locale
        Ratchet.Configuration.add({
            "evaluator": "locale",
            "condition": "es_ES",
            "config": { "messages": { "relative": { "minutes": "{0} minutos atras" } } }
        });
        bundle = messages.using("es_ES");
        expect(bundle.message("date-format.default")).toBeUndefined();
        expect(bundle.message("relative.minutes")).toBe("{0} minutos atras");

        // language fallback
        Ratchet.Configuration.add({
            "evaluator": "locale",
            "condition": "de",
            "config": { "messages": { "relative": { "minutes": "vor {0} Minuten" } } }
        });
        expect(messages.using("de_DE").message("relative.minutes")).toBe("vor {0} Minuten");

        // date formatting (Date.parse is extended by thirdparty/date.js)
        const date = window.Date.parse("July 8th, 2007, 10:30 PM");
        bundle = messages.using(messages.DEFAULT_LOCALE);
        expect(bundle.dateFormat(date, "shortTime")).toBe("10:30 PM");
        expect(bundle.dateFormat(date, "shortDate")).toBe("7/8/07");

        Ratchet.Configuration.add({
            "evaluator": "locale",
            "condition": "en_UK",
            "config": { "messages": { "date-format": { "shortTime": "h:MM tt", "shortDate": "d/m/yy" } } }
        });
        bundle = messages.using("en_UK");
        expect(bundle.dateFormat(date, "shortTime")).toBe("10:30 pm");
        expect(bundle.dateFormat(date, "shortDate")).toBe("8/7/07");

        // relative times
        bundle = messages.using(messages.DEFAULT_LOCALE);
        expect(bundle.relativeTime(new window.Date().add(-3).minutes())).toBe("3 minutes ago");
        expect(bundle.relativeDate(new window.Date().add(-1).days())).toBe("yesterday");
    });

    it("mounts on an element via $.fn.ratchet and renders a route", async () => {
        env = createRatchet({ min, body: '<div id="sample"></div>' });
        const { $ } = env;

        let swapped = false;
        $("#sample").ratchet(function() {
            this.get("/", function(el) {
                el.html("Here is some <span>text</span>");
                el.swap(function() {
                    swapped = true;
                });
            });
        }).run("/");

        await until(() => swapped, { message: "route to render" });
        expect($("#sample").text()).toBe("Here is some text");
        expect($("#sample").hasClass("ratchet-completed")).toBe(true);
    });

    it("renders a registered gadget into a gadget region", async () => {
        env = createRatchet({ min, body: '<div id="sample" gadget="application"></div>' });
        const { $, Ratchet, window } = env;

        // as in examples/example1 - Base.js subclasses need an explicit constructor to run the parent's
        Ratchet.GadgetRegistry.register("application", Ratchet.Gadget.extend({
            constructor: function(type, ratchet, id) {
                this.base(type, ratchet, id);
            },
            setup: function() {
                this.get("/", function(el) {
                    el.html("Welcome to the title page").swap();
                });
            }
        }));

        const ratchet = $("#sample").ratchet();
        ratchet.run("/");

        await until(() => $("#sample").text() === "Welcome to the title page", { message: "gadget to render" });
        expect($("#sample").attr("ratchet")).toBeTruthy();
        expect($("#sample").ratchet()).toBe(ratchet);
        expect(window.$.ratchet).toBe(Ratchet);
    });
});
