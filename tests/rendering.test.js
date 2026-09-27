/**
 * Rendering performance changes: compiled template caching, node cloning for no-match dispatches,
 * the single-pass region/gadget walk and the "morph" swap strategy.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { createRatchet, until } from "./harness.js";

let env;
afterEach(() => env && env.close());

/**
 * Mounts a ratchet on #app with the given setup function, runs "/" and waits for the dispatch to finish.
 */
async function mount(setup, body = '<div id="app"></div>')
{
    env = createRatchet({ body, handlebars: true });
    const { $ } = env;
    const ratchet = $("#app").ratchet(setup);
    await run(ratchet);
    return ratchet;
}

async function run(ratchet, start = () => ratchet.run("/"))
{
    const { $ } = env;
    let completed = false;
    const listener = (e, r, isCompleted) => {
        if (isCompleted) {
            completed = true;
        }
    };
    $("body").on("afterDispatch", listener);
    start();
    await until(() => completed, { message: "dispatch" });
    $("body").off("afterDispatch", listener);
}

/**
 * Re-dispatches the current route (run() with an unchanged uri is a no-op).
 */
const refresh = (ratchet) => run(ratchet, () => ratchet.refresh());

/**
 * The previous jQuery-based closestDescendants(), used as the reference for the single-pass walk.
 */
function legacyClosestDescendants($, root, selector)
{
    const descendants = [];
    const drill = (node) => {
        if (node.is(selector)) {
            descendants.push(node[0]);
            return;
        }
        const children = node.children();
        for (let i = 0; i < children.length; i++) {
            drill($(children[i]));
        }
    };
    drill($(root));
    return descendants;
}

describe("template cache", () => {

    const render = (engine, el, html, model) => new Promise((resolve, reject) => {
        engine.render(el, "html", html, null, model, () => resolve(env.$(el).html()), (el, err) => reject(err));
    });

    it("compiles each template once and renders it with different models", async () => {
        env = createRatchet({ handlebars: true, body: '<div id="out"></div>' });
        const { Ratchet, window } = env;
        const engine = Ratchet.TemplateEngineRegistry.find("handlebars");
        const precompile = vi.spyOn(window.Handlebars, "precompile");
        const el = env.$("#out");

        expect(await render(engine, el, "<p>Hello {{name}}</p>", { name: "Joe" })).toBe("<p>Hello Joe</p>");
        expect(await render(engine, el, "<p>Hello {{name}}</p>", { name: "Ann" })).toBe("<p>Hello Ann</p>");
        expect(precompile).toHaveBeenCalledTimes(1);

        expect(await render(engine, el, "<p>Bye {{name}}</p>", { name: "Ann" })).toBe("<p>Bye Ann</p>");
        expect(precompile).toHaveBeenCalledTimes(2);

        engine.clearCache();
        await render(engine, el, "<p>Hello {{name}}</p>", { name: "Joe" });
        expect(precompile).toHaveBeenCalledTimes(3);
    });

    it("picks up helpers registered after a template was compiled", async () => {
        env = createRatchet({ handlebars: true, body: '<div id="out"></div>' });
        const { Ratchet, window } = env;
        const engine = Ratchet.TemplateEngineRegistry.find("handlebars");
        const el = env.$("#out");

        window.Handlebars.registerHelper("shout", (s) => s.toUpperCase());
        expect(await render(engine, el, "<b>{{shout name}}</b>", { name: "hi" })).toBe("<b>HI</b>");

        window.Handlebars.registerHelper("shout", (s) => s + "!");
        expect(await render(engine, el, "<b>{{shout name}}</b>", { name: "hi" })).toBe("<b>hi!</b>");
    });

    it("reports compile errors through the failure callback instead of throwing", async () => {
        env = createRatchet({ handlebars: true, body: '<div id="out"></div>' });
        const engine = env.Ratchet.TemplateEngineRegistry.find("handlebars");

        await expect(render(engine, env.$("#out"), "<p>{{#if}}</p>", {})).rejects.toBeTruthy();
    });
});

