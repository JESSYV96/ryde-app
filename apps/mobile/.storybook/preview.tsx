import type { Preview } from '@storybook/react-vite';
import { View } from 'react-native';

import { Colors, Spacing } from '@/shared/ui/theme';

import './fonts.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <View style={{ backgroundColor: Colors.light.background, padding: Spacing.four, minHeight: '100%' }}>
        <Story />
      </View>
    ),
  ],
};

export default preview;
