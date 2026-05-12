# Rewrite README.md and CONTRIBUTING.md for ThingsBoard Docs

**Date:** 2026-05-12
**Status:** Draft — awaiting user review

## Background

The current `README.md` is mostly verbatim Astro Docs content: Astro logo, "We are Astro" pitch, CodeSandbox/Codeflow buttons, Astro Discord links, Astro translation status SVG. A separate `README_TB.md` exists with a single ThingsBoard-specific note (the `generate_config_pages.py` invocation). The current `CONTRIBUTING.md` is the same story — Astro repo URLs, Astro-specific i18n process, references to `@withastro/maintainers-docs`.

Both files need to be rewritten so a contributor landing on this repo sees ThingsBoard content. The Astro framework is the runtime; it's a "built with" credit, not the project identity.

## Goals

- README that orients a contributor in under 30 seconds: what this repo is, where the live site lives, how to run it, where to read more.
- CONTRIBUTING that gives a human contributor the workflow to open a useful PR: setup, the four CI checks, the minimum content-authoring knowledge, and a playbook for the five common tasks.
- Fold the `README_TB.md` config-regeneration snippet into CONTRIBUTING and delete `README_TB.md`.

## Non-goals

- Translating the full content of `CLAUDE.md` into CONTRIBUTING. `CLAUDE.md` stays the source of truth for the deeper architectural reference; CONTRIBUTING points at it for depth.
- Establishing a Discord/community section. The user confirmed only live-docs and product-homepage links are in scope.
- Translation guide / translation status section. Out of scope per the user's link selection.
- Rewriting `CLAUDE.md` itself.

## Design

### File 1: `README.md` (~50 lines)

Bare-bones, contributor-oriented. Six sections:

1. **Title + pitch** (~3 lines)
   - `# ThingsBoard Docs`
   - One sentence: "Source for the documentation site at [thingsboard.io/docs](https://thingsboard.io/docs/), built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/)."

