import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

type Props = {
  value: string | undefined;
  onChange: (val: string) => void;
  label?: string;
};

const CustomDateTimePicker: React.FC<Props> = ({ value, onChange, label = "Seleccionar fecha y hora" }) => {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const handlePress = () => {
    setMode('date');
    setShow(true);
  };

  const handleChange = (_: any, selectedDate?: Date) => {
    if (mode === 'date' && selectedDate) {
      setTempDate(selectedDate);
      setMode('time');
      setShow(true);
    } else if (mode === 'time' && selectedDate && tempDate) {
      const combined = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate(),
        selectedDate.getHours(),
        selectedDate.getMinutes()
      );
      onChange(combined.toISOString());
      setShow(false);
      setMode('date');
      setTempDate(null);
    } else {
      setShow(false);
      setMode('date');
      setTempDate(null);
    }
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={handlePress}>
        {label}
      </Button>
      {value ? (
        <Text style={styles.selectedText}>
          {new Date(value).toLocaleDateString()} {new Date(value).toLocaleTimeString()}
        </Text>
      ) : null}
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode={mode}
          is24Hour={true}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  selectedText: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CustomDateTimePicker;