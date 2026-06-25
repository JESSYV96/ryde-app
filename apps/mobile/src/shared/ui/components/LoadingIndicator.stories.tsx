import type { Meta, StoryObj } from '@storybook/react-vite';

import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';

const meta: Meta<typeof LoadingIndicator> = {
  title: 'Components/LoadingIndicator',
  component: LoadingIndicator,
};

export default meta;

type Story = StoryObj<typeof LoadingIndicator>;

export const Default: Story = {};
