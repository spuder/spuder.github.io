import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://spuder.github.io',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  // Keep old Jekyll URLs working.
  redirects: {
    '/2016/automating-f5-pwoershell/': '/2016/automating-f5-powershell/',
    '/tags/': '/blog/',
    '/categories/': '/blog/',
  },
});
