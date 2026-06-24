// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tyermans.com',
  integrations: [react(), sitemap()],
  image: {
    quality: 80,
  },
  build: {
    inlineStylesheets: 'always',
  },
});
