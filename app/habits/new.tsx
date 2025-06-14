
import CustomHeader from '@/components/CustomHeader';
import { TimePickerModal } from 'react-native-paper-dates';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import TagsInput from '@/components/TagsInput';
import { loadAppState, saveAppState } from '@/db/store';
import { HabitRecurrenceType, IHabit, IHabitNotificationSettings, IHabitRecurrence, } from '@/db/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, SegmentedButtons } from 'react-native-paper';

import uuid from 'react-native-uuid';
import { FlatList } from 'react-native-gesture-handler';



const CreateHabit = () => {

  const [recurrenceTime, setRecurrenceTime] = useState(new Date());
  const [recurrenceUnit, setRecurrenceUnit] = useState<'day' | 'hour'>('day');
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<string[]>([]);
  const [recurrenceInterval, setRecurrenceInterval] = useState(0);

  const [visible, setVisible] = useState(false);

  const onDismiss = useCallback(() => {
    setVisible(false)
  }, [setVisible]);

  const onConfirm = React.useCallback(
    //@ts-ignore
    ({ hours, minutes }) => {
      setVisible(false);
      console.log({ hours, minutes });
      recurrenceTime.setSeconds(0, 0);
      recurrenceTime.setHours(hours);
      recurrenceTime.setMinutes(minutes)

      console.log(recurrenceTime);

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
      recurrenceType: '' as HabitRecurrenceType,
      notificationSettings: {} as IHabitNotificationSettings,
    },
  });

  const toggleDay = (index: string) => {
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
    notificationSettings: IHabitNotificationSettings,
  }) => {




    const newHabit: IHabit = {
      id: uuid.v4() as string,
      title: data.title ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      recurrence: {
        type: data.recurrenceType,
        daysOfWeek: recurrenceDaysOfWeek.map(day => parseInt(day)).toSorted(),
        interval: recurrenceInterval,
        unit: recurrenceUnit,
        time: recurrenceTime
      },
      notificationSettings: {},
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      completionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(newHabit); 

    // try {
    //   const appState = await loadAppState();
    //   const updatedState = {
    //     ...appState,
    //     habits: [...(appState.habits ?? []), newHabit],
    //   };
    //   await saveAppState(updatedState);
    //   router.push('/habits');
    // } catch (error) {
    //   console.error(error);
    //   alert("Error al guardar el habito");
    // }
  };



  return (
    <>
      <CustomHeader title="Nuevo habito" />
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
                <View style={{paddingVertical: 10}}>
                  <Button onPress={() => setVisible(true)} mode='outlined' icon='clock-edit'>{recurrenceTime.toLocaleTimeString('en-US', { timeStyle: "short" })}</Button>

                </View>
              }

              {/* IF WEEKLY RENDER THIS */}
              {value == 'weekly' &&
                <View>
                  <View >
                    <FlatList
                      contentContainerStyle={{flexDirection: 'row', justifyContent: 'space-evenly',paddingVertical: 10, gap: 2}}
                      data={['Dom', 'Lun', 'Mar', "Mie", 'Jue', 'Vie', 'Sab']}
                      renderItem={({ item }) =>
                        <Button 
                           mode={recurrenceDaysOfWeek.includes(item) ? 'contained' : 'outlined'}
                           onPress={() => toggleDay(item)}
                          compact
                           
                           contentStyle={styles.weekButton}
                        >
                          {item}
                          
                        </Button>
                      }
                    />
                  </View>
                  <Button onPress={() => setVisible(true)} mode='outlined' icon='clock-edit'>{recurrenceTime.toLocaleTimeString('en-US', { timeStyle: "short" })}</Button>

                </View>
              }

              {/* IF CUSTOM RENDER THIS */}
              {value == 'custom' &&
                <View>
                  <Text>Intervalo</Text>
                  <Button>{recurrenceTime.toLocaleTimeString()}</Button>
                </View>
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
          icon="plus"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        >
          Agregar
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