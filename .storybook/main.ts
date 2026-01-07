import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    "@storybook/addon-onboarding"
  ],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    // Ensure Vite path aliases work in Storybook
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': '/src',
          '@/lib': '/src/lib',
        },
      },
    };
  },
};

export default config;