describe("no-match dispatch", () => {

    it("keeps the current dom (by cloning it) and still dispatches sub-gadgets", async () => {
        const body = '<div id="app"><p class="keep">existing <b>content</b></p><input id="field" value="a"><div gadget="child"></div></div>';
        env = createRatchet({ handlebars: true, body });
        const { $, Ratchet, window } = env;

        Ratchet.GadgetRegistry.register("child", Ratchet.Gadget.extend({
            constructor: function(type, ratchet, id) {
                this.base(type, ratchet, id);
            },
            setup: function() {
                this.get("/", function(el) {
                    el.html("<span class='child'>child</span>").swap();
                });
            }
        }));

        // the user has typed into the field (a property change, not reflected in the markup)
        window.document.getElementById("field").value = "typed";
        const html = vi.spyOn($.fn, "html");

        const ratchet = $("#app").ratchet();
        await run(ratchet);
        await until(() => $("#app .child").length === 1, { message: "child gadget" });

        expect($("#app p.keep").html()).toBe("existing <b>content</b>");
        expect(window.document.getElementById("field").value).toBe("typed");

        // nothing serialized the old dom to a string to copy it
        const serializedApp = html.mock.contexts.some((ctx, i) => html.mock.calls[i].length === 0 && ctx[0] && ctx[0].id === "app");
        expect(serializedApp).toBe(false);
    });
});

describe("region and gadget lookup", () => {

    const TREE = `
        <div id="root">
            <gadget type="a" id="t1"><gadget type="nested" id="t1n"></gadget></gadget>
            <div gadget="b" id="d1"><gadget type="c" id="t2"></gadget><div gadget="x" id="d1x"></div></div>
            <section><div><gadget type="d" id="t3"></gadget></div><div gadget="e" id="d2"></div></section>
            <gadget type="f" gadget="f" id="t4"></gadget>
            <p>text <span>and more</span></p>
        </div>`;

    it("finds the same tags and markers as the previous two jQuery walks", () => {
        env = createRatchet({ body: TREE });
        const { $, Ratchet, document } = env;
        const root = document.getElementById("root");
        const ids = (els) => els.map((el) => el.id);

        const found = Ratchet.findMarkers(root, "gadget", "gadget");

        expect(ids(found.tags)).toEqual(ids(legacyClosestDescendants($, root, "gadget")));
        expect(ids(found.all)).toEqual(ids(legacyClosestDescendants($, root, "gadget, [gadget]")));
        expect(ids(found.tags)).toEqual(["t1", "t2", "t3", "t4"]);
        expect(ids(found.all)).toEqual(["t1", "d1", "t3", "d2", "t4"]);
    });

    it("closestDescendants returns the same elements as before, natively", () => {
        env = createRatchet({ body: TREE + "<h1 id='h'>title</h1>" });
        const { $, document } = env;
        const root = document.getElementById("root");

        for (const selector of ["[gadget]", "gadget", "div", "span", "#t3"]) {
            expect($(root).closestDescendants(selector).toArray()).toEqual(legacyClosestDescendants($, root, selector));
        }

        // jQuery-only selectors still work
        expect($(document.body).closestDescendants(":header").toArray()).toEqual([document.getElementById("h")]);
    });

    it("resolves regions, including ids that aren't valid in a selector", async () => {
        env = createRatchet({ body: '<div id="app"></div>', handlebars: true });
        const { $, Ratchet } = env;

        Ratchet.regionMappings = { "main.content": "content", "side": "content" };
        Ratchet.GadgetRegistry.register("content", Ratchet.Gadget.extend({
            constructor: function(type, ratchet, id) {
                this.base(type, ratchet, id);
            },
            setup: function() {
                this.get("/", function(el) {
                    el.html("<i>resolved</i>").swap();
                });
            }
        }));

        const ratchet = $("#app").ratchet(function() {
            this.get("/", function(el) {
                el.html('<region id="main.content" class="big"></region><div region="side"></div><div region="unmapped">left alone</div>').swap();
            });
        });
        await run(ratchet);
        await until(() => $("#app i").length === 2, { message: "regions to render" });

        // region gadgets use the "replace" strategy, so the rendered <i> takes the region's place and attributes
        const main = $("#app [data-region='main.content']");
        expect(main.prop("tagName")).toBe("I");
        expect(main.hasClass("big")).toBe(true);
        expect($("#app [data-region='side']").text()).toBe("resolved");
        expect($("#app [region='unmapped']").text()).toBe("left alone");
    });
});

