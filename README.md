## Ratchet JS ##
The handy framework for building JavaScript MVC applications.

Git: http://github.com/gitana/ratchet

This framework is used by [Cloud CMS](https://gitana.io) (https://gitana.io) to deliver its user interface.
It supports an AMD module pattern that allows customers to extend our user interface without any server-side or database-level changes.

For more information, please visit [Cloud CMS](https://gitana.io)

## Development ##

Requires Node.js 20+.

    npm install
    npm run build        # build into dist/
    npm test             # build, then run the test suite
    npm run watch        # rebuild on changes to src/
    npm run serve        # serve the project (examples etc.) at http://localhost:8000/
    npm run bump         # bump the patch version in package.json (e.g. 1.0.3 -> 1.0.4)

The build concatenates the sources listed in `scripts/bundles.mjs` and produces:

| Output | Description |
| --- | --- |
| `dist/js/<bundle>.js` | plain browser scripts (`ratchet`, `ratchet-config`, `ratchet-web`, ...) |
| `dist/js/<bundle>.min.js` | minified, with source maps back to the original files |
| `dist/ratchet/` | AMD/UMD modules (`ratchet/ratchet`, `ratchet/web`, `ratchet/dynamic/...`) as consumed by Cloud CMS |

The version comes from `package.json`. To add a source file, add it to the relevant bundle in `scripts/bundles.mjs`.

Tests live in `tests/` and run with [Vitest](https://vitest.dev). Each test boots a fresh [jsdom](https://github.com/jsdom/jsdom)
window with jQuery and the built bundles loaded as browser globals (see `tests/harness.js`), and the core suites
run against both the plain and minified bundles.

## Swap strategies ##

When a gadget calls `swap()`, its rendered nodes are put into the page using one of these strategies:

| Strategy | Behavior |
| --- | --- |
| `insert` (default) | empties the gadget's element and appends the rendered nodes |
| `replace` | replaces the gadget's element with the rendered nodes (used for region gadgets) |
| `morph` | morphs the existing nodes into the rendered ones with [morphdom](https://github.com/patrick-steele-idem/morphdom), keeping anything that hasn't changed |

`morph` avoids rebuilding the whole gadget, so it's faster and preserves scroll position and focus. It's opt-in,
per gadget (`gadget-strategy="morph"`) or globally (`Ratchet.defaultGadgetStrategy = "morph"`), because nodes that
survive a morph keep their event handlers: gadgets must bind handlers idempotently (e.g. `off()` before `on()`)
or use delegated events, and anything attached to the rendered nodes before `swap()` is lost where an existing
node is kept in their place.
