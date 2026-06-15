/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves from /conversor-moeda-React/ — must match the repo name
  base: '/conversor-moeda-React/',
  resolve: {
    // Prefer .tsx/.ts over .js so legacy files don't shadow new ones
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Only pick up TypeScript test files — ignores legacy .js files from CRA
    include: ['src/**/*.test.{ts,tsx}'],
    css: {
      modules: {
        // Return class names as-is so className assertions work
        classNameStrategy: 'non-scoped',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
    },
  },
})
