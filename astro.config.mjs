// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tellan-consulting.com',
  output: 'static',
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
  integrations: [sitemap()],
});
