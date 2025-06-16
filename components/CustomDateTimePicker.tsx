import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates'; // Import DatePickerInput

type Props = {
  value: string | undefined; // ISO string for the combined date and time
  onChange: (val: string | undefined) => void; // Function to update the ISO string
  label?: string; // Label for the date input
};

const CustomDateTimePicker: React.FC<Props> = ({ value, onChange, label = "Seleccionar fecha" }) => {
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  // Derive Date object from value for DatePickerInput and TimePickerModal
  // If value is undefined, default to current date/time to avoid errors in pickers
  const currentSelectedDate: Date = value ? new Date(value) : new Date();

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

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
      
        <DatePickerInput
          mode='outlined'
          locale="es" // Set locale for language of picker
          value={value ? new Date(value) : undefined} // Pass Date object or undefined
          onChange={onDateChange}
          inputMode="start" // Opens calendar on focus
        />

        <Button mode="contained" onPress={handleOpenTimePicker} icon="clock-edit-outline" style={{alignSelf: 'center'}}>
          {value ? currentSelectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Hora"}
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
});

export default CustomDateTimePicker;