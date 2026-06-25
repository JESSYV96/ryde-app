import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusBadge } from '@/shared/ui/design-system/atoms/StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Atoms/StatusBadge',
  component: StatusBadge,
  argTypes: {
    tone: { control: 'select', options: ['neutral', 'positive', 'pending'] },
  },
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Positive: Story = { args: { label: 'In progress', tone: 'positive' } };
export const Neutral: Story = { args: { label: 'Returned', tone: 'neutral' } };
export const Pending: Story = { args: { label: 'Pending acceptance', tone: 'pending' } };
