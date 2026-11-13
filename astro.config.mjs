// @ts-check
import { defineConfig, envField } from 'astro/config';
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
    },
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/contact/thanks') })],
});
