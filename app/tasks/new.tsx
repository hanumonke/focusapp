import CustomDateTimePicker from '@/components/CustomDateTimePicker';
import CustomHeader from '@/components/CustomHeader';
import RemindersInput from '@/components/RemindersInput';
import TagsInput from '@/components/TagsInput';
import { loadSettings, loadTasks, saveTasks } from '@/db/storage';
import { IReminder, ITask } from '@/db/types';
import { scheduleReminders } from '@/utils/notificationService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ActivityIndicator, Button, Divider, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import uuid from 'react-native-uuid';


// TODO: limpiar los campos al empezar - DEBUG
// TODO: Validar que solo se clickquee una vez al crear la tarea -> colocar loaders - DEBUG
// TODO: validar solamente fecha limite y titulo
const CreateTask = () => {
  const router = useRouter();
  const { id: taskId  } = useLocalSearchParams();
  const theme = useTheme();
   const [loading, setLoading] = useState(false);

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
      difficulty: 'easy'
    }
  });

  

  useEffect(() => {
    const fetchTaskData = async () => {
      if (taskId) {
        console.log("hay un taskid, entrando en modo editar", taskId)
        try {
          const tasks = await loadTasks();
          const taskToEdit = tasks.find(task => task.id === taskId);
          if (taskToEdit) {
            reset(taskToEdit);
          } else {
            Alert.alert("Error", "Tarea no encontrada");
            router.replace('/tasks');
          }
        } catch (error) {
          console.error("Error cargando la tarea:", error);
          Alert.alert("Error", "No se pudo cargar la tarea");
          router.replace('/tasks');
        }
      } else {
        console.log("No hay un taskid, entrando en modo crear")
        reset( {
            title: "",
            description: "",
            dueDate: undefined, // Asegúrate de que esto sea undefined/null para un nuevo formulario
            tags: [],
            reminders: [],
            isCompleted: false,
            difficulty: 'easy'
        }); 
      }
    };

    fetchTaskData();
  }, [taskId, reset, router]);

  const onSubmit = async (data: ITask) => {
    try {
      console.log("Guardando tarea...")
      setLoading(true)

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

      // Fix: Use the correct ID consistently
      const updatedTasks = taskId
        ? tasksState.map(t => t.id === taskId ? updatedTask : t)
        : [...tasksState, updatedTask]; // Remove the duplicate ID generation

      await saveTasks(updatedTasks)
      
      // Schedule notifications if enabled and task has due date
      if (settingsState.enableNotifications && data.dueDate) {
        // Cancel existing notifications first
        // await cancelNotificationsForItem(updatedTask.id); // This function is not defined in the original file
        
        // Create due date reminder
        const dueDateReminder: IReminder = {
          id: uuid.v4() as string,
          type: 'date',
          title: data.title,
          message: data.description ? data.description.slice(0, 30) + "..." : "Tarea vence pronto",
          timestamp: data.dueDate,
          sound: 'default'
        }
        
        // Schedule all reminders (user-created + due date)
        const allReminders = [...data.reminders, dueDateReminder];
        await scheduleReminders(allReminders, updatedTask.id);
        
        console.log(`Scheduled ${allReminders.length} notifications for task: ${data.title}`);
      }

      setLoading(false); 
      console.log("guardado")
      router.push('/tasks');
      
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la tarea");
      console.error(error);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader 
        materialIcon='check' 
        title={taskId ? "Editar" : "Nueva"} 
        backRoute='/tasks' 
        addAction={handleSubmit(onSubmit)} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>



          {/* Title */}
          <Controller
            control={control}
            name="title"
            rules={{ required: "El titulo es obligatorio" }}
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
            rules={{  }}
            render={({ field }) => (
              <TagsInput value={field.value} onChange={field.onChange} />
            )}
          />

          <Divider style={styles.divider} />

          {/* Due Date */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Vencimiento
          </Text>
          <Controller
            control={control}
            name="dueDate"
            rules={{ required: "La fecha es obligatoria"}}
            render={({ field }) => (
              <CustomDateTimePicker 
                value={field.value} 
                onChange={field.onChange} 
                label="Fecha"
              />
              
            )}
          />

            
          {errors.dueDate && (
            <Text style={styles.error}>{errors.dueDate.message}</Text>
          )}
          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Dificultad
          </Text>

          {/* Difficulty Level */}
          <Controller
            control={control}
            name="difficulty"
            defaultValue="medium"
            render={({ field }) => (
              <SegmentedButtons
                value={field.value}
                onValueChange={field.onChange}
                buttons={[
                  { value: 'easy', label: 'Fácil' },
                  { value: 'medium', label: 'Medio' },
                  { value: 'hard', label: 'Difícil' },
                ]}
                style={{ marginBottom: 16 }}
              />
            )}
          />

          {/* Reminders */}
          
          <Controller
            control={control}
            name="reminders"
            render={({ field }) => (
              <RemindersInput 
                value={field.value} 
                onChange={field.onChange} 
                title={watch('title') || "Tarea"} 
                dueDate={watch('dueDate')}
              />
            )}
          />

          
        </View>

        <Button onPress={() => reset()} mode="contained">Limpiar campos</Button>
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
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateTask;