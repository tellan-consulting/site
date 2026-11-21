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

/**
 * The one product /merch sells, or undefined when nothing is live yet. Then /merch isn't
 * built and the footer doesn't link to it.
 *
 * Only one product can be active. In dev and previews, a draft stands in when no product
 * is active. Production builds fail if the product still uses a Stripe test-mode link.
 */
export async function getProduct(): Promise<Product | undefined> {
  const products = await getCollection('products');
  const active = products.filter((p) => p.data.status === 'active');

  if (active.length > 1) {
    throw new Error(
      `[merch] Only one product can be active at a time; found: ${active.map((p) => p.id).join(', ')}.\n` +
        'Set the others to `status: draft`.',
    );
  }

  const drafts = products.filter((p) => p.data.status === 'draft').sort((a, b) => a.id.localeCompare(b.id));
  const product = active[0] ?? (showDrafts ? drafts[0] : undefined);

  if (product && !allowTestLinks) {
    const offenders = product.data.variants.filter((v) => isTestLink(v.paymentLink)).map((v) => v.id);
    if (offenders.length) {
      throw new Error(
        `[merch] Stripe test-mode Payment Links in a production build (${product.id}): ${offenders.join(', ')}.\n` +
          'Replace them with live links, or set the product back to `status: draft`.',
      );
    }
  }

  return product;
}

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
