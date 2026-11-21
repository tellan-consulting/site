import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stripePaymentLink = z
  .url()
  .refine((u) => u.startsWith('https://buy.stripe.com/'), {
    message: 'Must be a Stripe Payment Link (https://buy.stripe.com/...)',
  });

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      /** One line; used as the meta description and in search results. */
      summary: z.string().min(1).max(160),
      /** Display price in major units (32 = $32.00). Must match the Stripe price. */
      price: z.number().positive(),
      currency: z.string().length(3).toUpperCase().default('USD'),
      image: z.object({
        src: image(),
        alt: z.string().min(1, 'Alt text is required'),
      }),
      paymentLink: stripePaymentLink,
      /** Set to false when sold out (and deactivate the Payment Link in Stripe), then redeploy. */
      available: z.boolean().default(true),
      /** Only one product can be active. Drafts show in dev and Vercel previews, never in production. */
      status: z.enum(['active', 'draft']).default('active'),
    }),
});

export const collections = { products };
