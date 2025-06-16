
// Components
import CustomHeader from '@/components/CustomHeader';
import TagsInput from '@/components/TagsInput';
import { IHabit, HabitRecurrenceType} from '@/db/types';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { Dropdown } from 'react-native-paper-dropdown';
// logic
import { loadAppState, saveAppState } from '@/db/storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import uuid from 'react-native-uuid';


//TODO make reminders config
const CreateHabit = () => {

  const [recurrenceTime, setRecurrenceTime] = useState(new Date());
  const [recurrenceUnit, setRecurrenceUnit] = useState<string>('day');
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>([]);
  const [recurrenceInterval, setRecurrenceInterval] = useState(0);

  const [visible, setVisible] = useState(false);

  const onDismiss = useCallback(() => {
    setVisible(false)
  }, [setVisible]);

  const onConfirm = React.useCallback(
    //@ts-ignore
    ({ hours, minutes }) => {
      setVisible(false);

      recurrenceTime.setSeconds(0, 0);
      recurrenceTime.setHours(hours);
      recurrenceTime.setMinutes(minutes)
    },
    [setVisible]
  );

  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      tags: [] as string[],
      recurrenceType: "daily" as HabitRecurrenceType,
    },
  });

  const toggleDay = (index: number) => {
    setRecurrenceDaysOfWeek(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)  // Remove if already selected
        : [...prev, index]               // Add if not selected
    );
  };


  const onSubmit = async (data: {
    title: string,
    description: string,
    tags: string[],
    recurrenceType: HabitRecurrenceType,

  }) => {

    console.log('Guardando habito')

    try {

      const newHabit: IHabit = {
        id: uuid.v4() as string,
        title: data.title ?? "",
        description: data.description ?? "",
        tags: data.tags ?? [],
        recurrence: {
          type: data.recurrenceType,
          daysOfWeek: recurrenceDaysOfWeek.sort(),
          interval: recurrenceInterval,
          unit: recurrenceUnit as 'day' | 'hour',
          time: recurrenceTime
        },
        reminders: [], 
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        completionHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log(newHabit);

      const appState = await loadAppState();
      const updatedState = {
        ...appState,
        habits: [...appState.habits, newHabit]
      };
      await saveAppState(updatedState);
      router.push('/habits');


    } catch (error) {
      console.error(error);
      alert("Error al guardar el habito");
    }

  };



  return (
    <>
      <CustomHeader title="Nuevo habito"  backRoute='/habits'/>
      <View style={styles.container}>
        {/* TITULO */}
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              mode='outlined'
              placeholder="Nombre del habito"
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
          name="title"
        />
        {errors.title && <Text style={styles.error}>Este campo es obligatorio</Text>}

        {/* DESCRIPCION */}
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              mode='outlined'
              placeholder="Descripcion"
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              style={{ paddingVertical: 10 }}
            />
          )}
          name="description"
        />
        {errors.description && <Text style={styles.error}>Este campo es obligatorio</Text>}

        {/* TAGS */}
        <Controller
          control={control}
          name="tags"
          render={({ field: { value, onChange } }) => (
            <TagsInput value={value} onChange={onChange} label="Etiquetas" />
          )}
        />

        {/* Recurrence */}

        <Controller
          control={control}
          name="recurrenceType"
          render={({ field: { value, onChange } }) => (
            <View>
              <Text variant='titleMedium'>Recurrencia</Text>
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={[
                  {
                    value: 'daily',
                    label: 'Diario',
                  },
                  {
                    value: 'weekly',
                    label: 'Semanal',
                  },
                  {
                    value: 'custom',
                    label: 'Otro',
                  },

                ]}
              />

              {/* IF DAILY RENDER THIS */}
              {value == 'daily' &&
                <View style={{ paddingVertical: 10 }}>
                  <Button onPress={() => setVisible(true)} mode='outlined' icon='clock-edit'>{recurrenceTime.toLocaleTimeString('en-US', { timeStyle: "short" })}</Button>

                </View>
              }

              {/* IF WEEKLY RENDER THIS */}
              {value == 'weekly' &&
                <View>
                  <View >
                    <FlatList
                      contentContainerStyle={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 10, gap: 2 }}
                      data={[
                        { label: 'Dom', dayNumber: 0 },
                        { label: 'Lun', dayNumber: 1 },
                        { label: 'Mar', dayNumber: 2 },
                        { label: 'Mie', dayNumber: 3 },
                        { label: 'Jue', dayNumber: 4 },
                        { label: 'Vie', dayNumber: 5 },
                        { label: 'Sab', dayNumber: 6 },
                      ]}
                      renderItem={({ item }) =>
                        <Button
                          mode={recurrenceDaysOfWeek.includes(item.dayNumber) ? 'contained' : 'outlined'}
                          onPress={() => toggleDay(item.dayNumber)}
                          compact

                          contentStyle={styles.weekButton}
                        >
                          {item.label}

                        </Button>
                      }
                    />
                  </View>
                  <Button onPress={() => setVisible(true)} mode='outlined' icon='clock-edit'>{recurrenceTime.toLocaleTimeString('en-US', { timeStyle: "short" })}</Button>

                </View>
              }

              {/* IF CUSTOM(INTERVAL) RENDER THIS */}
              {value == 'custom' &&
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', margin: 10, alignItems: 'center' }}>
                    <Text>Repetir cada</Text>
                    <TextInput mode='outlined' inputMode='numeric' />
                    <Dropdown
                      mode='outlined'
                      options={[{ label: 'dias', value: 'day' }, { label: 'horas', value: 'hour' }]}
                      value={recurrenceUnit}
                      onSelect={(selectedValue?: string) => setRecurrenceUnit(selectedValue ?? '')}
                    />

                  </View>
                  <Button onPress={() => setVisible(true)} mode='outlined' icon='clock-edit'>{recurrenceTime.toLocaleTimeString('en-US', { timeStyle: "short" })}</Button>

                </>
              }

              <TimePickerModal
                visible={visible}
                onDismiss={onDismiss}
                onConfirm={onConfirm}
                hours={12}
                minutes={14}
              />
            </View>
          )}
        />


        {/* Reminders  */}



        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        >
          Guardar
        </Button>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    marginTop: 16,
  },
  weekButton: {
    width: 50,
    height: 40,
    alignItems: 'center',
    fontSize: 10

  },
});

export default CreateHabit