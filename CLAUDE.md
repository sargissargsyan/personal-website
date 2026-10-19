# CLAUDE.md

Guidance for Claude (and anyone else) working on this repository.

## What this is

The personal site of **Sargis Sargsyan**, Senior Test Architecture Manager at Align Technology
(Yerevan, Armenia), live at https://sargissargsyan.com. One static page: plain HTML, CSS and a
little vanilla JS, with no build step, no framework, no package manager and no backend.
`index.html` is the source of truth for all content.

## Non-negotiable rules

1. **Stay static and self-contained.** No CDNs, Google Fonts, analytics, trackers, embeds, iframes
   or third-party requests of any kind. Fonts and images are self-hosted in `assets/`.
2. **Respect the Content-Security-Policy** (`script-src 'self'; style-src 'self'`):
   - no inline `<script>` code (the only inline block is the inert JSON-LD data),
   - no inline `<style>` blocks and no `style="…"` attributes,
   - no `on*=""` handler attributes.
   Setting styles from JS via `el.style.x = …` / `setProperty` is fine (CSSOM is allowed).
3. **Must work when `index.html` is opened directly from disk (`file://`).** So: no `fetch()`,
   no `type="module"` scripts, no `<link rel="preload" … crossorigin>` for fonts (blocked on
   `file://`), relative asset paths only.
4. **Progressive enhancement.** Everything must read correctly with JavaScript off. JS only adds
   behaviour (the `.js` class is set on `<html>` by `theme.js`).
5. **Accessibility and motion.** Keep visible focus styles, real buttons for actions, and
   `prefers-reduced-motion` support. Layout must work at 390px wide with no horizontal scroll.
6. **No forms.** Contact is `mailto:` and profile links only.

## Files

```
index.html               All content (single page)
assets/css/style.css     Tokens at the top (light + dark), then components, responsive, print
assets/js/theme.js       Loaded in <head>: sets .js, applies saved/system theme before paint
assets/js/main.js        Nav, theme toggle, hero "test run" animation, talk filters
                         (By event / By topic, All / Talks / Workshops), copy-bio buttons
assets/fonts/            Bricolage Grotesque (display), IBM Plex Sans (text), IBM Plex Mono (runner only); all OFL
assets/img/              Portrait, original talk banners, favicon
assets/img/cards/        Talk banners fitted to the 4:3 card frame; these are what the page shows
_headers                 Security headers for Cloudflare Pages / Netlify
.htaccess                The same headers + HTTPS redirect for Apache (Bluehost)
CNAME                    Custom domain for GitHub Pages
robots.txt, sitemap.xml, .nojekyll
```

**Hosting headers live in two places.** If you change the CSP or any security header, change it in
both `_headers` and `.htaccess`. Note: `_headers` sends HSTS with `includeSubDomains; preload`;
`.htaccess` deliberately does not (Bluehost uses its own subdomains).

## Design system

- Tokens are CSS variables on `:root`. Dark values are defined **twice**: under
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` and under
  `:root[data-theme="dark"]`. Keep both in sync.
- Palette: fog background, navy ink `#0f1e33`, **pass green** (`--pass`) = the one accent meaning
  "active / good", **apricot** (`--apricot`) = workshops and the "Now" marker.
- Type: Bricolage Grotesque for headings, IBM Plex Sans for text, IBM Plex Mono only inside the
  hero test-run panel (`sargis.py`).
- Motion is deliberately limited: the hero load sequence and the test-run animation are the one
  orchestrated moment. Don't add scroll-reveal effects to every section.
- Copy style: sentence case, plain verbs, no hype. Don't add ALL-CAPS labels.

## Content: facts that must stay consistent

These numbers appear in several places. When one changes, update **all** of them:

| Fact | Where it appears |
|---|---|
| **17+ years** in software quality | meta description, `og:description`, hero lead, test-run summary, Experience heading, both bios |
| **30+ talks**, since **2015** | `og:description`, meta description and hero lead (the year), test-run line, Talks heading + stats, both bios |
| **17 conferences**, **15 countries** | test-run line, Talks heading + stats, short bio |
| Conference list | "Spoken at" line under the hero (every conference, not meetups) |

