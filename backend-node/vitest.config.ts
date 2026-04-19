import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/domain/entities/**', 'src/application/use-cases/**'],
            thresholds: {
                statements: 80,
                branches: 75,
                functions: 80,
                lines: 80,
            },
            reporter: ['text', 'lcov'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
