import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/shared/ui/design-system/atoms/Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  args: {
    label: 'Confirm',
    onPress: () => {},
  },
  argTypes: {
    variant: { control: 'select', options: ['filled', 'dark', 'outlined', 'text'] },
    size: { control: 'select', options: ['default', 'small'] },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Filled: Story = { args: { variant: 'filled' } };
export const Dark: Story = { args: { variant: 'dark' } };
export const Outlined: Story = { args: { variant: 'outlined' } };
export const Text: Story = { args: { variant: 'text' } };
export const Disabled: Story = { args: { variant: 'filled', disabled: true } };
export const Small: Story = { args: { variant: 'filled', size: 'small' } };
