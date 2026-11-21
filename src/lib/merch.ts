import { getCollection, type CollectionEntry } from 'astro:content';
import { MERCH_ALLOW_TEST_LINKS, MERCH_SHOW_DRAFTS, VERCEL_ENV } from 'astro:env/server';

export type Product = CollectionEntry<'products'>;
export type Variant = Product['data']['variants'][number];
export type Photo = Product['data']['images'][number];

/** Local dev and Vercel preview deploys show drafts and accept Stripe test-mode links. */
const isPreview = import.meta.env.DEV || VERCEL_ENV === 'preview';
const showDrafts = isPreview || MERCH_SHOW_DRAFTS;
const allowTestLinks = isPreview || MERCH_ALLOW_TEST_LINKS;

const isTestLink = (url: string) => new URL(url).pathname.startsWith('/test_');

let cached: Promise<Product[]> | undefined;

/**
 * Products to show, sorted for display.
 *
 * Production builds fail if a published product still points at a Stripe test-mode
 * Payment Link, so a test link can't go live by accident.
 */
export function getProducts(): Promise<Product[]> {
  cached ??= load();
  return cached;
}

async function load(): Promise<Product[]> {
  const products = await getCollection(
    'products',
    ({ data }) => showDrafts || data.status === 'active',
  );

  if (!allowTestLinks) {
    const offenders = products.flatMap((p) =>
      p.data.variants.filter((v) => isTestLink(v.paymentLink)).map((v) => `${p.id} → ${v.id}`),
    );
    if (offenders.length) {
      throw new Error(
        `[merch] Stripe test-mode Payment Links in a production build:\n  ${offenders.join('\n  ')}\n` +
          'Replace them with live links, or set the product back to `status: draft`.',
      );
    }
  }

  return products.sort(
    (a, b) => a.data.sortOrder - b.data.sortOrder || a.data.name.localeCompare(b.data.name),
  );
}

/** True when /merch has something to show; the header only links to it then. */
export const hasProducts = async () => (await getProducts()).length > 0;

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export const isSoldOut = (product: Product) => !product.data.variants.some((v) => v.available);

/** First in-stock variant, or the first variant if everything is sold out. */
export const defaultVariant = (product: Product): Variant =>
  product.data.variants.find((v) => v.available) ?? product.data.variants[0];

export const primaryPhoto = (product: Product): Photo =>
  defaultVariant(product).image ?? product.data.images[0];

/** Product photos followed by any variant-specific photos, without duplicates. */
export function galleryPhotos(product: Product): Photo[] {
  const seen = new Set<string>();
  const photos: Photo[] = [];
  for (const photo of [
    ...product.data.images,
    ...product.data.variants.flatMap((v) => (v.image ? [v.image] : [])),
  ]) {
    if (!seen.has(photo.src.src)) {
      seen.add(photo.src.src);
      photos.push(photo);
    }
  }
  return photos;
}

export const productPath = (product: Product) => `/merch/${product.id}`;
