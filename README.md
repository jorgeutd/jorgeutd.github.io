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
- Browser labs cover cache memory, scheduling, sampling, evaluation, synthetic traces, and a generic retrieval architecture.
- Professional work is described at a high level. Employer applications, internal project demos, and employer-derived diagrams are excluded.
- Model dates refer to public repository commit history. The portfolio copyright remains **© 2021–2026 Jorge Grisman**.

The existing `/inference/`, `/deep-dives/`, `/systems/`, and `/evals/` pages remain available.

## Deployment

The workflow validates changes on branches using Chromium at desktop and mobile sizes. Screenshots and failure traces are retained as a short-lived Actions artifact. On `main`, deployment runs only after validation passes.

`scripts/build-site.cjs` copies an explicit set of public files into `_site`. Git metadata, dependencies, tests, screenshots, and development files are not included in the Pages artifact. No model inference services or keys are required by the browser labs.
