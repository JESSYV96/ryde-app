import RNDateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { formatDisplayDateTime } from '@/shared/utils/date';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';

interface DateFieldProps {
  value: Date | null;
  onChangeValue: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  testID?: string;
}

type AndroidPickerStage = 'date' | 'time';

export const DateField = ({
  value,
  onChangeValue,
  placeholder,
  minimumDate,
  maximumDate,
  testID,
}: DateFieldProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [androidStage, setAndroidStage] = useState<AndroidPickerStage>('date');
  const [androidPendingDate, setAndroidPendingDate] = useState<Date | null>(null);

  const closePicker = () => {
    setIsPickerOpen(false);
    setAndroidStage('date');
    setAndroidPendingDate(null);
  };

  if (!isPickerOpen) {
    return (
      <Pressable style={styles.field} onPress={() => setIsPickerOpen(true)} testID={testID}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? formatDisplayDateTime(value.toISOString()) : placeholder}
        </Text>
      </Pressable>
    );
  }

  // The native pickers require a concrete starting Date — an unset field
  // opens on "now" without that ever being treated as the user's selection.
  const pickerInitialValue = value ?? new Date();

  // Android has no native widget combining date+time (OS-level limitation,
  // not specific to this library), so the date dialog chains into the time
  // dialog before the field's value is committed.
  if (Platform.OS === 'android' && androidStage === 'date') {
    return (
      <RNDateTimePicker
        value={pickerInitialValue}
        onValueChange={(_event, date) => {
          setAndroidPendingDate(date);
          setAndroidStage('time');
        }}
        onDismiss={closePicker}
        mode="date"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        display="spinner"
      />
    );
  }

  if (Platform.OS === 'android' && androidStage === 'time') {
    const baseDate = androidPendingDate ?? pickerInitialValue;
    return (
      <RNDateTimePicker
        value={baseDate}
        onValueChange={(_event, time) => {
          const combined = dayjs(baseDate).hour(time.getHours()).minute(time.getMinutes()).second(0).millisecond(0);
          onChangeValue(combined.toDate());
          closePicker();
        }}
        onDismiss={closePicker}
        mode="time"
        display="spinner"
      />
    );
  }

  return (
    <RNDateTimePicker
      value={pickerInitialValue}
      onValueChange={(_event, date) => {
        onChangeValue(date);
        closePicker();
      }}
      onDismiss={closePicker}
      mode="datetime"
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      display="spinner"
    />
  );
};

const styles = StyleSheet.create({
  field: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    backgroundColor: Colors.light.backgroundElement,
  },
  text: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.body,
    color: Colors.light.text,
  },
  placeholder: {
    color: Colors.light.textSecondary,
  },
});
