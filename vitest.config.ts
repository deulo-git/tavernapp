import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts so the Cloudflare and PWA plugins don't load during tests.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
