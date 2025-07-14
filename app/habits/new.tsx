// CreateHabit.tsx

//TODO: corroborar que se cree el habito y que ls validaciones se muestren
import CustomHeader from '@/components/CustomHeader';
import TagsInput from '@/components/TagsInput';
import { loadHabits, saveHabits } from '@/db/storage';
import { DayNumber, HabitsState, IHabit } from '@/db/types';
import { useGlobalStyles } from '@/utils/globalStyles';
import { scheduleHabitReminders } from '@/utils/notificationService';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Divider, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { SafeAreaView } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';

const defaultReminderConfig = {
  enabled: false,
  minutesBefore: 10,
  snoozeMinutes: 0,
  message: '',
};

const CreateHabit = () => {
  const { id: habitId } = useLocalSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const global = useGlobalStyles();

  const { control, handleSubmit, setValue, reset } = useForm<IHabit>({
    defaultValues: {
      id: '',
      title: "",
      description: "",
      tags: [],
      recurrence: {
        type: "daily",
        daysOfWeek: [],
        time: (() => {
          const now = new Date();
          return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        })(),
      },
      reminderOnTime: { ...defaultReminderConfig, enabled: true, message: '' },
      reminderBefore: { ...defaultReminderConfig },
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      completionHistory: [],
      createdAt: '',
      updatedAt: ''
    }
  });

  // Watch form values
  const recurrenceType = useWatch({ control, name: "recurrence.type" });
  const recurrenceDaysOfWeek = useWatch({ control, name: "recurrence.daysOfWeek" });
  const recurrenceTime = useWatch({ control, name: "recurrence.time" });

  // Load habit for editing
  useEffect(() => {
    const loadHabit = async () => {
      console.log(habitId);
      if (habitId) {
      setLoading(true);

      try {
        const habits = await loadHabits();
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          reset(habit);
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el hábito");
      } finally {
        setLoading(false);
      }
    } else {
      reset({
      id: '',
      title: "",
      description: "",
      tags: [],
      recurrence: {
        type: "daily",
        daysOfWeek: [],
        time: (() => {
          const now = new Date();
          return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        })(),
      },
      reminderOnTime: { ...defaultReminderConfig, enabled: true, message: '' },
      reminderBefore: { ...defaultReminderConfig },
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      completionHistory: [],
      createdAt: '',
      updatedAt: ''
    })
    }

  }
    loadHabit();
  }, [habitId, reset]);

  // Limpiar el formulario cada vez que la pantalla se enfoca y no hay habitId
  useFocusEffect(
    React.useCallback(() => {
      if (!habitId) {
        reset({
          id: '',
          title: "",
          description: "",
          tags: [],
          recurrence: {
            type: "daily",
            daysOfWeek: [],
            time: (() => {
              const now = new Date();
              return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            })(),
          },
          reminderOnTime: { ...defaultReminderConfig, enabled: true, message: '' },
          reminderBefore: { ...defaultReminderConfig },
          currentStreak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
          completionHistory: [],
          createdAt: '',
          updatedAt: ''
        });
      }
    }, [habitId, reset])
  );

  // Toggle day selection
  const toggleDay = (dayIndex: DayNumber) => {
    const newDays = recurrenceDaysOfWeek?.includes(dayIndex)
      ? recurrenceDaysOfWeek.filter(d => d !== dayIndex)
      : [...(recurrenceDaysOfWeek || []), dayIndex];
    setValue("recurrence.daysOfWeek", newDays);
  };

  // Time picker handlers
  const onDismiss = useCallback(() => setVisible(false), []);
  const onConfirm = useCallback(({ hours, minutes }: { hours: number; minutes: number }) => {
    setVisible(false);
    // Formato consistente: "HH:mm"
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setValue("recurrence.time", timeString);
  }, [setValue]);

  // Submit handler
  const onSubmit = async (data: IHabit) => {
    try {
      setLoading(true);
      const habits = await loadHabits();
      const now = new Date().toISOString();

      const id = habitId ? habitId as string : uuid.v4() as string;

      const updatedHabit: IHabit = {
        ...data,
        id,
        updatedAt: now,
        createdAt: habitId ? data.createdAt : now
      };

      const updatedHabits: HabitsState = habitId
        ? habits.map(h => h.id === habitId ? updatedHabit : h)
        : [...habits, updatedHabit];

      await saveHabits(updatedHabits);

      await scheduleHabitReminders(updatedHabit);

      router.push('/habits');
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el hábito");
    } finally {
      setLoading(false);
    }
  };

  const handleRecurrenceTimeBtn = () => {
    setVisible(true); 
    console.log(recurrenceTime); 
  }

  if (loading) {
    return (
      <View style={global.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={global.container}>
      <CustomHeader
        title={habitId ? "Editar hábito" : "Nuevo hábito"}
        backRoute="/habits"
        addAction={handleSubmit(onSubmit)}
        materialIcon="check"
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <Controller
          control={control}
          name="title"
          rules={{ required: "El título es obligatorio" }}
          render={({ field, fieldState }) => (
            <>
              <TextInput
                mode="outlined"
                label="Título"
                value={field.value}
                onChangeText={field.onChange}
                error={!!fieldState.error}
                style={global.input}
              />
              {fieldState.error && (
                <Text style={{ color: 'red', marginTop: -12, marginBottom: 8, marginLeft: 4 }}>{fieldState.error.message}</Text>
              )}
            </>
          )}
        />
        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextInput
              mode="outlined"
              label="Descripción"
              value={field.value}
              onChangeText={field.onChange}
              multiline
              numberOfLines={4}
              style={global.input}
            />
          )}
        />
        {/* Tags */}
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagsInput value={field.value} onChange={field.onChange} />
          )}
        />
        <Divider style={global.divider} />
        {/* Recurrence */}
        <Text variant="titleMedium" style={global.sectionTitle}>Recurrencia</Text>
        <Controller
          control={control}
          name="recurrence.type"
          render={({ field }) => (
            <SegmentedButtons
              value={field.value}
              onValueChange={field.onChange}
              buttons={[
                { value: 'daily', label: 'Diario' },
                { value: 'weekly', label: 'Semanal' },
              ]}
              style={{ marginBottom: 8 }}
            />
          )}
        />
        {recurrenceType === 'weekly' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {(['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const).map((day, index) => (
              <Button
                key={day}
                mode={recurrenceDaysOfWeek?.includes(index as DayNumber) ? 'contained' : 'outlined'}
                onPress={() => toggleDay(index as DayNumber)}
                style={global.button}
                buttonColor={recurrenceDaysOfWeek?.includes(index as DayNumber) ? theme.colors.primary : undefined}
                textColor={recurrenceDaysOfWeek?.includes(index as DayNumber) ? theme.colors.onPrimary : theme.colors.onSurface}
              >
                {day}
              </Button>
            ))}
          </View>
        )}
        {/* Hora programada */}
        <Button
          onPress={handleRecurrenceTimeBtn}
          mode="outlined"
          icon="clock"
          style={global.button}
          textColor={theme.colors.onSurface}
        >
          {recurrenceTime
            ? (() => {
                try {
                  const [hours, minutes] = recurrenceTime.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes);
                  return date.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  });
                } catch {
                  return "Seleccionar hora";
                }
              })()
            : "Seleccionar hora"}
        </Button>
        <TimePickerModal
          visible={visible}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          hours={recurrenceTime ? Number(recurrenceTime.split(':')[0]) : 12}
          minutes={recurrenceTime ? Number(recurrenceTime.split(':')[1]) : 0}
        />
        <Divider style={global.divider} />
        {/* Recordatorios (bloque compacto) */}
        <Text variant="titleMedium" style={global.sectionTitle}>Recordatorios</Text>
        <View style={{ gap: 4 }}>
          {/* Recordatorio a la hora programada */}
          <Controller
            control={control}
            name="reminderOnTime.enabled"
            render={({ field }) => (
              <Button
                mode={field.value ? "contained" : "outlined"}
                onPress={() => field.onChange(!field.value)}
                style={global.button}
                buttonColor={field.value ? theme.colors.primary : undefined}
                textColor={field.value ? theme.colors.onPrimary : theme.colors.onSurface}
              >
                {field.value ? "Recordatorio activado a la hora" : "Recordatorio desactivado a la hora"}
              </Button>
            )}
          />
          <Controller
            control={control}
            name="reminderOnTime.message"
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Mensaje de recordatorio"
                value={field.value}
                onChangeText={field.onChange}
                style={global.input}
              />
            )}
          />
          {/* Recordatorio antes */}
          <Controller
            control={control}
            name="reminderBefore.enabled"
            render={({ field }) => (
              <Button
                mode={field.value ? "contained" : "outlined"}
                onPress={() => field.onChange(!field.value)}
                style={global.button}
                buttonColor={field.value ? theme.colors.primary : undefined}
                textColor={field.value ? theme.colors.onPrimary : theme.colors.onSurface}
              >
                {field.value ? "Recordatorio activado antes" : "Recordatorio desactivado antes"}
              </Button>
            )}
          />
          <Controller
            control={control}
            name="reminderBefore.minutesBefore"
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Minutos antes"
                value={field.value?.toString()}
                onChangeText={v => field.onChange(Number(v) || 0)}
                keyboardType="numeric"
                style={global.input}
              />
            )}
          />
          <Controller
            control={control}
            name="reminderBefore.message"
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Mensaje antes"
                value={field.value}
                onChangeText={field.onChange}
                style={global.input}
              />
            )}
          />
        </View>
        <Button
          onPress={() => reset()}
          mode="outlined"
          textColor={theme.colors.onSurface}
          style={global.button}
        >
          Limpiar campos
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionTitle: {
    marginVertical: 16,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  dayButton: {
    minWidth: 40,
  },
  customRecurrence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  intervalInput: {
    width: 60,
  },
  unitInput: {
    flex: 1,
  },
  timeButton: {
    marginVertical: 16,
  },
  divider: {
    marginVertical: 24,
  }
});

export default CreateHabit;