Counting rules: conferences count each brand once (all SQA Days editions = 1; SeleniumConf and
Selenium Conf India = 1); the QA MeetUp Yerevan is a meetup, so it's listed as a talk but not
counted as a conference or shown in "Spoken at". Countries come from the talk locations.

Bios in the Speaker kit show a word count next to the heading (`<span class="wc">`). Recount after
editing.

## Adding or editing a talk

1. In `<div class="talks-grid">`, copy an `<article class="talk">` and place it **newest first**.
2. Set `data-type="talk"` or `"workshop"` and `data-year="YYYY"`, the meta line
   (`<span class="kind kind-talk|kind-workshop">`, month + year), event name (`<h3>`), talk title
   (`<p class="talk-title">`; use two for an event with two talks), city (`<p class="talk-place">`)
   and the event link (`<a class="talk-link">` with the visually-hidden suffix).
3. Image: put the original in `assets/img/`, then add a fitted copy to `assets/img/cards/`
   (see below) and reference that. No banner? Use the `talk-media is-tile` block, which prints
   the event name.
4. Add the talk to the matching topic in `<ol class="catalog">` ("By topic" view): update the
   count, year range and "Given at …" list, or add a new `<li class="cat-item">`.
5. Update the counts listed in the table above if the conference or country totals change.

### Card images: scale and extend, never stretch or crop

The owner explicitly wants **every banner shown whole, at its true proportions**, filling a **4:3**
frame. Do not stretch, squeeze or crop. Method used for `assets/img/cards/`:

- Scale the banner uniformly so it fits inside 4:3.
- Fill the remaining space by extending the image's own edges (replicate the edge pixels).
  If an edge is busy rather than a plain colour, soften the added strip with a blur across it so
  it reads as background. A white-background image can simply get white padding.
- Save as JPEG, 1000×750, quality ~85, lowercase file name.

Example (Python + OpenCV):

```python
import cv2
img = cv2.imread("assets/img/banner.png"); h, w = img.shape[:2]
if w / h > 4/3:  pad = round(w*3/4) - h; out = cv2.copyMakeBorder(img, pad//2, pad-pad//2, 0, 0, cv2.BORDER_REPLICATE)
else:            pad = round(h*4/3) - w; out = cv2.copyMakeBorder(img, 0, 0, pad//2, pad-pad//2, cv2.BORDER_REPLICATE)
cv2.imwrite("assets/img/cards/banner.jpg", cv2.resize(out, (1000, 750), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 85])
```

Check the result visually; text, faces and logos must all be fully visible.

## Checking your work

- Open `index.html` directly in a browser (and/or `python3 -m http.server 8080`). The console
  must be clear, including no blocked font or CSP errors.
- Check light and dark (toggle in the header), 1440px and 390px wide, and JavaScript disabled.
- Validate: `npx html-validate@8 index.html` (self-closing `<img />` and trailing-whitespace rules
  can be ignored).
- Confirm there are no `style="` attributes: `grep -c 'style="' index.html` should print `0`.
- After deploying, check https://securityheaders.com and Mozilla Observatory.

## Don't commit or deploy

`_backup-before-redesign/`, `_unused/`, `.claude/`, zip archives and `.DS_Store` are local only
(see `.gitignore`). Never publish `.claude/settings.local.json`.

## Open items to confirm with the owner

- Year/city guesses: SQA Days 30 (2022), SQA Days EU Riga (2019), QA MeetUp Yerevan (2015);
  SQA Days 22, 24 and 25 have no city.
- Best-guess image matches: HUSTEF 2023 (hexagon banner) and TestCon Europe 2022 (`tc_speaker`).
- Not on the owner's own talk list but kept: STARWEST 2024, DevCon 2024, HUSTEF 2020.
