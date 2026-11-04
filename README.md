# Tellan site

Website for [tellan-consulting.com](https://tellan-consulting.com). Static
[Astro](https://astro.build) build, deployed on Vercel.

## Development

```sh
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # astro check + static build to dist/
npm run preview  # serve dist/
```

## Layout

```
src/
  pages/        index, team, contact (one .astro file per route)
  layouts/      Base.astro: <head>, meta/OG tags, header and footer
  styles/       global.css: design tokens and base styles
  assets/       images and SVGs processed at build time
  consts.ts     site name, titles, meta description, nav links
public/         copied as-is (favicon, robots.txt, _headers)
```
<!-- 
## Deployment

The site is hosted on Vercel as the `tellan-site` project, with no env vars and no
functions. [`vercel.json`](vercel.json) sets the framework and build command, plus the
cache and security headers.

With the project connected to this repo, pushes to `main` deploy to production and
pull requests get preview deploys. To deploy by hand from a fresh clone:

```sh
npm i -g vercel@latest
vercel login
vercel link --project tellan-site
vercel          # preview
vercel --prod   # production
```

After a deploy, check that build assets are cached immutably:

```sh
curl -sI https://tellan-consulting.com/_astro/<any-file> | grep -i cache-control
# → public, max-age=31536000, immutable
```

The production origin is `https://tellan-consulting.com`. It's set in
`astro.config.mjs` (`site`) and in the `Sitemap:` line of `public/robots.txt`, so if it
changes, update both together.

## Before launch

- [ ] Final meta description: `src/consts.ts`
- [ ] Final positioning line: `src/pages/index.astro`
- [ ] Wire the contact form to a real handler: `src/pages/contact.astro`
- [ ] Replace the generated wordmark card at `src/assets/og-default.jpg` (1200×630) with final artwork, if needed

## Performance rules

- **No client JS by default.** The only script shipped is Astro's prefetch helper. If
  something needs interactivity, add it as a framework island with `client:visible` or
  `client:idle`, and use `client:load` only for content above the fold.
- **Images** go in `src/assets` and render with
  `<Picture formats={['avif', 'webp']} widths={…} sizes="…">`. Only the hero image gets
  `loading="eager" fetchpriority="high"`; everything else is `loading="lazy"`.
- **Logos and icons** are SVG: `src/assets/logo.svg` is imported as a component, and the
  favicon is `public/favicon.svg`.
- **Fonts** use the system stack defined in `global.css`. If a brand font is needed,
  self-host one variable woff2 with `font-display: swap` and a `<link rel="preload">`.
  Don't link to Google Fonts.
- **CSS** has tokens and base styles in `global.css`, with scoped `<style>` blocks in
  components. No Tailwind or CSS-in-JS.
- **No third-party scripts.** If analytics are added, the script must be `defer` and
  under 5 KB.
- `public/_headers` repeats the immutable `/_astro/*` cache rule for Cloudflare Pages
  and Netlify. Vercel ignores that file and reads `vercel.json` instead.
-->
