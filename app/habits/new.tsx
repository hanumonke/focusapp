// CreateHabit.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Divider, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { Controller, useForm, useWatch } from 'react-hook-form';
import uuid from 'react-native-uuid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { loadAppState, saveAppState } from '@/db/storage';
import { IHabit } from '@/db/types';
import CustomHeader from '@/components/CustomHeader';
import TagsInput from '@/components/TagsInput';
import { scheduleHabitReminders, scheduleReminders } from '@/utils/notificationService';

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
        interval: 0,
        unit: 'day',
        time: new Date().toISOString()
      },
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
        const appState = await loadAppState();
        const habit = appState.habits.find(h => h.id === habitId);
        if (habit) {
      
          reset(habit);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load habit");
      } finally {
        setLoading(false);
      }
    }
    loadHabit();
  }, [habitId]);

  // Toggle day selection
  const toggleDay = (dayIndex: number) => {
    const newDays = recurrenceDaysOfWeek?.includes(dayIndex)
      ? recurrenceDaysOfWeek.filter(d => d !== dayIndex)
      : [...(recurrenceDaysOfWeek || []), dayIndex];
    setValue("recurrence.daysOfWeek", newDays);
  };

  // Time picker handlers
  const onDismiss = useCallback(() => setVisible(false), []);
  const onConfirm = useCallback(({ hours, minutes }: { hours: number; minutes: number }) => {
    setVisible(false);
    const newDate = new Date(recurrenceTime || new Date());
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setValue("recurrence.time", newDate.toISOString());
  }, [recurrenceTime]);

  // Submit handler
  const onSubmit = async (data: IHabit) => {
    try {
      setLoading(true);
      const appState = await loadAppState();
      const now = new Date().toISOString();

      const updatedHabit: IHabit = {
        ...data,
        updatedAt: now,
        createdAt: habitId ? data.createdAt : now
      };

      const updatedHabits = habitId
        ? appState.habits.map(h => h.id === habitId ? updatedHabit : h)
        : [...appState.habits, { ...updatedHabit, id: uuid.v4() as string }];

      await saveAppState({ ...appState, habits: updatedHabits });
      // Schedule notifications if enabled
          // Schedule habit reminders based on recurrence
    if (appState.settings.enableNotifications) {
      await scheduleHabitReminders(updatedHabit);
    }

      router.push('/habits');
    } catch (error) {
      Alert.alert("Error", "Failed to save habit");
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
        title={habitId ? "Edit Habit" : "New Habit"}
        backRoute="/habits"
        addAction={handleSubmit(onSubmit)}
        materialIcon="check"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" >
        {/* Title */}
        <Controller
          control={control}
          name="title"
          rules={{ required: "Title is required" }}
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
              label="Description"
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
          Recurrence
        </Text>

        <Controller
          control={control}
          name="recurrence.type"
          render={({ field }) => (
            <SegmentedButtons
              value={field.value}
              onValueChange={field.onChange}
              buttons={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
          )}
        />

        {recurrenceType === 'weekly' && (
          <View style={styles.weekDaysContainer}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Button
                key={day}
                mode={recurrenceDaysOfWeek?.includes(index) ? 'contained' : 'outlined'}
                onPress={() => toggleDay(index)}
                style={styles.dayButton}
              >
                {day}
              </Button>
            ))}
          </View>
        )}

        {recurrenceType === 'custom' && (
          <View style={styles.customRecurrence}>
            <Text>Repeat every</Text>
            <Controller
              control={control}
              name="recurrence.interval"
              render={({ field }) => (
                <TextInput
                  mode="outlined"
                  value={field.value?.toString()}
                  onChangeText={v => field.onChange(Number(v) || 1)}
                  keyboardType="numeric"
                  style={styles.intervalInput}
                />
              )}
            />
            <Controller
              control={control}
              name="recurrence.unit"
              render={({ field }) => (
                <TextInput
                  mode="outlined"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.unitInput}
                />
              )}
            />
          </View>
        )}

        <Button
          onPress={() => setVisible(true)}
          mode="outlined"
          icon="clock"
          style={styles.timeButton}
        >
          {recurrenceTime
            ? new Date(recurrenceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "Select time"}
        </Button>

        <TimePickerModal
          visible={visible}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          hours={recurrenceTime ? new Date(recurrenceTime).getHours() : 12}
          minutes={recurrenceTime ? new Date(recurrenceTime).getMinutes() : 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   safeArea: {
    flex: 1,
    paddingBottom: Platform.OS === 'android' ? 20 : 0, // Extra padding for Android nav buttons
  },
  contentContainer: {
    flexGrow: 1, // Ensures the content can grow to fill available space
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