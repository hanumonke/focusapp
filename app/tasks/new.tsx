// @/app/tasks/new.tsx
import CustomDateTimePicker from '@/components/CustomDateTimePicker';
import CustomHeader from '@/components/CustomHeader';
import RemindersInput from '@/components/RemindersInput';
import TagsInput from '@/components/TagsInput';
import { loadAppState, saveAppState } from '@/db/storage';
import { IReminder, ITask } from '@/db/types';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
import React, { useEffect } from 'react'; // Import useEffect
import { Controller, useForm } from "react-hook-form";
import { SafeAreaView, StyleSheet, View, Alert } from 'react-native'; // Import Alert for popups
import { ScrollView } from 'react-native-gesture-handler';
import { Divider, Text, TextInput } from 'react-native-paper';

import uuid from 'react-native-uuid';

// Define the shape of your form data, including an optional 'id' for editing
interface FormData {
    id?: string; // Add optional id for existing tasks
    title: string;
    description: string;
    dueDate: string;
    tags: string[];
    reminders: IReminder[];
}

const CreateTask = () => {
    const router = useRouter();
    const { id: taskId } = useLocalSearchParams(); // Get taskId from URL parameters

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset, // We need the reset function to pre-fill the form
    } = useForm<FormData>({ // Use FormData interface here
        defaultValues: {
            // id: undefined, // ID will be set by reset if editing an existing task
            title: "",
            description: "",
            dueDate: '',
            tags: [] as string[],
            reminders: [] as IReminder[]
        },
    });

    // Use useEffect to load and set form data when taskId changes (i.e., when editing)
    useEffect(() => {
        const fetchTaskData = async () => {
            if (taskId) {
                // If taskId exists, we are in edit mode
                try {
                    const appState = await loadAppState();
                    const taskToEdit = appState.tasks.find(task => task.id === taskId);

                    if (taskToEdit) {
                        // Pre-fill the form with the existing task data
                        reset(taskToEdit);
                    } else {
                        // Task not found, handle gracefully (e.g., redirect or show error)
                        Alert.alert("Error", "Tarea no encontrada.");
                        router.replace('/tasks'); // Redirect back to tasks list if task not found
                    }
                } catch (error) {
                    console.error("Error loading task for editing:", error);
                    Alert.alert("Error", "No se pudo cargar la tarea.");
                    router.replace('/tasks'); // Redirect on error
                }
            } else {
                // If no taskId, ensure the form is cleared for a new task
                reset({
                    title: "",
                    description: "",
                    dueDate: '',
                    tags: [],
                    reminders: []
                });
            }
        };

        fetchTaskData();
    }, [taskId, reset, router]); // Depend on taskId to re-run when it changes, and reset/router for stability

    // Modified onSubmit to handle both creating and updating tasks
    const onSubmit = async (data: FormData) => {
        try {
            const appState = await loadAppState();
            let updatedTasks: ITask[];

            if (data.id) {
                // This is an EDIT operation (task has an ID)
                updatedTasks = appState.tasks.map(task =>
                    task.id === data.id
                        ? { ...data, isCompleted: task.isCompleted || false } // Update existing task, preserve isCompleted
                        : task
                );
            } else {
                // This is a CREATE NEW task operation (no ID yet)
                const newTask: ITask = {
                    id: uuid.v4() as string, // Assign a new UUID for a new task
                    title: data.title,
                    description: data.description,
                    dueDate: data.dueDate,
                    tags: data.tags,
                    isCompleted: false, // New tasks start as not completed
                    reminders: data.reminders,
                };
                updatedTasks = [...appState.tasks, newTask];
            }

            const updatedState = {
                ...appState,
                tasks: updatedTasks,
            };
            await saveAppState(updatedState);
            router.push('/tasks'); // Navigate back to the tasks list
        } catch (error) {
            console.error("Error saving task:", error);
            Alert.alert("Error al guardar la tarea"); // Use Alert instead of alert()
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <CustomHeader materialIcon='check' title={taskId ? "Editar Tarea" : "Nueva Tarea"} backRoute='/tasks' addAction={handleSubmit(onSubmit)} />
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.container}>
                    {/* TITULO */}
                    <Controller
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                mode='outlined'
                                placeholder="Nombre de la tarea"
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
                                style={styles.multilineInput} // Use a dedicated style
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

                    <Divider style={styles.divider} />

                    {/* DATETIMEPICKER */}
                    <View style={{ marginVertical: 10 }}>
                        <Text>Fecha Límite</Text>
                        <Controller
                            control={control}
                            name="dueDate"
                            rules={{ required: true }}
                            render={({ field: { value, onChange } }) => (
                                <CustomDateTimePicker value={value} onChange={onChange} label="Fecha Límite" />
                            )}
                        />
                        {errors.dueDate && <Text style={styles.error}>Este campo es obligatorio</Text>}
                    </View>
                    {/* REMINDERS */}

                    <Divider style={styles.divider} />

                    <Controller
                        control={control}
                        name='reminders'
                        // Removed rules={{ required: true }} as reminders are typically optional
                        render={({ field: { value, onChange } }) => (
                            <RemindersInput title={'Recordatorios'} onChange={onChange} value={value} />
                        )}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20, // Add padding at the bottom of the scroll view
    },
    container: {
        flex: 1,
        paddingHorizontal: 16, // Use horizontal padding for consistency
        backgroundColor: '#fff',
    },
    input: {
        marginBottom: 8,
    },
    multilineInput: { // Dedicated style for multiline TextInput
        marginBottom: 8,
        paddingVertical: 10,
    },
    error: {
        color: 'red',
        marginBottom: 8,
        marginLeft: 4,
    },
    divider: {
        marginVertical: 15,
    },
});

export default CreateTask;