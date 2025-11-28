import type { StorybookConfig } from '@storybook/react-vite';

import { dirname, join } from 'node:path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
    return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
        getAbsolutePath('@storybook/addon-onboarding'),
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-essentials'),
        getAbsolutePath('@chromatic-com/storybook'),
        getAbsolutePath('@storybook/addon-interactions'),
    ],
    framework: {
        name: getAbsolutePath('@storybook/react-vite'),
        options: {},
    },
    viteFinal: async (config) => {
        // Add polyfills for Node.js modules in the browser
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...config.resolve.alias,
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            buffer: 'buffer',
            util: 'util',
            events: 'events',
            process: 'process/browser',
        };

        config.define = {
            ...config.define,
            'process.env': {},
            global: 'globalThis',
        };

        // Optimize dependencies
        config.optimizeDeps = {
            ...config.optimizeDeps,
            include: [
                ...(config.optimizeDeps?.include || []),
                'buffer',
                'process',
                'crypto-browserify',
                'stream-browserify',
                'util',
                'events',
            ],
            esbuildOptions: {
                ...config.optimizeDeps?.esbuildOptions,
                define: {
                    global: 'globalThis',
                },
            },
        };

        return config;
    },
};
export default config;
