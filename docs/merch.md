# Merch store (`/merch`)

Hats are sold through Stripe Payment Links. Each product is a markdown file in an
Astro content collection, and **each color gets its own Payment Link**. Stripe handles
checkout, shipping address and payment, so the store adds no server code.

```
src/content.config.ts              products collection + schema
src/content/products/*.md          one file per product; the file name is the URL slug
src/content/products/images/       product photos
src/lib/merch.ts                   loading, sorting, prices, draft and test-link rules
src/components/merch/ProductCard.astro
src/pages/merch/index.astro        /merch              product grid
src/pages/merch/[slug].astro       /merch/<slug>       product page: color picker, Buy button
src/pages/merch/thanks.astro       /merch/thanks       Stripe redirects here after payment (noindex)
```

The **Merch** nav link only appears once at least one product is published, so the
store can sit on `main` before launch.

## Drafts, previews and test links

| Build | Draft products | Stripe test-mode links (`buy.stripe.com/test_…`) |
|---|---|---|
| `npm run dev` | shown, with a Draft badge | allowed |
| Vercel preview deploy (`VERCEL_ENV=preview`) | shown, with a Draft badge | allowed |
| Production | hidden | **build fails** if a published product uses one |

Set `MERCH_SHOW_DRAFTS=true` or `MERCH_ALLOW_TEST_LINKS=true` to override this for
another kind of build.

## Stripe setup (once per color)

Create a Product in the Stripe Dashboard with one Price, then create one Payment Link
per color with these settings:

- **Product/price:** the hat, at the same price as `price:` in the markdown file.
  Stripe's price is what customers pay; the site's price is display only.
- **Collect customers' addresses:** on, limited to the countries you ship to.
- **Shipping rates:** your flat or tiered rates.
- **Adjust quantity:** on, with a sensible maximum (e.g. 5).
- **Collect phone number:** optional, useful for carriers.
- **After payment → Redirect:** `https://tellan-consulting.com/merch/thanks`
- **Limit the number of payments:** optional safety net for small batches. It counts
  payments, not units, so with adjustable quantity it's an upper bound, not exact stock.
- **Stripe Tax:** off. Tax is handled outside Stripe.

Turn on Stripe's email notifications for successful payments so whoever packs orders
sees them. Orders and shipping addresses are under Payments in the Dashboard.

## Launch a product

1. Add the photos to `src/content/products/images/` and write the `.md` file (copy an
   existing one). The build rejects missing alt text, non-Stripe links, bad swatch
   colors and duplicate variant ids.
2. Paste each color's **live** Payment Link into its `paymentLink:`.
3. Change `status: draft` to `status: active` (or delete the line) and merge.

## A color sells out

1. **Deactivate that color's Payment Link in Stripe.** This takes effect immediately;
   old tabs and shared links can still reach the link until you do.
2. Set `available: false` on the variant and merge. The color is shown as sold out and
   can't be selected, and its link is left out of the page. When every color is
   unavailable, the product shows "Sold out".

To restock, reactivate the link in Stripe and set `available: true`.

## Behaviour notes

- Picking a color swaps the photo, updates the Buy link and sets `?color=<id>` in the
  URL, so `/merch/classic-cap?color=navy` preselects navy.
- Without JavaScript, Buy uses the first in-stock color, and a `<noscript>` list links
  to every in-stock color.
- Product pages include `ProductGroup` structured data (one `Offer` per color, with
  stock status) and use the product photo as the social card.
