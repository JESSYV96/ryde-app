import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TextField } from '@/shared/ui/design-system/atoms/TextField';
import { FormField } from '@/shared/ui/design-system/molecules/FormField';

const FormFieldStory = (args: Parameters<typeof FormField>[0]) => {
  const [value, setValue] = useState('');
  return (
    <FormField {...args}>
      <TextField value={value} onChangeText={setValue} placeholder="jean.dupont@example.com" />
    </FormField>
  );
};

const meta: Meta<typeof FormField> = {
  title: 'Molecules/FormField',
  component: FormField,
  args: {
    label: 'Email',
  },
  render: FormFieldStory,
};

export default meta;

type Story = StoryObj<typeof FormField>;

export const Default: Story = {};
export const WithError: Story = { args: { errorMessage: 'Invalid email address' } };
