# Vendored Three.js r160

Third-party code, copied in verbatim. Do not hand-edit anything in this directory.

## Why it is here

The three embeds in `public/3d/` used to resolve `three` and `three/addons/` to
`https://esm.sh/three@0.160.0` through an import map. That meant third-party JavaScript
executing on our own origin, inside a frame that ships on three commercial product pages,
with two problems that could not be fixed in place:

1. No integrity pinning. An import map has no `integrity` attribute, so there was no SRI
   and no byte-level guarantee about what esm.sh returned on any given request.
2. An availability dependency. If esm.sh was slow or down, the viewer rendered as a black
   box on a page we are trying to sell from.

Vendoring removes both at the root rather than containing them. There is now no
third-party host in the viewer's critical path.

## Provenance

| item | value |
| --- | --- |
| package | `three` |
| version | `0.160.0` (r160), pinned |
| source | `npm pack three@0.160.0` from the public npm registry |
| tarball | `three-0.160.0.tgz` |
| npm-reported shasum | `cd1e4dbd01aee0719280a9086d75545db52b7a8f` |
| license | MIT, copied to `LICENSE` in this directory |

Files taken from the tarball, unmodified:

| here | in the tarball |
| --- | --- |
| `three.module.min.js` | `build/three.module.min.js` |
| `addons/controls/OrbitControls.js` | `examples/jsm/controls/OrbitControls.js` |

`OrbitControls.js` imports from the bare specifier `'three'`. That still resolves, because
the import map in each `embed-*.html` maps `three` to `./vendor/three.module.min.js`. The
addon was NOT rewritten to a relative path, so it stays byte-identical to upstream and can
be re-verified against the tarball at any time.

## Why the minified build

`build/three.module.min.js` is used rather than `build/three.module.js`. Both are the same
ES module; the minified one is what a CDN would have served anyway.

| build | raw | gzip |
| --- | --- | --- |
| `three.module.js` | 1,272,972 B | 256,394 B |
| `three.module.min.js` | 670,681 B | 166,250 B |

Roughly 88 KB of transfer on a page that already carries a photo-heavy hero. If you ever
need to debug inside Three.js itself, swap in `three.module.js` from the same tarball
locally, but do not ship it.

## Updating

The version is pinned deliberately. `embed-core.js` and `containerModel.js` were written
against r160 and carry local fixes tuned to its API. To change versions:

1. `npm pack three@<version>` and extract.
2. Replace both files above from the new tarball, and update this README.
3. Re-test all three embeds end to end: model renders, Explode animates, Open Doors
   animates, camera reset works, console is clean.
4. Confirm the import map in all three `embed-*.html` still points only at `./vendor/`
   paths. A third-party host in that map is the exact thing this directory exists to
   prevent.