describe("morph strategy", () => {

    const listGadget = (Ratchet) => {
        Ratchet.GadgetRegistry.register("child", Ratchet.Gadget.extend({
            constructor: function(type, ratchet, id) {
                this.base(type, ratchet, id);
            },
            setup: function() {
                this.get("/", function(el) {
                    Ratchet.___childRenders = (Ratchet.___childRenders || 0) + 1;
                    el.html("<em>child render " + Ratchet.___childRenders + "</em>").swap();
                });
            }
        }));
    };

    const setup = (state) => function() {
        this.get("/", function(el) {
            el.transform("<h2>{{title}}</h2><ul>{{#each items}}<li>{{this}}</li>{{/each}}</ul><div gadget='child' id='kid'></div>",
                { title: state.title, items: state.items }, function() {
                    el.swap();
                });
        });
    };

    it("keeps unchanged nodes and updates only what differs", async () => {
        const state = { title: "Fruit", items: ["apple", "banana"] };
        env = null;
        const ratchet = await mount(function() {
            env.Ratchet.defaultGadgetStrategy = "morph";
            listGadget(env.Ratchet);
            setup(state).call(this);
        });
        const { $ } = env;

        const h2 = $("#app h2")[0];
        const firstLi = $("#app li")[0];
        const destroyed = vi.fn();
        $("#app li").eq(1).on("destroyed", destroyed);

        state.title = "Fruits";
        state.items = ["apple"];
        await refresh(ratchet);

        expect($("#app h2")[0]).toBe(h2);
        expect(h2.textContent).toBe("Fruits");
        expect($("#app li")[0]).toBe(firstLi);
        expect($("#app li").length).toBe(1);

        // the removed <li> was cleaned up by jQuery, as html("") would have done
        expect(destroyed).toHaveBeenCalledTimes(1);
    });

    it("swaps in child gadgets as rendered rather than morphing them", async () => {
        env = null;
        const ratchet = await mount(function() {
            env.Ratchet.defaultGadgetStrategy = "morph";
            listGadget(env.Ratchet);
            setup({ title: "x", items: [] }).call(this);
        });
        const { $, document } = env;
        await until(() => $("#kid em").length === 1, { message: "child gadget" });

        const h2 = $("#app h2")[0];
        const kid = $("#kid")[0];
        await refresh(ratchet);
        await until(() => $("#kid em").text() === "child render 2", { message: "child re-render" });

        // the layout around the child morphs, the child's root is the freshly rendered node
        expect($("#app h2")[0]).toBe(h2);
        expect($("#kid")[0]).not.toBe(kid);
        expect($("#kid").length).toBe(1);

        const children = Object.values(ratchet.childRatchets);
        expect(children).toHaveLength(1);
        expect(document.contains($(children[0].el)[0])).toBe(true);
    });

    it("keeps widgets and handlers that child gadgets build in their swap callbacks", async () => {
        // like the documents tree: a child (and a region child, which uses "replace") renders synchronously
        // and binds handlers after swapping, which (without handler callbacks) happens off-screen, before
        // the page itself swaps
        env = null;
        let render = 0;
        const clicks = [];
        const ratchet = await mount(function() {
            const { Ratchet, $ } = env;
            Ratchet.defaultGadgetStrategy = "morph";
            Ratchet.regionMappings = { "side": "tree" };

            Ratchet.GadgetRegistry.register("tree", Ratchet.Gadget.extend({
                constructor: function(type, ratchet, id) {
                    this.base(type, ratchet, id);
                },
                setup: function() {
                    this.get("/", function(el) {
                        const n = render;
                        el.html("<div class='holder'><a class='node'>node</a></div>").swap(function(swapped) {
                            $(swapped).find(".node").on("click", () => clicks.push(n));
                        });
                    });
                }
            }));

            this.get("/", function(el) {
                render++;
                el.html("<h2>page " + render + "</h2><div gadget='tree' id='tree'></div><region id='side'></region>").swap();
            });
        });
        const { $ } = env;

        await until(() => $("#app .node").length === 2, { message: "trees" });
        $("#app .node").trigger("click");
        expect(clicks).toEqual([1, 1]);

        await refresh(ratchet);
        await until(() => $("#app h2").text() === "page 2", { message: "page re-render" });

        // the live trees are the ones built by the second render, and their handlers fire exactly once
        clicks.length = 0;
        expect($("#app .node").length).toBe(2);
        $("#app .node").trigger("click");
        expect(clicks).toEqual([2, 2]);
    });

    it("is opt-in: the default insert strategy still replaces the nodes", async () => {
        const state = { title: "Fruit", items: ["apple"] };
        env = null;
        const ratchet = await mount(function() {
            listGadget(env.Ratchet);
            setup(state).call(this);
        });
        const { $ } = env;

        const h2 = $("#app h2")[0];
        await refresh(ratchet);
        expect($("#app h2")[0]).not.toBe(h2);
        expect($("#app h2").text()).toBe("Fruit");
    });
});
