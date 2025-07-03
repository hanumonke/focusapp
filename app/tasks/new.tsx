// TODO Validacion para no crear recordatorios y fechas limite anteriores al dia de hoy 
// TODO Eliminar recordatorios por intervalos 



import CustomDateTimePicker from '@/components/CustomDateTimePicker';
import CustomHeader from '@/components/CustomHeader';
import RemindersInput from '@/components/RemindersInput';
import TagsInput from '@/components/TagsInput';
import { loadSettings, loadTasks, saveTasks } from '@/db/storage';
import { IReminder, ITask } from '@/db/types';
import { scheduleReminders} from '@/utils/notificationService';
import { loadOptions } from '@babel/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Divider, Text, TextInput, useTheme } from 'react-native-paper';
import uuid from 'react-native-uuid';



const CreateTask = () => {
  const router = useRouter();
  const { id: taskId  } = useLocalSearchParams();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ITask>({
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      tags: [],
      reminders: [],
      isCompleted: false,
    }
  });

  useEffect(() => {
    const fetchTaskData = async () => {
      if (taskId) {
        try {
          const tasks = await loadTasks();
          const taskToEdit = tasks.find(task => task.id === taskId);
          if (taskToEdit) {
            reset(taskToEdit);
          } else {
            Alert.alert("Error", "Task not found.");
            router.replace('/tasks');
          }
        } catch (error) {
          console.error("Error loading task:", error);
          Alert.alert("Error", "Failed to load task.");
          router.replace('/tasks');
        }
      }
    };
    fetchTaskData();
  }, [taskId, reset, router]);

  const onSubmit = async (data: ITask) => {
    try {
      const tasksState = await loadTasks();
      const settingsState = await loadSettings();
      const now = new Date().toISOString();

    // Generate ID BEFORE saving
    const id = taskId ? taskId as string : uuid.v4() as string; 

    const updatedTask: ITask = {
      ...data,
      id: id, // Use generated ID here
      updatedAt: now,
      createdAt: taskId ? data.createdAt : now
    };

      

      const updatedTasks = taskId
        ? tasksState.map(t => t.id === taskId ? updatedTask : t)
        : [...tasksState, { ...updatedTask, id: uuid.v4() as string }];

      await saveTasks(updatedTasks)
         // Schedule notifications if enabled
    if (settingsState.enableNotifications) {
      // add reminder for due date
      const dueDateReminder: IReminder = {
         id: uuid.v4() as string,
        type: 'date',
        title: data.title,
        message: data.description.slice(0, 30) + "...",
        timestamp: data.dueDate!,
        sound: 'default'
      }
      await scheduleReminders([...data.reminders, dueDateReminder], updatedTask.id);
    }
    
      router.push('/tasks');
    } catch (error) {
      Alert.alert("Error", "Failed to save task");
      console.error(error);
    }
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader 
        materialIcon='check' 
        title={taskId ? "Edit Task" : "New Task"} 
        backRoute='/tasks' 
        addAction={handleSubmit(onSubmit)} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
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

          <Divider style={styles.divider} />

          {/* Due Date */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Due Date
          </Text>
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <CustomDateTimePicker 
                value={field.value} 
                onChange={field.onChange} 
                label="Select due date"
              />
            )}
          />

          <Divider style={styles.divider} />

          {/* Reminders */}
          
          <Controller
            control={control}
            name="reminders"
            render={({ field }) => (
              <RemindersInput 
                value={field.value} 
                onChange={field.onChange} 
                title={'Reminders'} 
                dueDate={watch('dueDate')}
              />
            )}
          />
        </View>

        <Button onPress={() => reset()} mode="contained">Clear fields</Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    gap: 5,
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
});

export default CreateTask;