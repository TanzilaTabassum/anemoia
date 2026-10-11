# ANEMOIA

A personal digital publication — art, photography, writing and side quests — built as a **static site** with Jekyll, plain HTML/CSS/JavaScript and Markdown. It hosts for free on GitHub Pages and is designed to grow to hundreds of pieces.

> The content in this repo (the two paintings, the photo series, three writing pieces and the woodworking quest) is **sample content with generated placeholder images**. Delete or replace it when you start publishing.

**Contents**
1. [Run it locally](#1-run-the-site-locally)
2. [Add new content](#2-add-new-content)
3. [Where images go](#3-where-images-go)
4. [How Markdown and front matter work](#4-how-markdown-and-front-matter-work)
5. [Tags](#5-tags)
6. [Featured content](#6-featured-content)
7. [Related links and linking between pieces](#7-related-links-and-linking-between-pieces)
8. [How the archive and search are generated](#8-how-the-archive-and-search-are-generated)
9. [Commit and push](#9-commit-and-push)
10. [How GitHub Pages deployment works](#10-how-github-pages-deployment-works)
11. [Connect a custom domain](#11-connect-a-custom-domain-later)
12. [Reference: the schemas](#12-reference-the-schemas) · [Writing helpers](#13-writing-helpers-for-markdown) · [Customising](#14-customising-the-look) · [Troubleshooting](#15-troubleshooting)

---

## The one idea to remember

**Content is separate from presentation.** You only ever touch:

| You edit | to do this |
|---|---|
| `_art/`, `_photography/`, `_writing/`, `_sidequests/` | add or change a piece |
| `assets/images/<type>/<piece>/` | add the pictures for it |
| `_data/*.yml` | change nav, social links, the "Right now" box, writing categories |
| `_config.yml` | site title, URL, limits |

Everything else (home, category pages, archive, search, related blocks, prev/next, lightbox) is **generated automatically** from what's in those folders. You never edit a list by hand.

```
anemoia/
├── _config.yml           site settings + how each content type is laid out
├── _data/                small YAML files: navigation, sections, social links, "currently", writing types
├── _layouts/             one page design per content type (art, photography, writing, sidequest)
├── _includes/            reusable pieces: header, footer, card, related-content, lightbox, figure…
├── _art/  _photography/  _writing/  _sidequests/      ← YOUR CONTENT (Markdown)
├── _templates/           copy-me starting points (ignored by the site)
├── assets/  css/ js/ images/<type>/<piece>/            styles, scripts, your pictures
├── art/ photography/ writing/ articles/ reviews/ sidequests/     section index pages
├── archive/  search/  search.json  about/  contact/    generated catalogue + search
└── tools/                new.py · check.py · make-sizes.py (optional helpers)
```

---

## 1. Run the site locally

You need [Ruby](https://www.ruby-lang.org/en/documentation/installation/) (3.x) and Bundler once.

```bash
cd anemoia
bundle install            # first time only — installs the same Jekyll GitHub Pages uses
bundle exec jekyll serve --livereload
```

Open <http://localhost:4000>. Save a file and the page refreshes itself.

- Change `_config.yml`? Stop (Ctrl+C) and start the server again — config isn't live-reloaded.
- Dated in the future? Jekyll hides it. Add `--future` to preview scheduled pieces.
- Windows: use [RubyInstaller](https://rubyinstaller.org/) (with DevKit). On Mac: `brew install ruby`.

**Optional helpers** (need Python 3; `pip install pyyaml pillow`):

```bash
python3 tools/new.py art "Untitled No. 05"     # create a piece from a template + its image folder
python3 tools/check.py                         # find mistakes before you push
python3 tools/make-sizes.py                    # make smaller image copies (see §3)
```

---

## 2. Add new content

The 2030 workflow, in five steps:

1. **Copy a template** — `python3 tools/new.py art "My Title"`, or duplicate the matching file from `_templates/` into the right folder by hand.
2. **Fill in the metadata** at the top (between the `---` lines).
3. **Add images** to `assets/images/<type>/<file-name>/`.
4. **Write** below the second `---`, in Markdown.
5. **Commit and push** (§9). It appears in its category, the homepage "Latest", the archive, search and related blocks automatically.

**File names matter.** The file name (without `.md`) becomes the URL and the image-folder name:

| File | URL | Image folder |
|---|---|---|
| `_art/untitled-no-05.md` | `/art/untitled-no-05/` | `assets/images/art/untitled-no-05/` |
| `_photography/night-trains.md` | `/photography/night-trains/` | `assets/images/photography/night-trains/` |
| `_writing/a-short-essay.md` | `/writing/a-short-essay/` | `assets/images/writing/a-short-essay/` |
| `_sidequests/learning-flags.md` | `/sidequests/learning-flags/` | `assets/images/sidequests/learning-flags/` |

Use lowercase letters, numbers and hyphens. **Don't start file names with a date** (the URL would include it — the date goes in the metadata). Don't rename a file after publishing, or its URL changes.

---

## 3. Where images go

One folder per piece:

```
assets/images/art/untitled-no-04/
    main.jpg   sketch.jpg   attempt-1.jpg   final-detail.jpg
assets/images/photography/rainy-days/
    01-window.jpg   02-umbrellas.jpg …
```

In front matter you write **just the file name** (`image: main.jpg`) and the site looks in that piece's own folder. You can also use a full path (`/assets/images/shared/texture.jpg`) or a web address.

**Keeping pages light.** Export web images at roughly 1600–2400 px on the long edge as JPEG (quality ~80). For the best of both worlds:

1. Run `python3 tools/make-sizes.py` — it makes `photo-480.jpg`, `photo-960.jpg` and `photo-1600.jpg` beside each original. Originals are untouched.
2. In `_config.yml` set `responsive_images: true`.

Pages then give each visitor the right size automatically, while the **lightbox and full-size view open your original**. To use a different, bigger file for the lightbox, add `full: big-file.jpg` (photos/process) or `image_full:` (art).

Rules of thumb: always write **alt text** (describe what's in the image), keep GitHub's limits in mind (repos under ~1 GB are comfortable; single files under 100 MB), and give artwork `image_width` / `image_height` so the page doesn't jump while loading.

---

## 4. How Markdown and front matter work

Every piece is a text file with two parts:

```markdown
---
title: Untitled No. 05          ← front matter: the metadata (YAML)
date: 2026-10-20
tags: [acrylic, rain]
---
I painted this after…            ← the body: normal Markdown
```

YAML in one minute:
- `key: value` — one line per field. Quote a value if it contains a colon (`title: "Part 2: The Return"`).
- Lists: `tags: [one, two]` or one `- item` per line.
- Dates are always `YYYY-MM-DD`.
- `true` / `false` (no quotes) for yes/no fields.
- Lines starting with `#` are comments.
- Every field marked *optional* can be deleted — layouts adapt, nothing breaks.

Markdown basics: `## Heading`, `**bold**`, `*italic*`, `[link text](https://…)`, `- bullet`, `1. numbered`, `> quote`, `![alt](image.jpg)`. Run `python3 tools/check.py` any time to catch typos.

The full list of fields for each type is in [§12](#12-reference-the-schemas), and every template in `_templates/` shows them with comments.

---

## 5. Tags

Add them in the front matter:

```yaml
tags: [dhaka, rain, everyday-life]
```

- Use **lowercase-with-hyphens**. `Dhaka` and `dhaka` would become two different tags.
- Reusing a tag is how pieces find each other. Tags are what drive **related content**, the **archive's By tag** list, and **search**.
- There's no tag list to maintain. Using a new tag creates it everywhere.
- Every tag on a page links to `/search/?tag=…`.

---

## 6. Featured content

```yaml
featured: true
```

Any piece with that line appears in the homepage **Featured** section (newest first; the first is shown large). Remove the line, or set it to `false`, to take it off. Mix any types — art, photography, writing, side quests.

How many appear: `featured_limit` in `_config.yml` (default 6).

---

## 7. Related links and linking between pieces

**Automatic.** At the bottom of every piece, up to three blocks appear — *only* when there's something genuinely related:

| Block | What it shows |
|---|---|
| **You may also like** | other pieces (any type) that share at least one tag; more shared tags rank higher |
| **More from #subject** | other pieces tagged with this piece's main subject (its first tag, or `subject:` in front matter) that aren't already shown |
| **Related** | pieces you chose by hand |

**Hand-picked.** List the files in the front matter:

```yaml
related:
  - _photography/rainy-days.md
  - _writing/the-privilege-of-spontaneity.md
```

**Inline links inside your writing** — link by *file*, so the link never breaks if you later change a URL:

```liquid
I wrote about this in {% include link.html to="_writing/the-privilege-of-spontaneity.md" %}.
I wrote about {% include link.html to="_art/untitled-no-04.md" text="that painting" %}.

{% include ref.html to="_photography/rainy-days.md" %}              ← a "see also" card
{% include ref.html to="_photography/rainy-days.md" note="Related series" %}
```

If a path is wrong the page still builds (a hidden HTML comment tells you which). `python3 tools/check.py` reports broken ones too.

---

## 8. How the archive and search are generated

Both are built from **the metadata of every piece** — nothing is typed by hand.

- **`_includes/all-content.html`** gathers every item from the four collections into one list. It's the single source for the homepage, archive, search and related blocks. A new collection only needs adding to that one list.
- **Archive (`/archive/`)** groups that list *By date* (year → month, new years appear automatically), *By type* (Art, Photography, Articles, Reviews, Side Quests) and *By tag*. It works with JavaScript off.
- **Search (`/search/`)** — Jekyll writes **`/search.json`** (title, URL, date, category, subtype, tags, description, opening excerpt) at build time. `assets/js/search.js` loads it and filters in the browser: no server, no database. Filters **combine**: *Type = Articles* + *Month = July 2026* → every article from July 2026. Searching words ranks title matches above tag matches above description matches. Results are shareable URLs such as `/search/?type=photography&month=2026-09&tag=dhaka`.
- Searching prefers a good **`description:`** on every piece (one sentence). It's used on cards, in search, and for link previews.

---

## 9. Commit and push

With VS Code, or from a terminal:

```bash
git add .
git commit -m "Add Untitled No. 05"
git push
```

First time only — create an empty repository on GitHub (e.g. `anemoia`), then:

```bash
git init
git add .
git commit -m "First version of Anemoia"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/anemoia.git
git push -u origin main
```

The `.gitignore` already keeps the generated `_site/` folder out of the repo.

---

## 10. How GitHub Pages deployment works

1. In your repo: **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**, branch `main`, folder `/ (root)`. Save.
2. Every push to `main` makes GitHub run Jekyll for you (a few minutes). Watch progress in the **Actions** tab.
3. Your site appears at `https://YOUR-USERNAME.github.io/anemoia/` (or `https://YOUR-USERNAME.github.io/` if the repo is named `YOUR-USERNAME.github.io`).

**Set the address in `_config.yml`** or links and images will break:

| Repo | `url:` | `baseurl:` |
|---|---|---|
| `YOUR-USERNAME.github.io` | `"https://YOUR-USERNAME.github.io"` | `""` |
| any other name, e.g. `anemoia` | `"https://YOUR-USERNAME.github.io"` | `"/anemoia"` |
| with a custom domain | `"https://yourdomain.com"` | `""` |

Things to know:
- GitHub Pages only runs a **fixed set of Jekyll plugins**. This project uses only allowed ones (`jekyll-sitemap`), and the `Gemfile` uses the `github-pages` gem so your local build matches the live one.
- The site needs no JavaScript to read or navigate; JS only adds the lightbox, search, mobile menu and chapter list.
- Fonts (Bricolage Grotesque, Newsreader, DM Mono, Silkscreen) load from Google Fonts. To self-host them, download the files into `assets/fonts/` and replace the `<link>` in `_layouts/default.html` with `@font-face` rules in `base.css`.

---

## 11. Connect a custom domain later

1. Buy a domain from any registrar.
2. In the repo, **Settings → Pages → Custom domain**, type it (e.g. `anemoia.example`) and save — GitHub creates a `CNAME` file for you.
3. At your registrar's DNS settings, add:
   - for `www.yourdomain.com`: a **CNAME** record pointing to `YOUR-USERNAME.github.io`
   - for the bare `yourdomain.com`: four **A** records to GitHub's addresses (listed in [GitHub's guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).
4. Wait for DNS to update (minutes to hours), then tick **Enforce HTTPS**.
5. Update `_config.yml`: `url: "https://yourdomain.com"` and `baseurl: ""`.

---

## 12. Reference: the schemas

`*` = required. Everything else is optional.

### Art — `_art/<slug>.md`
| Field | Notes |
|---|---|
| `title`* `date`* | |
| `image`* `alt`* | main image (file in the piece's folder) and its description |
| `medium` `dimensions` | shown under the title |
| `description` | one sentence, for cards and search |
| `image_width` `image_height` | prevents layout jump |
| `image_full` | bigger file for the full-size view |
| `process_images` | list of `file`, `label`, `caption`, `alt`, `full` — shown under **Process** |
| `featured` `tags` `related` `subject` | |
The body becomes **About the piece**.

### Photography — `_photography/<slug>.md`
| Field | Notes |
|---|---|
| `title`* `date`* `images`* | |
| `location` | shown in the dateline and the lightbox |
| `description` | the series introduction |
| `cover_image` | optional; defaults to the first image |
| `featured` `tags` `related` | |
Each `images` entry: `file`*, `alt`, `caption` (2–3 lines), `full`, `location`, `date`, `shape` (`wide` / `tall` / `half` / `third`). Without `shape`, a rotating pattern gives the grid its asymmetry. The first image is the opening spread. The body (optional) becomes a note under the intro.

### Writing — `_writing/<slug>.md`
| Field | Notes |
|---|---|
| `title`* `date`* `type`* | `type` is a key from `_data/writing_types.yml` |
| `subtitle` | the deck under the title |
| `updated` | shows "Updated …" |
| `description` | for the index, cards, search |
| `reading_time` | minutes; calculated automatically if omitted |
| `cover_image` `cover_alt` `cover_caption` | optional hero image |
| `dropcap: false` | turn the drop cap off |
| `featured` `tags` `related` `subject` | |

**Adding a new kind of writing** (e.g. "Letters"): add a block to `_data/writing_types.yml` with a `key`, `label`, `section`, and `group` (`articles` or `reviews`). Use `type: letter` in the piece. Cards, archive, search and colours update by themselves — no layout edits.

### Side Quest — `_sidequests/<slug>.md`
| Field | Notes |
|---|---|
| `title`* `date`* | `date` = start date |
| `end_date` | leave out while ongoing |
| `status` | `in-progress`, `completed`, `failed`, `abandoned`, `paused` (edit `_data/quest_status.yml`) |
| `description` `cover_image` `cover_alt` | |
| `log` | list of `label` / `value` rows in the side "Quest log" |
| `result` | text for the "Final result" block |
| `lessons` | list shown as "Lessons learned" |
| `featured` `tags` `related` | |
Every `##` heading in the body becomes a numbered chapter, with a chapter outline in the side panel.

---

## 13. Writing helpers for Markdown

Use these in **writing** and **side quest** bodies (and art notes).

```markdown
> A normal block quote.

> A big pull quote.
{: .pullquote}

> A progress update.        ← also .fail  .find  .lesson  .note  (side-quest field notes)
{: .callout .update}

This is <mark>highlighted</mark>.     A footnote[^1].     [^1]: The footnote text.

| Col | Col |       ← normal Markdown tables
|---|---|

<details markdown="1">
<summary>Click to expand</summary>

Hidden text.

</details>
```

Images, video and links:

```liquid
{% include figure.html src="photo.jpg" alt="Describe it" caption="Optional caption" %}
   align="center"   (default)  |  "wide"  |  "left"  |  "right"  |  "full"
   kind="scan"      (taped-paper look, good for sketches/notebook pages)
   full="big.jpg"   (bigger file for the lightbox)

{% include figure-pair.html a="before.jpg" a_alt="…" a_caption="Before" b="after.jpg" b_alt="…" b_caption="After" %}

{% include youtube.html id="VIDEO_ID" title="What it shows" %}      ← id is the bit after v= in the video address
```

Clicking any figure opens the lightbox; images on the same page can be stepped through with ← / → and closed with Esc.

---

## 14. Customising the look

- **Colours, fonts, spacing, borders**: the "tokens" at the top of `assets/css/base.css` (`--tomato`, `--sky`, `--f-display`, `--bw`…). Change them once and the whole site follows.
- Each section has its own sheet — `art.css` (gallery), `photography.css` (magazine), `writing.css` (publication), `sidequests.css` (journal), `home.css`, `archive.css` — so they can look different while sharing one design language.
- **Section colours**: each category gets one accent via `.sec-art`, `.sec-photography`, … in `base.css`.
- **Navigation / footer links**: `_data/navigation.yml`, `_data/social.yml`. **"Right now"** box: `_data/currently.yml`.
- **Homepage text**: `index.html`. **About / Contact**: `about/index.md`, `contact/index.md`.

---

## 15. Troubleshooting

| Problem | Likely cause |
|---|---|
| A new piece doesn't appear | Its `date` is in the future (use `--future` locally), or the front matter has a typo — run `python3 tools/check.py` |
| Images missing | Folder name must match the file name exactly; file name case matters on GitHub |
| Site looks unstyled on GitHub | `url` / `baseurl` in `_config.yml` don't match the repo name (§10) |
| Build fails on GitHub | Check the **Actions** tab; usually a YAML typo (missing quote around a title with a colon) |
| A tag shows up twice | Different spelling/case — keep tags lowercase-with-hyphens |
| A page is blank where an include should be | Check the path in `to="…"` — start with the folder, e.g. `_art/my-piece.md` |
| A link works locally but 404s on GitHub | You typed a plain `/contact/` link in a Markdown page. If your site lives at `…github.io/anemoia/`, write `{{ '/contact/' \| relative_url }}` instead (or use `link.html` to point at a piece). Links made by the site itself already do this. |
| Search shows an odd or empty excerpt | The excerpt is the first paragraph of the piece. Start with a normal sentence rather than an image or include, and give every piece a `description:`. |
| An image folder name doesn't match | The folder is named after the **file name**, not the title: `_art/untitled-no-04.md` → `assets/images/art/untitled-no-04/` |
