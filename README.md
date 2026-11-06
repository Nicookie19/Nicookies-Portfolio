# Nicookie.dev

Nico Mahipus's responsive portfolio. Built with plain HTML, CSS, and JavaScript; no build step or dependencies.

## Preview

Open `index.html` directly, or run `python3 -m http.server 8080` and visit `http://localhost:8080`.

## Content and interactions

- `index.html`: profile, toolkit, contact links, and a static project list that works without JavaScript.
- `styles.css`: responsive layouts, dark/light themes, and reduced-motion support.
- `script.js`: project search, category filters, sorting, pagination, saved theme, mobile navigation, and copy-email action.
- `assets/icons/`: locally bundled Devicon language/framework logos, v2.17.0. See the included MIT license. Brand marks belong to their respective owners. Source: https://github.com/devicons/devicon/tree/v2.17.0

The embedded repository snapshot was fetched from GitHub on November 5, 2026. The page refreshes public repositories through GitHub's API, following pagination. Original repositories are shown, excluding this portfolio. A blocked request, API rate limit, or timeout retains the snapshot. Newly published repositories appear automatically on a successful refresh; add editorial titles or descriptions in the embedded `repository-data` JSON if desired. Keep the static cards in sync when manually updating the snapshot.

Descriptions for BrainBox Mobile, Vibe Magazine, Forma (Project-1), and AstroLabs were checked against their public READMEs. Projects without descriptions use neutral source-code summaries.

To deploy on static hosting such as GitHub Pages, publish `index.html`, `styles.css`, `script.js`, and `assets/` together. No credentials are required. The avatar loads from GitHub; technology logos are local.

The decorative background uses slow CSS glow and dot animations in both themes. The navigation includes a pause/resume control with a saved preference. Motion stops in hidden tabs, respects system reduced-motion settings, and stays static without JavaScript.
