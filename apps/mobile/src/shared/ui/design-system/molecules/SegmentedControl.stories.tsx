import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SegmentedControl } from '@/shared/ui/design-system/molecules/SegmentedControl';

const options = [
  { value: 'inProgress', label: 'In progress' },
  { value: 'past', label: 'Past' },
];

const SegmentedControlStory = (args: Parameters<typeof SegmentedControl<string>>[0]) => {
  const [value, setValue] = useState(args.value);
  return <SegmentedControl {...args} value={value} onChange={setValue} />;
};

const meta: Meta<typeof SegmentedControl<string>> = {
  title: 'Molecules/SegmentedControl',
  component: SegmentedControl,
  args: {
    options,
    value: 'inProgress',
  },
  render: SegmentedControlStory,
};

export default meta;

type Story = StoryObj<typeof SegmentedControl<string>>;

export const Default: Story = {};
