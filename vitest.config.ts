import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: 'dot',
    include: ['__tests__/**/*.test.ts'],
  },
});
