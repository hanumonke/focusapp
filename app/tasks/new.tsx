import CustomDateTimePicker from '@/components/CustomDateTimePicker';
import CustomHeader from '@/components/CustomHeader';
import TagsInput from '@/components/TagsInput';
import { loadAppState, saveAppState } from '@/db/store';
import { ITask } from '@/db/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import uuid from 'react-native-uuid';

const CreateTask = () => {
    const router = useRouter();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            dueDate: '',
            tags: [] as string[],
        },
    });

    const onSubmit = async (data: { title: string; description: string; dueDate: string; tags: string[] }) => {
        try {
            const appState = await loadAppState();
            const newTask: ITask = {
                id: uuid.v4() as string,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                tags: data.tags,
                isCompleted: false,
                scheduledNotifications: [],
                
            };
            const updatedState = {
                ...appState,
                tasks: [...appState.tasks, newTask],
            };
            await saveAppState(updatedState);
            router.push('/tasks');
        } catch (error) {
            console.error(error);
            alert("Error al guardar la tarea");
        }
    };

    return (
        <>
            <CustomHeader title="Nueva Tarea" />
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
                            style={{ paddingVertical: 10}}
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

                {/* DATETIMEPICKER */}
                <Controller
                    control={control}
                    name="dueDate"
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                        <CustomDateTimePicker value={value} onChange={onChange} label="Fecha Límite" />
                    )}
                />
                {errors.dueDate && <Text style={styles.error}>Este campo es obligatorio</Text>}

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
});

export default CreateTask