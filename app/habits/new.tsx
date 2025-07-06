// CreateHabit.tsx
import CustomHeader from '@/components/CustomHeader';
import TagsInput from '@/components/TagsInput';
import { loadHabits, saveHabits } from '@/db/storage';
import { DayNumber, HabitsState, IHabit } from '@/db/types';
import { scheduleHabitReminders } from '@/utils/notificationService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Divider, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
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

  const { control, handleSubmit, setValue, reset } = useForm<IHabit>({
    defaultValues: {
      id: '',
      title: "",
      description: "",
      tags: [],
      recurrence: {
        type: "daily",
        daysOfWeek: [],
        time: new Date().toISOString().slice(0, 16), // "YYYY-MM-DDTHH:mm"
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
      if (!habitId) return;
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
    }
    loadHabit();
  }, [habitId, reset]);

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
    const newDate = new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    // Store only the time as "HH:mm"
    setValue("recurrence.time", `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader
        title={habitId ? "Editar hábito" : "Nuevo hábito"}
        backRoute="/habits"
        addAction={handleSubmit(onSubmit)}
        materialIcon="check"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" >
        {/* Title */}
        <Controller
          control={control}
          name="title"
          rules={{ required: "El título es obligatorio" }}
          render={({ field, fieldState }) => (
            <>
              <TextInput
                mode="outlined"
                label="Title"
                value={field.value}
                onChangeText={field.onChange}
                error={!!fieldState.error}
                style={styles.input}
              />
              {fieldState.error && (
                <Text style={styles.error}>{fieldState.error.message}</Text>
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
              style={styles.input}
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

        {/* Recurrence */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recurrencia
        </Text>

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
            />
          )}
        />

        {recurrenceType === 'weekly' && (
          <View style={styles.weekDaysContainer}>
            {(['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const).map((day, index) => (
              <Button
                key={day}
                mode={recurrenceDaysOfWeek?.includes(index as DayNumber) ? 'contained' : 'outlined'}
                onPress={() => toggleDay(index as DayNumber)}
                style={styles.dayButton}
              >
                {day}
              </Button>
            ))}
          </View>
        )}

        <Button
          onPress={() => setVisible(true)}
          mode="outlined"
          icon="clock"
          style={styles.timeButton}
        >
          {recurrenceTime
            ? new Date(recurrenceTime).toLocaleTimeString()
            : "Hora"}
        </Button>

        <TimePickerModal
          visible={visible}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          hours={recurrenceTime ? Number(recurrenceTime.split(':')[0]) : 12}
          minutes={recurrenceTime ? Number(recurrenceTime.split(':')[1]) : 0}
        />

        <Divider style={styles.divider} />

        {/* Reminder On Time */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recordatorio a la hora programada
        </Text>
        <Controller
          control={control}
          name="reminderOnTime.enabled"
          render={({ field }) => (
            <Button
              mode={field.value ? "contained" : "outlined"}
              onPress={() => field.onChange(!field.value)}
              style={styles.input}
            >
              {field.value ? "Activado" : "Desactivado"}
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
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="reminderOnTime.snoozeMinutes"
          render={({ field }) => (
            <TextInput
              mode="outlined"
              label="Posponer (minutos)"
              value={field.value?.toString()}
              onChangeText={v => field.onChange(Number(v) || 0)}
              keyboardType="numeric"
              style={styles.input}
            />
          )}
        />

        <Divider style={styles.divider} />

        {/* Reminder Before */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recordatorio antes
        </Text>
        <Controller
          control={control}
          name="reminderBefore.enabled"
          render={({ field }) => (
            <Button
              mode={field.value ? "contained" : "outlined"}
              onPress={() => field.onChange(!field.value)}
              style={styles.input}
            >
              {field.value ? "Activado" : "Desactivado"}
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
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="reminderBefore.message"
          render={({ field }) => (
            <TextInput
              mode="outlined"
              label="Mensaje"
              value={field.value}
              onChangeText={field.onChange}
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="reminderBefore.snoozeMinutes"
          render={({ field }) => (
            <TextInput
              mode="outlined"
              label="Posponer (minutos)"
              value={field.value?.toString()}
              onChangeText={v => field.onChange(Number(v) || 0)}
              keyboardType="numeric"
              style={styles.input}
            />
          )}
        />
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