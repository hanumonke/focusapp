import { getData, storeData } from '@/db/store';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TaskItem {
    id: number,
    title: string,
    description: string,
    deadline: string,
    created_at: string | null
}

export default function AddTask() {


    const router = useRouter();
    const { control, handleSubmit, formState: { errors } } = useForm<TaskItem>();
    const [submittedData, setSubmittedData] = useState<TaskItem | null>(null);
    const [mockTasks, setMockTask] = useState<TaskItem[]>([]);

    const [date, setDate] = useState(new Date(1598051730000));
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event: DateTimePickerEvent, selectedDate: Date) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = (currentMode: string) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    const showTimepicker = () => {
        showMode('time');
    };



    const fetchTasks = async () => {
        try {
            const data = await getData('db');
            if (data == null) throw Error('no data');
            setMockTask(data);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchTasks();
        }, [])
    );

    const onSubmit = (data: TaskItem) => {
        // Simulate form submission
        alert(date.toISOString());
        data.id = mockTasks.length + 1
        data.created_at = new Date().toISOString();
        data.deadline = date.toISOString();

        // console.log('Submitted Data:', data);
        const updatedTasks = [...mockTasks, data];
        setMockTask(updatedTasks);
        // console.log("Actualizar", mockTasks)
        storeData(updatedTasks, 'db');

        alert('Tarea Agregada')
        router.push('/tasks')
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <AntDesign name="arrowleft" size={24} color="black" />
                <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
            {/* Formulario */}
            <View style={styles.form}>
                <Text style={styles.label}>Titulo</Text>
                <Controller
                    control={control}
                    name="title"
                    rules={{ required: 'You must enter a title' }}
                    render={({ field }) => (
                        <TextInput
                            value={field.value}
                            onChangeText={field.onChange}
                            style={styles.input}
                            placeholder="Titulo"
                        />
                    )}
                />
                {typeof errors.title?.message === 'string' && (
                    <Text style={styles.errorText}>{errors.title.message}</Text>
                )}

                <Text style={styles.label}>Descripcion</Text>
                <Controller
                    control={control}
                    name="description"
                    rules={{ required: 'You must enter a description' }}
                    render={({ field }) => (
                        <TextInput
                            multiline={true}
                            numberOfLines={10}
                            value={field.value}
                            onChangeText={field.onChange}
                            style={styles.textarea}
                            placeholder="Descripcion"
                        />
                    )}
                />
                {typeof errors.description?.message === 'string' && (
                    <Text style={styles.errorText}>{errors.description.message}</Text>
                )}

                <Text style={styles.label}>Deadline</Text>
                <Controller
                    control={control}
                    name="deadline"
                    // rules={{ required: 'You must enter a deadline' }}
                    render={({ field }) => (
                        <View style={styles.deadlineRow}>
                            <View style={styles.deadlineCol}>
                                <Text>{date.toLocaleString().split(',')[0]}</Text>
                                <Button onPress={showDatepicker} title="Fecha" />
                            </View>
                            <View style={styles.deadlineCol}>
                                <Text>{date.toLocaleString().split(',')[1]}</Text>
                                <Button onPress={showTimepicker} title="Hora" />
                            </View>
                            {show && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={date}
                                    mode={mode as any}
                                    is24Hour={true}
                                    onChange={onChange as any}
                                />
                            )}
                        </View>
                    )}
                />
                {typeof errors.deadline?.message === 'string' && (
                    <Text style={styles.errorText}>{errors.deadline.message}</Text>
                )}

                <View style={styles.addButton}>
                    <Button title="Agregar" onPress={handleSubmit(onSubmit)} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    backButton: {
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButtonText: {
        marginLeft: 4,
        fontSize: 16,
    },
    form: {
        flex: 1,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    textarea: {
        height: 100,
        padding: 10,
        borderColor: 'gray',
        borderWidth: 1,
        textAlignVertical: 'top',
        marginBottom: 10,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    deadlineRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    deadlineCol: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    addButton: {
        marginTop: 10,
    },
});