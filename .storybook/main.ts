import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(viteConfig) {
    viteConfig.resolve = {
      ...viteConfig.resolve,
      tsconfigPaths: true,
      alias: {
        ...viteConfig.resolve?.alias,
        'react-native': 'react-native-web',
      },
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        ...(viteConfig.resolve?.extensions ?? ['.tsx', '.ts', '.jsx', '.js']),
      ],
    };
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      include: [...(viteConfig.optimizeDeps?.include ?? []), 'react', 'react-dom', 'react/jsx-dev-runtime'],
    };
    return viteConfig;
  },
};

export default config;
