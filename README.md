# murphybedpros.com

Murphy Bed Pros, a WordPress blog about wall beds, moved off WPX hosting to a static site on Cloudflare Workers. Every push to `main` deploys.

The pages in `public/` are the live site's own HTML, styles, scripts and images (Astra theme and plugin files kept at their WordPress paths). Changes made in the move:

- Google AdSense and the Shop Online page's partner links (wallbedplace.com) are kept as they were.
- The GPT "AI content generator" plugin's scripts were removed (they needed WordPress running).
- Existing comments stay visible; reply links were removed, since a static site can't take new comments.
- About 98 images in older posts were already missing on the live WordPress site (it answered with its "page not found" page). They were left out rather than copied as fake image files, so those spots look the same as before.
- `public/sitemap.xml` and `public/robots.txt` replace WordPress's `/wp-sitemap.xml`, which now redirects there.

Note: the Google Analytics tag on the pages is an old Universal Analytics ID (UA-191555-25), which Google shut down in 2024, so it doesn't record visits.

## Editing

Each page is `public/<url>/index.html` (the home page is `public/index.html`). Edit the HTML directly, or ask Claude to. Images go in `public/wp-content/uploads/`. Cloudflare Workers serves files up to 25 MiB each.

Cloudflare build settings: no build command, deploy command `npx wrangler deploy`.

`build-from-wordpress.py` is the one-time script that turned the WordPress copy into `public/`; it's kept for reference.
