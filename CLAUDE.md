# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The static marketing website for Fixing Up Consulting (fixingupconsulting.com), a consulting firm in Tacna, Perú. Plain HTML/CSS/JS — no framework, no build tool, no package manager. There is a second, unrelated system, **Open Monograph Press (OMP)**, running at `fixingupconsulting.com/omp` on the same hosting account; it is a separate PHP application deployed directly on the server and is **not** part of this repository. See `docs/omp-upgrade-2026-08-11.md` if you need context on it.

## Commands

There is no build, lint, or test step. To preview locally:

```bash
python -m http.server 3100
# http://localhost:3100
```

Any HTML file can also just be opened directly in a browser.

## Deployment

Every push to `main` deploys automatically via GitHub Actions (`.github/workflows/deploy.yml`) over plain FTP to `public_html/` on the cPanel host. It does not delete remote files that were removed from the repo. Full details, including why FTP instead of SFTP/FTPS, are in `docs/DEPLOYMENT.md` — read it before touching the workflow or its secrets.

`.cpanel.yml` (a cPanel Git Version Control deploy hook) also exists in the repo but is not the active deployment path — GitHub Actions is.

## Architecture

**Pages are independent static HTML files with no templating** — `index.html`, `servicios.html`, `nosotros.html`, `publicaciones.html`, `revista.html`, `contacto.html`. There is no shared header/footer include mechanism, so the navbar and footer markup is duplicated in every file; changing nav/footer means editing all six.

**CSS is split by scope, and pages opt into what they need:**
- `css/styles.css` — the base design system (CSS custom properties for color/spacing/radius/shadows/transitions in `:root`, plus homepage-specific styles). Loaded on every page.
- `css/inner-pages.css` — shared styles for interior pages. Loaded by `servicios.html`, `nosotros.html`, `revista.html`, `contacto.html`.
- `css/publicaciones.css` — styles specific to the publications catalog. Loaded only by `publicaciones.html`, instead of `inner-pages.css`.

Note: the CSS custom property *names* in `:root` (`--c-navy`, `--c-cyan`, `--c-blue`, etc.) are legacy from an earlier navy/cyan dark theme and no longer match their current values, which are the forest-green/gold palette now in use. Go by the variable's actual color value, not its name.

**JS follows the same opt-in split:**
- `js/main.js` — shared behavior on every page: navbar scroll state, mobile menu toggle, a hand-rolled scroll-reveal system driven by `[data-aos]`/`[data-aos-delay]` attributes and `IntersectionObserver` (not the AOS library), and animated stat counters (`[data-target]`).
- `js/publicaciones.js` — catalog filtering and form logic for `publicaciones.html` only.

All JS is wrapped in a single `DOMContentLoaded` listener per file; there are no modules or bundling.

## Working conventions

- Content is in Spanish; keep new copy consistent with that.
- Assets (images) live under `assets/img/`.
- `docs/` holds internal/operational documentation (deploy setup, upgrade logs) and is explicitly excluded from the FTP deploy — anything added there stays off the live site by design. Follow that pattern for future internal notes rather than adding them to the deployed page files.
