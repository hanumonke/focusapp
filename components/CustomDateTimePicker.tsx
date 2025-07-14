import { useGlobalStyles } from '@/utils/globalStyles';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';

type Props = {
  value: string | null; // ISO string for the combined date and time
  onChange: (val: string | undefined) => void; // Function to update the ISO string
  label?: string; // Label for the date input
  limitDate?: string | undefined | null
};

const CustomDateTimePicker: React.FC<Props> = ({ value, onChange, label = "Seleccionar fecha", limitDate }) => {
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const theme = useTheme();
  const global = useGlobalStyles();

  // Derive Date object from value for DatePickerInput and TimePickerModal
  // If value is undefined, default to current date/time to avoid errors in pickers
  const currentSelectedDate: Date = value ? new Date(value) : new Date();

  // Calcular minDate (hoy, sin horas)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Handle DatePickerInput change
  const onDateChange = useCallback(
    (pickedDate: Date | undefined) => {
      if (pickedDate) {
        // We need to preserve the time if it was already set, otherwise default to current time or midnight
        const year = pickedDate.getFullYear();
        const month = pickedDate.getMonth();
        const date = pickedDate.getDate();

        // If a full date-time value already exists, use its time components
        // Otherwise, default to the time from `currentSelectedDate` (which might be the current time)
        const hours = value ? currentSelectedDate.getHours() : new Date().getHours();
        const minutes = value ? currentSelectedDate.getMinutes() : new Date().getMinutes();

        const combined = new Date(year, month, date, hours, minutes, 0, 0);
        onChange(combined.toISOString());
      } else {
        // If date picker is cleared, clear the whole value
        onChange(undefined);
      }
    },
    [value, onChange, currentSelectedDate] // Add currentSelectedDate to dependencies
  );

  // Handle TimePickerModal dismissal
  const onDismissTimePicker = useCallback(() => {
    setIsTimePickerVisible(false);
  }, []);

  // Handle TimePickerModal confirmation
  const onConfirmTimePicker = useCallback(
    ({ hours, minutes }: { hours: number; minutes: number }) => {
      setIsTimePickerVisible(false);

      // We need to use the date part from the currently selected date (or today's date if no date picked yet)
      const dateToCombineWithTime = value ? new Date(value) : new Date();

      const combinedDateTime = new Date(
        dateToCombineWithTime.getFullYear(),
        dateToCombineWithTime.getMonth(),
        dateToCombineWithTime.getDate(),
        hours,
        minutes,
        0, 0
      );
      onChange(combinedDateTime.toISOString());
    },
    [value, onChange]
  );

  const handleOpenTimePicker = () => {
    setIsTimePickerVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <DatePickerInput
          locale="es"
          label={label}
          value={value ? new Date(value) : undefined}
          onChange={onDateChange}
          inputMode="start"
          mode="outlined"
          validRange={{ startDate: today }}
          style={[global.input, { flex: 1 }]}
        />
        <Button 
          mode="contained" 
          onPress={handleOpenTimePicker} 
          icon="clock-edit-outline" 
          style={{alignSelf: 'center'}}
          buttonColor={theme.colors.secondary}
          textColor={theme.colors.onSecondary}
        >
          {value
            ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            : "Hora"}
        </Button>
      </View>
      {/* TimePickerModal */}
      <TimePickerModal
        visible={isTimePickerVisible}
        onDismiss={onDismissTimePicker}
        onConfirm={onConfirmTimePicker}
        hours={currentSelectedDate.getHours()}
        minutes={currentSelectedDate.getMinutes()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
  },
  inputRow: {
    flexDirection: 'row', 
    gap: 10, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  dateInput: {
    flex: 1,
  },
});

export default CustomDateTimePicker;