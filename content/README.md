# Content Editing Guide

This folder contains all the data that drives the LEAF LAB website. Edit these files to update the site — no coding required.

---

## `team.json` — Team Members

Each person is one entry `{ }` in the list. Fields:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique slug (no spaces) | `"laura-duncanson"` |
| `name` | Full name | `"Dr. Laura Duncanson"` |
| `role` | Job title shown on card | `"PhD Researcher"` |
| `title` | Secondary title (optional) | `"Associate Professor"` |
| `status` | `"pi"` · `"current"` · `"alumni"` | `"current"` |
| `initials` | 2–3 letter initials (shown if no photo) | `"LD"` |
| `photo` | Path to photo file (leave `""` if none) | `"content/images/team/laura-duncanson.jpg"` |
| `bio1` | Main bio paragraph | `"Laura is a remote sensing scientist..."` |
| `bio2` | Second bio paragraph (optional, leave `""`) | `""` |
| `education` | Degrees, separated by ` \| ` | `"PhD · UMD \| MSc · UVic"` |
| `expertise` | Keywords separated by ` · ` | `"LiDAR · Biomass · Ecology"` |
| `scholar` | Google Scholar URL (leave `""` if none) | `"https://scholar.google.com/..."` |
| `profile` | University profile URL (leave `""` if none) | `"https://geog.umd.edu/..."` |

**To add a new team member:** copy an existing entry, paste it after the last `}` and before the closing `]`, add a comma after the previous entry's `}`, then fill in the fields.

**To remove someone:** delete their entire entry `{ ... }` including the comma before it.

---

## `projects.json` — Research Projects

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique slug | `"gedi-biomass"` |
| `title` | Project title | `"GEDI Biomass Product Development"` |
| `funder` | Funder · Region · Years | `"NASA · Global · 2019 – Present"` |
| `emoji` | One emoji for the card icon | `"🛰"` |
| `status` | `"active"` or `"completed"` | `"active"` |
| `description` | 2–3 sentence description | `"Development and validation of..."` |
| `people` | Team members separated by ` · ` | `"Duncanson · Tang · Liang"` |
| `location` | Geographic scope | `"Global"` |

---

## `news.json` — News & Media

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique slug | `"nyt-gedi-2023"` |
| `title` | Headline | `"GEDI Researchers Explain..."` |
| `source` | Publication or outlet | `"The New York Times"` |
| `date` | ISO date `YYYY-MM-DD` | `"2023-11-15"` |
| `year` | 4-digit year string (shown on card) | `"2023"` |
| `category` | `"Press"` · `"NASA"` · `"Video"` · `"Research"` · `"Talk"` | `"Press"` |
| `excerpt` | 2–3 sentence summary | `"Dr. Duncanson and..."` |
| `url` | Link to article/video | `"https://..."` |
| `emoji` | One emoji for the card | `"🌿"` |
| `featured` | `true` = shown as large hero card; only one should be `true` | `false` |

---

## `publications.json` — Publications

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique slug | `"gedi-l4a-2022"` |
| `year` | Publication year (number) | `2022` |
| `type` | `"article"` · `"book"` · `"thesis"` | `"article"` |
| `title` | Full paper title | `"Aboveground biomass density models..."` |
| `authors` | Author list as string | `"Duncanson, L., Kellner, J. R., et al."` |
| `journal` | Journal or publisher name | `"Remote Sensing of Environment"` |
| `details` | Volume/issue/year detail | `"270 · 112845 · 2022"` |
| `doi` | DOI string (optional, leave `""`) | `"10.1016/j.rse.2021.112845"` |
| `url` | Direct link to paper (optional) | `"https://doi.org/..."` |
| `highlight` | `true` adds "Highly Cited" badge | `false` |

Publications are automatically grouped by year and sorted newest-first.

---

## Tips

- **Don't delete the square brackets `[ ]`** at the start and end of each file — the list lives inside them.
- **Commas matter:** every entry `{ }` needs a comma after it *except* the last one.
- **Quotes matter:** all text values must be wrapped in `"double quotes"`.
- If the site breaks after an edit, GitHub has a history — go to the file → click the clock icon → restore a previous version.
- Use the [JSONLint validator](https://jsonlint.com/) to check your JSON if you're unsure.
