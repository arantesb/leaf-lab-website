# LEAF LAB Website

Website for the LEAF LAB research group — Lidar Ecology & Forests, University of Maryland.

---

## ✏️ How to Edit the Website (No coding needed)

All editable content lives in the **`content/`** folder. You can update it directly in GitHub — no software or technical knowledge required.

### Step 1 — Open the file you want to edit

Navigate to the [`content/`](./content/) folder in this repo and click the file:

| File | What it controls |
|------|-----------------|
| [`content/team.json`](./content/team.json) | Team members (PI, researchers, alumni) |
| [`content/projects.json`](./content/projects.json) | Research projects |
| [`content/news.json`](./content/news.json) | News, press coverage, talks |
| [`content/publications.json`](./content/publications.json) | Journal articles, book chapters, dissertations |

### Step 2 — Edit in GitHub

1. Click the **pencil icon** (✏️) in the top-right corner of the file
2. Make your changes
3. Scroll to the bottom → click **"Commit changes"**
4. Add a short description of what you changed (e.g. "Add new team member") → click **"Commit changes"** again

The website updates automatically within a minute.

### Step 3 — Add a photo

To add a team photo:
1. Go to [`content/images/team/`](./content/images/team/)
2. Click **"Add file"** → **"Upload files"**
3. Drag and drop the photo (use JPG or PNG, ideally square, at least 400×400px)
4. Name the file using the person's ID (e.g. `laura-duncanson.jpg`)
5. Commit the upload
6. In `content/team.json`, set `"photo": "content/images/team/laura-duncanson.jpg"` for that person

---

## 📁 File Structure

```
leaf-lab-website/
├── content/                  ← EDIT HERE — all your content
│   ├── team.json             ← Team members
│   ├── projects.json         ← Research projects
│   ├── news.json             ← News & media
│   ├── publications.json     ← Publications list
│   └── images/
│       ├── team/             ← Team photos go here
│       └── projects/         ← Project images go here
│
├── index.html                ← Home page
├── team.html                 ← Team page
├── projects.html             ← Projects page
├── publications.html         ← Publications page
├── news.html                 ← News page
├── contact.html              ← Contact page
├── style.css                 ← Visual design (don't edit)
├── script.js                 ← Shared JS (don't edit)
└── admin/
    └── index.html            ← Admin panel (optional CMS)
```

---

## 🛠 Admin Panel

There is also a graphical admin panel at `admin/index.html`. It lets you add/edit/delete team members, projects, and news items through a form interface — and commits changes directly to GitHub using a Personal Access Token.

To use it: open `admin/index.html` in your browser and enter a GitHub token with `repo` scope.

---

## 🌐 Viewing the Live Site

The site is published via GitHub Pages. View it at:
**https://arantesb.github.io/leaf-lab-website/**

> If the site isn't live yet, go to **Settings → Pages → Source → Deploy from branch: `main` / `/ (root)`** and save.