2. **Quickstart** (~10 lines)
   - Prereq: Node (version from `package.json`/`.nvmrc`), [pnpm](https://pnpm.io/).
   - Three commands in a fenced block:
     ```
     pnpm install
     pnpm dev          # localhost:4321
     pnpm build:fast   # production build, skips OG image generation
     ```

3. **Repo layout** (~8 lines)
   - Four-bullet list naming the entry points a contributor most often touches:
     - `src/content/docs/` — pages (Markdown/MDX, per-language directories)
     - `src/content/_includes/` — shared content reused by CE and PE variants
     - `astro.sidebar.ts` — navigation tree
     - `public/` — static assets and redirects
   - One trailing sentence: "See `CLAUDE.md` for the full content architecture reference."

4. **Contributing** (~3 lines)
   - One sentence + link to `CONTRIBUTING.md`.

5. **Links** (~4 lines)
   - Bullet list:
     - [thingsboard.io](https://thingsboard.io/) — product homepage
     - [thingsboard.io/docs](https://thingsboard.io/docs/) — live documentation site

6. **License** (~2 lines)
   - One sentence pointing at `LICENSE`.

Explicit cuts vs. the current README: Astro logo, CodeSandbox/Codeflow buttons, "We are Astro" / "You are Awesome" / "Chat with Us" / "Raise an Issue" / "Share an Idea" / "Translate a Page" / "Translation progress" SVG / Astro Discord links / Astro docs URL. All gone.

### File 2: `CONTRIBUTING.md` (~180 lines)

Human-flavored PR guide. Eight sections, setup-first then a playbook.

1. **Intro** (~5 lines)
   Thanks-for-contributing paragraph. One sentence on scope: docs content, site code, redirects, translations belong here; product features themselves (the ThingsBoard platform) belong in the [`thingsboard/thingsboard`](https://github.com/thingsboard/thingsboard) repo.

2. **Prerequisites** (~10 lines)
   - Node (specify exact version from the repo, do not invent it — read `package.json` `engines` field at write-time and use whatever is there; if absent, write "any recent LTS").
   - [pnpm](https://pnpm.io/installation) (link).
   - Optional: Python 3 (only needed for the config-page regeneration task in section 6).

3. **Local development** (~15 lines)
   - Fork on GitHub.
   - `git clone <your-fork>`
   - `pnpm install`
   - `pnpm dev` → visit `http://localhost:4321/docs/`
   - One paragraph noting that `pnpm dev` rebuilds incrementally and is the normal authoring loop. `pnpm build:fast` is the canonical pre-PR full build (skips OG image generation for speed; CI uses the full `pnpm build`).

4. **Before you open a PR** (~15 lines)
   Bullet list of the four checks that CI runs and that you should run locally:
   - `pnpm check` — TypeScript and Astro type checking.
   - `pnpm lint:eslint` — ESLint.
   - `pnpm lint:slugcheck` — verifies slugs match across languages.
   - `pnpm build:fast` — production build (catches broken imports, missing assets).
   One line: "All four must pass for the PR to be merged."
   Optional follow-up commands worth knowing: `pnpm lint:linkcheck` (full link validation, slow, runs a build), `pnpm format` (Prettier).

5. **Content authoring basics** (~30 lines)
   The 30-second orientation a human needs before editing content:
   - **Pages and their location** — `src/content/docs/{lang}/docs/...`. English is canonical at `en/`. Other languages mirror English; a missing translation falls back to English automatically.
   - **The CE/PE three-tier pattern** — for any page that has both Community Edition and Professional Edition variants, the actual content lives in a shared MDX file under `src/content/_includes/docs/{path}/{page}.mdx`. Two thin "stub" pages then import it: the CE stub at `src/content/docs/docs/{path}/{page}.mdx` passes `Products.CE`, and the PE stub at `src/content/docs/docs/pe/{path}/{page}.mdx` passes `Products.PE`. A two-line stub example.
   - **Internal links** — use the `<DocLink>` component, never bare Markdown links to other doc pages. Bare links break when language fallback kicks in or when product prefixes change.
   - **Version strings** — never hardcode ThingsBoard version numbers in Docker image tags, download URLs, or code samples. Import constants from `~/data/versions` (`CE_FULL_VER`, `PE_FULL_VER`, `TBMQ_VER`, etc.).
   - **Sidebar** — when you add a new page, register it in `astro.sidebar.ts`. The helpers `guideItems(prefix)` and `installationItems(prefix)` are shared between CE and PE so you only add the entry once.
   - One-line pointer: "For the full architecture (product system, redirects, OG cards, schemas), see `CLAUDE.md`."

6. **Common tasks** (~50 lines)
   Five short subsections (~10 lines each), each a numbered list of steps. Order: most common first.

   **Fix a typo or broken link**
   1. Edit the file.
   2. `pnpm lint:linkcheck:nobuild` (skip if pure typo).
   3. Commit and open a PR.

   **Add a new documentation page**
   1. Create the shared include at `src/content/_includes/docs/{path}/{page}.mdx`.
   2. Create the CE stub at `src/content/docs/docs/{path}/{page}.mdx` importing the include with `Products.CE`.
   3. Create the PE stub at `src/content/docs/docs/pe/{path}/{page}.mdx` importing the include with `Products.PE`.
   4. Register the slug in `astro.sidebar.ts` (typically in the matching `guideItems` / `installationItems` helper).
   5. Run `pnpm dev` and verify the page renders for both products.

   **Add a redirect**
   1. Edit `src/data/redirects.ts` — pick the export that matches the pattern (`SINGLE_REDIRECTS`, `CATCH_ALL_REDIRECTS`, `DYNAMIC_REDIRECTS`, or `NON_DOCS_REDIRECTS`).
   2. `pnpm generate:redirects` — regenerates `public/_redirects` and `public/redirects.json`.
   3. Commit both the data change and the regenerated output.
   4. Do not hand-edit `public/_redirects` or the generated stubs.

   **Regenerate configuration reference pages** (folded in from `README_TB.md`)
   When ThingsBoard's upstream `*.yml` config files change, regenerate the MDX reference pages with `generate_config_pages.py`. Clone the upstream ThingsBoard repo as a sibling of this one, then from the repo root:
   ```
   python3 generate_config_pages.py <repo_type> <relative_path_to_upstream>
   ```
   `<repo_type>` is one of `ce`, `pe`, `tbmq`, `tbmq-pe`, `edge`, `edge-pe`. Example for CE:
   ```
   python3 generate_config_pages.py ce ../thingsboard
   ```
   Commit the regenerated files under `src/content/docs/docs/.../reference/configuration/` (or `.../install/config.mdx` for TBMQ / Edge).

   **Translate a page**
   1. Find the English source at `src/content/docs/en/docs/...`.
   2. Create the same path under `src/content/docs/{lang}/docs/...`.
   3. Match the frontmatter and set `i18nReady: true` once the translation is ready for publication.
   4. Untranslated pages fall back to English automatically; do not stub-translate.

7. **Opening the PR** (~15 lines)
   - Branch naming is loose; descriptive is enough (e.g., `fix/mqtt-quickstart-typo`, `add/edge-installation-page`).
   - Commit messages: imperative mood, brief subject, body if motivation is non-obvious. No strict convention.
   - PR title should describe the change; the body should mention affected pages and any screenshots if there's a visual change.
   - Every PR generates a Cloudflare/Netlify preview link in the PR conversation — use it to verify your change.
   - The four CI checks (section 4) must pass before review.

8. **Where to ask for help** (~5 lines)
   - File an issue at the repo issue tracker for documentation bugs, broken links, or "this page is wrong" reports.
   - Browse the live docs at [thingsboard.io/docs](https://thingsboard.io/docs/) to see what shipped.
   - Note that PRs are reviewed by the ThingsBoard docs team on a best-effort basis.

Explicit cuts vs. the current CONTRIBUTING: Astro Docs Docs link, Astro Discord, `@withastro/maintainers-docs` pings, the entire "Helpful information about Forks" section (GitHub's own docs cover this), the GitHub-UI edit-this-page walkthrough (preserved implicitly via the "Edit this page" button on rendered pages but not described in CONTRIBUTING), the StackBlitz/CodeSandbox/Codeflow IDE section, the en-only PR title convention (Astro-specific automation), the egghead course link.

### File 3: `README_TB.md`

- `git rm README_TB.md` as part of the same commit. Its sole content (the `generate_config_pages.py` snippet) is preserved verbatim and expanded inside CONTRIBUTING.md section 6.
- Repo grep confirms no other file references `README_TB.md`, so nothing else needs to be updated.

## Open questions

None at spec-finalization time. The python script's actual CLI surface was verified against `generate_config_pages.py` (lines 297-385) — it accepts `ce`, `pe`, `tbmq`, `tbmq-pe`, `edge`, `edge-pe` as the first argument; `README_TB.md`'s snippet was incomplete but not wrong.

## Out of scope (deferred)

- Adding a CI-check badge to the README. Could add later but not required.
- Adding a "Code of Conduct" link. The repo does not currently have a CODE_OF_CONDUCT.md; out of scope for this rewrite.
- Translating CONTRIBUTING.md itself. English only for now.

## Verification

After implementation:

1. Both files render correctly on github.com/thingsboard/thingsboard.io (preview by pushing to a fork).
2. `grep -r "README_TB" .` returns no hits (excluding node_modules and dist).
3. `grep -r "withastro\|Astro Docs Docs\|cZDZU3hJHc" README.md CONTRIBUTING.md` returns no hits.
4. Every `pnpm` command mentioned in either file exists in `package.json`'s `scripts` section.
5. The `python3 generate_config_pages.py` example invocation runs end-to-end against a checked-out `thingsboard/thingsboard` repo (smoke test, not blocking).
