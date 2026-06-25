import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SliderField } from '@/shared/ui/design-system/atoms/SliderField';

const SliderFieldStory = (args: Parameters<typeof SliderField>[0]) => {
  const [value, setValue] = useState(args.value);
  return <SliderField {...args} value={value} onChangeValue={setValue} />;
};

const meta: Meta<typeof SliderField> = {
  title: 'Atoms/SliderField',
  component: SliderField,
  args: {
    value: 50,
    step: 5,
  },
  render: SliderFieldStory,
};

export default meta;

type Story = StoryObj<typeof SliderField>;

export const Default: Story = {};
export const WithPercentageLabel: Story = {
  args: { valueLabel: (value) => `${Math.round(value)}%` },
};
