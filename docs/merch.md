# Merch store (`/merch`)

`/merch` sells **one product** (a hat) through a single Stripe Payment Link. The product
is a markdown file in an Astro content collection: one photo, a name, a price and the
link. Stripe handles checkout, shipping address and payment, so the store adds no server
code and the page ships no JavaScript.

```
src/content.config.ts              products collection + schema
src/content/products/*.md          the product (only one can be `status: active`)
src/content/products/images/       product photo
src/lib/merch.ts                   picks the product; draft and test-link rules
src/pages/merch/[...root].astro    /merch          the product page: photo, name, price, status, buy
src/pages/merch/thanks.astro       /merch/thanks   Stripe redirects here after payment (noindex)
```

Until a product is active, production doesn't build `/merch` at all and the footer has
no **Merchandise** link, so the store can sit on `main` before launch.

## Drafts, previews and test links

| Build | Draft products | Stripe test-mode links (`buy.stripe.com/test_…`) |
|---|---|---|
| `npm run dev` | shown if none is active, with a Draft badge | allowed |
| Vercel preview deploy (`VERCEL_ENV=preview`) | shown if none is active, with a Draft badge | allowed |
| Production | hidden | **build fails** if the active product uses one |

Set `MERCH_SHOW_DRAFTS=true` or `MERCH_ALLOW_TEST_LINKS=true` to override this for
another kind of build.

## Stripe setup

Create a Product in the Stripe Dashboard with one Price, then one Payment Link with
these settings:

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

## Launch the product

1. Put the photo in `src/content/products/images/` (square works best) and edit the
   `.md` file. The build rejects missing alt text and non-Stripe links.
2. Paste the **live** Payment Link into `paymentLink:`.
3. Change `status: draft` to `status: active` (or delete the line) and merge.

To swap in a different product later, set the old one to `status: draft` (or delete it)
in the same change: the build fails if two products are active.

## Sold out

1. **Deactivate the Payment Link in Stripe.** This takes effect immediately; old tabs
   and shared links can still reach the link until you do.
2. Set `available: false` and merge. The page says `status: sold out` and drops the
   buy link.

To restock, reactivate the link in Stripe and set `available: true`.

## The page

One square photo, then two lowercase lines: name and price, and below a thin rule the
status (`available`, `sold out`, or `draft` on previews) and `buy →`, which goes
straight to Stripe. The page includes `Product` structured data (price and stock
status) and uses the photo as the social card.
