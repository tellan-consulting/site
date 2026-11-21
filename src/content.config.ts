import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes');
const hexColor = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Use a hex color like #1f2a44');

// Every variant (usually a color) gets its own Stripe Payment Link, so each
// color can be tracked and switched off on its own in Stripe.
const stripePaymentLink = z
  .url()
  .refine((u) => u.startsWith('https://buy.stripe.com/'), {
    message: 'Must be a Stripe Payment Link (https://buy.stripe.com/...)',
  });

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: ({ image }) => {
    const photo = z.object({
      src: image(),
      alt: z.string().min(1, 'Alt text is required'),
    });

    return z
      .object({
        name: z.string().min(1),
        /** One line; used on the listing card and as the meta description. */
        summary: z.string().min(1).max(160),
        /** Display price in major units (32 = $32.00). Must match the Stripe price. */
        price: z.number().positive(),
        currency: z.string().length(3).toUpperCase().default('USD'),
        images: z.array(photo).min(1),
        variants: z
          .array(
            z.object({
              id: slug,
              name: z.string().min(1),
              swatch: hexColor.optional(),
              /** Shown first when this variant is selected. */
              image: photo.optional(),
              paymentLink: stripePaymentLink,
              /** Set to false when this variant is out of stock, then redeploy. */
              available: z.boolean().default(true),
            }),
          )
          .min(1),
        details: z.array(z.string()).default([]),
        sizing: z.string().optional(),
        /** Drafts show up in `astro dev` only. */
        status: z.enum(['active', 'draft']).default('active'),
        /** Lower numbers are listed first. */
        sortOrder: z.number().int().default(0),
      })
      .superRefine((product, ctx) => {
        const seen = new Set<string>();
        product.variants.forEach((v, i) => {
          if (seen.has(v.id)) {
            ctx.addIssue({
              code: 'custom',
              path: ['variants', i, 'id'],
              message: `Duplicate variant id "${v.id}"`,
            });
          }
          seen.add(v.id);
        });
      });
  },
});

export const collections = { products };
