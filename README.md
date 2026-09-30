# spuder.github.io

Personal portfolio and blog for Spencer Owen, built with [Astro](https://astro.build) and deployed to GitHub Pages by GitHub Actions.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Add a project

Create `src/content/projects/<slug>.md`:

```yaml
---
title: My Project
tagline: One or two sentences on what it is.
repo: spuder/my-project
group: hardware        # hardware | homelab | devops
featured: false        # true = large card on the home page
order: 50              # lower sorts first
tags: [ESP32, C++]
image: /projects/my-project.jpg   # put images in public/projects/
stars: 0               # fallback if the GitHub API is unavailable
links:
  - { label: Docs, url: "https://example.com" }
---
```

If the file has body text, it gets its own page at `/projects/<slug>/`. If it has no body, the card links straight to the GitHub repo. Star counts are fetched from the GitHub API at build time, and the site rebuilds weekly to keep them current.

Strip photo metadata (GPS location, camera info) before adding images:

```bash
magick photo.jpg -auto-orient -strip -resize 1400x public/projects/photo.jpg
```

## Blog posts

Posts live in `src/content/blog/YYYY-MM-DD-slug.md` and are served at `/YYYY/slug/`, the same URLs the old Jekyll site used.
