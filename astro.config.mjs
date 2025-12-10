import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: process.env.SITE || 'https://example.com',
  integrations: [
    tailwind({ applyBaseStyles: true }),
    sitemap(),
  ],
  output: 'static',
  alias: {
    '@': './src',
  },
});
