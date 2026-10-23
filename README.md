# Tellan site

Static Astro site tuned for page speed.

```sh
npm run dev      # local dev server
npm run build    # astro check + static build to dist/
npm run preview  # serve dist/
```

## Before launch

- Production origin is `https://tellan-consulting.com` (`site` in `astro.config.mjs` and the `Sitemap:` line in `public/robots.txt`); change both together if it moves.
- Resolve the `TODO` comments in `src/pages/*.astro` and `src/consts.ts` (placeholder copy).
- `src/assets/og-default.jpg` (1200×630) is a generated wordmark card; swap in final artwork if needed.

## Deploying to Vercel

One static project: no env vars, no functions, no Root Directory setting. Config lives in
[`vercel.json`](vercel.json) — framework, build command, and the immutable cache header for
`/_astro/*` (Vercel ignores `public/_headers`, which is kept for Cloudflare Pages / Netlify).

```sh
# 0. Use a current Vercel CLI
npm i -g vercel@latest
vercel login

# 1. Push to GitHub (first time only)
git init && git add -A && git commit -m "feat: scaffold astro site"
gh repo create haysburns4/tellan-site --private --source=. --push

# 2. Link and deploy
vercel link            # create a new project, e.g. "tellan-site"
vercel                 # preview deploy
vercel --prod          # production
```

Connecting the GitHub repo during `vercel link` gives preview deploys on every PR and
production deploys on merges to `main`. Attach the domain with `vercel domains add tellan-consulting.com` (and `www.tellan-consulting.com`,
redirected to the apex in the Vercel dashboard), then point DNS at Vercel as the CLI instructs.

Smoke test after deploying:

```sh
curl -sI https://tellan-consulting.com/_astro/<any-file> | grep -i cache-control   # → public, max-age=31536000, immutable
```

## Performance rules

- **Zero JS by default.** The only script shipped is Astro's ~2.5 KB prefetch helper. Interactive
  components are React islands with `client:visible` / `client:idle` (`client:load` only above the fold).
- **Images** live in `src/assets` and render via `<Picture formats={['avif', 'webp']} widths={…} sizes="…">`.
  Only the hero is `loading="eager" fetchpriority="high"`; everything else is `loading="lazy"`.
- **Logos/icons** are SVG (`src/assets/logo.svg`, imported as a component; `public/favicon.svg`).
- **Fonts:** system stack in `src/styles/global.css`. If a brand font is needed, self-host one
  variable woff2 with `font-display: swap` and a `<link rel="preload">` for it — no Google Fonts links.
- **CSS:** tokens + base styles in `src/styles/global.css`, scoped `<style>` in components. No Tailwind or CSS-in-JS.
- **No third-party scripts.** Analytics, if added, must be `defer` and under 5 KB.
- `public/_headers` sets immutable caching for `/_astro/*` (Cloudflare Pages / Netlify).
