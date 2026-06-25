import type { Meta, StoryObj } from '@storybook/react-vite';

import { FloatingActionButton } from '@/shared/ui/design-system/atoms/FloatingActionButton';

const meta: Meta<typeof FloatingActionButton> = {
  title: 'Atoms/FloatingActionButton',
  component: FloatingActionButton,
  args: {
    onPress: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof FloatingActionButton>;

export const Default: Story = {};
