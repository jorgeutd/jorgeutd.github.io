# Jorge Grisman — portfolio

A static portfolio with public-project links, research labs, engineering articles, and a model collection. The site is served by GitHub Pages.

## Local development

Use Node.js 22 or newer.

```sh
npm ci
npx playwright install chromium
npm run build
npm run serve
```

Open `http://127.0.0.1:4173`. Run the desktop and mobile browser checks with `npm test`.

## Public content

- The homepage has sections for selected work, research, notes, general interactive labs, open models, and experience.
- Six articles also have standalone `/notes/<topic>/` URLs with readable initial HTML and individual metadata.
- Browser labs cover cache memory, scheduling, sampling, evaluation, synthetic traces, and an interactive system-design atlas.
- The atlas contains four original reference architectures: a FastAPI application, inference serving, on-device inference, and a quantization pipeline. Each has component inspection, execution playback, failure scenarios, trace links, flow filters, zoom, and an SVG download. Device and quantization studies include separate weight and KV payload calculations.
- Professional work is described at a high level. Employer applications, internal project demos, and employer-derived diagrams are excluded.
- Model dates refer to public repository commit history. The portfolio copyright remains **© 2021–2026 Jorge Grisman**.

The existing `/inference/`, `/deep-dives/`, `/systems/`, and `/evals/` pages remain available.

## Deployment

The workflow validates changes on branches using Chromium at desktop and mobile sizes. Screenshots and failure traces are retained as a short-lived Actions artifact. On `main`, deployment runs only after validation passes. A separate post-deployment job verifies the delivered assets, then runs the browser suite against the public URL. Production assets have content-based query versions to prevent stale scripts from being mixed with a new page.

`scripts/build-site.cjs` copies an explicit set of public files into `_site`. Git metadata, dependencies, tests, screenshots, and development files are not included in the Pages artifact. No model inference services or keys are required by the browser labs.


### Social previews

Public pages include static Open Graph and Twitter metadata; messaging crawlers do not need JavaScript. Each preview is a 1200×630 PNG with a filename derived from its bytes, so a changed image gets a new URL. The current manifest is `assets/social/manifest.json`.

After changing page titles, descriptions or preview design, run `npm ci` then `npm run previews`, review the PNGs and commit the changed HTML, manifest and images. `npm test` checks raw crawler HTML, image dimensions, filenames and the pretrained page’s distinct thumbnail. The root `og-image.png` is a compatibility fallback and is updated as well.

Existing messages can retain a cached card. Publishing new metadata cannot rewrite cards already stored by another application. Share a full page path, such as `/labs/pretrained/`; URL fragments like `/#research` are not sent to the server and cannot select a distinct crawler preview.
