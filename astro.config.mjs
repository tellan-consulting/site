// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://tellan-consulting.com',
  // Pages are prerendered; /api/contact (prerender = false) runs as a Vercel Function.
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'ignore',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  // Self-hosted at build time: no request to Google Fonts at runtime.
  fonts: [
    {
      // Titles
      provider: fontProviders.google(),
      name: 'Google Sans',
      cssVariable: '--font-google-sans',
      weights: [500],
      styles: ['normal'],
      subsets: ['latin'],
    },
    {
      // Text
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
  image: {
    // Sharp is the default service; listed explicitly for clarity.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  env: {
    schema: {
      // Service account for the Gmail API. Optional so `astro dev` runs without them.
      GOOGLE_SA_CLIENT_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_SA_PRIVATE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GMAIL_SENDER: envField.string({
        context: 'server',
        access: 'secret',
        default: 'website@tellan-consulting.com',
      }),
      CONTACT_TO: envField.string({
        context: 'server',
        access: 'secret',
        default: 'hello@tellan-consulting.com',
      }),
      // Merch (see docs/merch.md). Vercel sets VERCEL_ENV on every build.
      VERCEL_ENV: envField.enum({
        context: 'server',
        access: 'public',
        values: ['production', 'preview', 'development'],
        optional: true,
      }),
      MERCH_SHOW_DRAFTS: envField.boolean({ context: 'server', access: 'public', default: false }),
      MERCH_ALLOW_TEST_LINKS: envField.boolean({ context: 'server', access: 'public', default: false }),
    },
  },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/contact/thanks') && !page.includes('/merch/thanks') }),
  ],
});
