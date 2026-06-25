import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TextField } from '@/shared/ui/design-system/atoms/TextField';

const TextFieldStory = (args: Omit<Parameters<typeof TextField>[0], 'value' | 'onChangeText'>) => {
  const [value, setValue] = useState('');
  return <TextField {...args} value={value} onChangeText={setValue} />;
};

const meta: Meta<typeof TextField> = {
  title: 'Atoms/TextField',
  component: TextField,
  args: {
    placeholder: 'First name',
  },
  render: TextFieldStory,
};

export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {};
export const HasError: Story = { args: { hasError: true } };
export const Multiline: Story = { args: { placeholder: 'Notes', multiline: true } };
