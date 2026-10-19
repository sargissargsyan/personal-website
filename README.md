# Sargis Sargsyan — Personal Website

A fast, **fully static, read-only** personal site: plain HTML, CSS and a little vanilla
JavaScript, with **self-hosted fonts and images**. No backend, no database, no build step,
no third-party requests, no trackers.

## Viewing it

Double-click `index.html`. It works straight from disk, with no server needed.
(If you'd rather preview over http, `python3 -m http.server 8080` in this folder works too.)

## Structure

```
personal-website/
├── index.html            # All content (single page)
├── assets/
│   ├── css/style.css     # Design tokens at the top (light + dark), then components
│   ├── js/theme.js       # Loaded in <head>: applies saved/system theme before paint
│   ├── js/main.js        # Progressive enhancement: nav, theme toggle, test-run animation,
│   │                     #   talk filters (format, by-topic view), copy-bio buttons
│   ├── fonts/            # Bricolage Grotesque (headings), IBM Plex Sans + Mono — all OFL
│   └── img/              # Portrait, original banners, favicon
│       └── cards/        # Talk banners fitted to the 4:3 card frame (what the page shows)
├── _headers              # Security headers for Netlify / Cloudflare Pages
├── robots.txt
├── sitemap.xml
└── .nojekyll             # For GitHub Pages
```

Everything works with JavaScript off: all talks show as a list followed by the
"talks by topic" catalogue, and the hero shows the finished test run.

## Editing content

**Add a talk.** In `index.html`, find `<div class="talks-grid">` and copy an existing
`<article class="talk" …>` to the right place (newest first). Set:

- `data-type` to `talk` or `workshop` (the Talks / Workshops filter uses it) and `data-year`
  to the year;
- the image: save a 4:3 version (for example 1000×750 JPEG, the banner scaled to fit with its background extended, not stretched) in `assets/img/cards/` and point the
  card's `<img src>` at it, so it fills the card frame. For events without a banner, swap the
  `<a class="talk-media">` block for the `talk-media is-tile` version, which just prints the event name;
- event name, talk title, city and the event link.

Then update the counts that are written in text: the hero test run, the stats in the
Talks heading, the `og:description`, the short bio, and the matching entry in the
"Talks by topic" list (`<ol class="catalog">`).

**Colours, type, spacing** are CSS variables at the top of `assets/css/style.css`.
`--pass` (green) is the accent for "active / good"; `--apricot` marks workshops and the
"Now" stamp. Dark-mode values are defined twice: once for the system setting and once
for the manual toggle. Keep them in sync.

## Why this is safe

- **No server-side code**, so there's no CMS, plugins or PHP to exploit.
- **Same-origin JavaScript only**, and no inline scripts or `style=""` attributes, so the strict
  Content-Security-Policy in `_headers` (`script-src 'self'; style-src 'self'`) holds.
  The JSON-LD block is inert data.
- **No forms.** Contact is a plain `mailto:` link.
- **No third-party requests.** Fonts and images are self-hosted, and the page works offline.
- Theme choice is the only thing stored, in the visitor's own `localStorage`.

## Deploy (all static, free, HTTPS + CDN)

- **Cloudflare Pages** or **Netlify**: drag-and-drop the folder or connect the repo. Both honour `_headers`.
- **GitHub Pages**: push and enable Pages (`.nojekyll` included). It ignores `_headers`,
  so put Cloudflare in front if you want the security headers.

## Fonts

Bricolage Grotesque (variable, latin, optical-size axis), IBM Plex Sans 400/500/600
(+ latin-ext 400) and IBM Plex Mono 400/500, all SIL Open Font License, from the
`@fontsource` distribution.
