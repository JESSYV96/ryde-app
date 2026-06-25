import { Switch as RNSwitch } from 'react-native';

import { Colors } from '@/shared/ui/theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Switch = ({ value, onValueChange, disabled }: SwitchProps) => {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: Colors.light.backgroundSelected, true: Colors.light.primarySoft }}
      thumbColor={value ? Colors.light.primary : Colors.light.background}
      ios_backgroundColor={Colors.light.backgroundSelected}
    />
  );
};
