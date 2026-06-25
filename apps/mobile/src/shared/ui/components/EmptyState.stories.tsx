import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmptyState } from '@/shared/ui/components/EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    message: 'No rentals in progress.',
  },
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};
