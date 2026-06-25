import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Switch } from '@/shared/ui/design-system/atoms/Switch';

const SwitchStory = (args: Parameters<typeof Switch>[0]) => {
  const [value, setValue] = useState(args.value);
  return <Switch {...args} value={value} onValueChange={setValue} />;
};

const meta: Meta<typeof Switch> = {
  title: 'Atoms/Switch',
  component: Switch,
  args: {
    value: false,
  },
  render: SwitchStory,
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Off: Story = {};
export const On: Story = { args: { value: true } };
export const Disabled: Story = { args: { disabled: true } };
