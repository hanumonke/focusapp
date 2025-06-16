import { Day, IntervalUnit, IReminder, ReminderType, DayNumber } from '@/db/types'; // Import all types
import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Card, IconButton, Text, TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import uuid from 'react-native-uuid';
import CustomDateTimePicker from './CustomDateTimePicker';
import { TimePickerModal } from 'react-native-paper-dates';

type RemindersInputProps = {
    value: IReminder[];
    onChange: (reminders: IReminder[]) => void;
    label?: string;
    title: string; // Habit / Task title
};

// Define initial state for a new reminder, aligning with IReminder structure
const initialNewReminderState = {
    message: '',
    type: 'interval' as ReminderType,
    interval: undefined as number | undefined, // Explicitly undefined for optional properties
    unit: 'DAY' as IntervalUnit,
    timestamp: undefined as string | undefined, // ISO string, undefined for optional
    day: 'DOMINGO' as Day,
};

const RemindersInput: React.FC<RemindersInputProps> = ({ value, onChange, label = "Recordatorios", title }) => {
    console.log("RemindersInput Rendered. Current 'value' prop:", value);
    const [newReminderData, setNewReminderData] = useState(initialNewReminderState);
    const { message, type, interval, unit, timestamp, day } = newReminderData;

    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

    const onDismissTimePicker = useCallback(() => {
        setIsTimePickerVisible(false);
    }, []);

    const onConfirmTimePicker = React.useCallback(
        ({ hours, minutes }: { hours: number; minutes: number }) => {
            setIsTimePickerVisible(false);
            const date = new Date();
            date.setSeconds(0, 0);
            date.setHours(hours);
            date.setMinutes(minutes);
            setNewReminderData(prev => ({ ...prev, timestamp: date.toISOString() }));
        },
        []
    );

    const clearInputs = () => {
        setNewReminderData(prev => ({
            ...initialNewReminderState, // Copia el estado inicial para message, interval, unit, timestamp, day
            type: prev.type // PERO sobrescribe el 'type' con el valor que tenía antes de resetear
        }));
    };

    const handleAddReminder = () => {
        if (!message.trim()) {
            Alert.alert('Error de validación', 'El mensaje del recordatorio no puede estar vacío.');
            return;
        }

        let validatedReminder: IReminder | null = null; // Initialize as null to handle default case

        switch (type) {
            case 'interval':
                const numericInterval = Number(interval);
                if (isNaN(numericInterval) || numericInterval <= 0) { // Check for NaN or non-positive number
                    Alert.alert('Error de validación', 'El intervalo debe ser un número positivo válido.');
                    return;
                }
                // No need to check 'unit' as it defaults to 'DAY' and is handled by Dropdown's onSelect
                validatedReminder = {
                    id: uuid.v4() as string,
                    type: 'interval',
                    title: title,
                    message: message.trim(),
                    interval: numericInterval,
                    unit: unit,
                    sound: 'default'
                };
                break;
            case 'date':
                if (!timestamp) {
                    Alert.alert('Error de validación', 'Debe seleccionar una fecha y hora para el recordatorio único.');
                    return;
                }
                validatedReminder = {
                    id: uuid.v4() as string,
                    type: 'date',
                    title: title,
                    message: message.trim(),
                    timestamp: timestamp,
                    sound: 'default'
                };
                break;
            case 'weekly':
                // No need to check 'day' as it defaults to 'DOMINGO' and is handled by Dropdown's onSelect
                if (!timestamp) {
                    Alert.alert('Error de validación', 'Debe seleccionar una hora para el recordatorio semanal.');
                    return;
                }
                validatedReminder = {
                    id: uuid.v4() as string,
                    type: 'weekly',
                    title: title,
                    message: message.trim(),
                    day: day,
                    timestamp: timestamp,
                    sound: 'default'
                };
                break;
            case 'daily':
                if (!timestamp) {
                    Alert.alert('Error de validación', 'Debe seleccionar una hora para el recordatorio diario.');
                    return;
                }
                validatedReminder = {
                    id: uuid.v4() as string,
                    type: 'daily',
                    title: title,
                    message: message.trim(),
                    timestamp: timestamp,
                    sound: 'default'
                };
                break;
            default:
                Alert.alert('Error de validación', 'Tipo de recordatorio no válido.');
                return; // Stop execution if type is invalid
        }

        // Only proceed if validatedReminder was successfully created
        if (validatedReminder && !value.some(existingReminder => existingReminder.id === validatedReminder!.id)) {
            onChange([...value, validatedReminder]);

            clearInputs();
        } else if (validatedReminder) { // If validatedReminder exists but is a duplicate
            Alert.alert('Recordatorio Existente', 'Este recordatorio ya ha sido agregado.');
        }
    };

    const handleDeleteReminder = (reminderId: string) => {
        onChange(value.filter(reminder => reminder.id !== reminderId));
    };

    const renderReminderInputs = () => {
        switch (type) {
            case 'interval':
                return (
                    <View style={styles.intervalContainer}>
                        <TextInput
                            mode='outlined'
                            inputMode='numeric'
                            value={interval !== undefined ? String(interval) : ''} // Ensure string for TextInput
                            onChangeText={(text) => setNewReminderData(prev => ({ ...prev, interval: Number(text) || undefined }))} // Store as number or undefined
                            style={styles.intervalTextInput}
                            placeholder='Cantidad'
                        />
                        <Dropdown
                            mode='outlined'
                            options={[
                                { label: 'minuto(s)', value: 'MINUTE' },
                                { label: 'hora(s)', value: 'HOUR' },
                                { label: 'dia(s)', value: 'DAY' },
                                { label: 'semana(s)', value: 'WEEK' }, // Added WEEK
                            ]}
                            value={unit}
                            onSelect={(selectedValue) => setNewReminderData(prev => ({ ...prev, unit: (selectedValue as IntervalUnit) ?? 'DAY' }))}
                            menuContentStyle={styles.dropdown}
                        />
                    </View>
                );
            case 'date':
                return (
                    <View style={styles.datePickerContainer}>
                        <CustomDateTimePicker
                            value={timestamp || ''} // Pass empty string if undefined
                            onChange={(isoDate) => setNewReminderData(prev => ({ ...prev, timestamp: isoDate || undefined }))} // Store as string or undefined
                            label="Fecha"
                        />
                    </View>
                );
            case 'weekly':
                return (
                    <View style={styles.weeklyDailyContainer}>
                        <Dropdown
                            mode='outlined'
                            options={Object.keys(DayNumber).filter(key => isNaN(Number(key))).map(dayKey => ({ // Dynamically create options from enum
                                label: dayKey.charAt(0) + dayKey.slice(1).toLowerCase(), // Capitalize first letter
                                value: dayKey
                            }))}
                            value={day}
                            onSelect={(selectedValue) => setNewReminderData(prev => ({ ...prev, day: (selectedValue as Day) ?? 'DOMINGO' }))}
                            menuContentStyle={styles.dropdown}
                        />
                        <Button onPress={() => setIsTimePickerVisible(true)} mode='outlined' icon='clock-edit'>
                            {timestamp ? new Date(timestamp).toLocaleTimeString('en-US', { timeStyle: "short" }) : "Hora"}
                        </Button>
                    </View>
                );
            case 'daily':
                return (
                    <View style={styles.weeklyDailyContainer}>
                        <Button onPress={() => setIsTimePickerVisible(true)} mode='outlined' icon='clock-edit'>
                            {timestamp ? new Date(timestamp).toLocaleTimeString('en-US', { timeStyle: "short" }) : "Hora"}
                        </Button>
                    </View>
                );
            default:
                return null;
        }
    };

    return (

        <>
            <View style={{ flexGrow: 1 }}>
                <Text variant="titleMedium">{label}</Text>

                <View style={styles.container}>
                    <TextInput
                        value={message}
                        onChangeText={(text) => setNewReminderData(prev => ({ ...prev, message: text }))}
                        mode='outlined'
                        placeholder='mensaje'
                        style={styles.textInput}
                    />

                    <View style={styles.typeSelectionAndInputs}>
                        <Dropdown
                            mode='outlined'
                            options={[
                                { label: 'Intervalo', value: 'interval' },
                                { label: 'Unico', value: 'date' },
                                { label: 'Semanal', value: 'weekly' },
                                { label: 'Diario', value: 'daily' },
                            ]}
                            value={type}
                            onSelect={(selectedValue) => {
                                setNewReminderData(prev => ({
                                    ...prev,
                                    type: (selectedValue as ReminderType),
                                    timestamp: undefined, // Reset optional fields when type changes
                                    day: 'DOMINGO',
                                    interval: undefined,
                                    unit: 'DAY' // Reset unit as well for consistency
                                }))
                                onChange([]);
                            }
                            }
                            menuContentStyle={styles.dropdown}

                        />

                        {renderReminderInputs()}

                        <TimePickerModal
                            visible={isTimePickerVisible}
                            onDismiss={onDismissTimePicker}
                            onConfirm={onConfirmTimePicker}
                            hours={timestamp ? new Date(timestamp).getHours() : 12}
                            minutes={timestamp ? new Date(timestamp).getMinutes() : 0}
                        />
                    </View>

                    <IconButton style={styles.addButton} icon="plus" mode='contained' onPress={handleAddReminder} />
                    {value.length > 0 && (
                        <View style={styles.remindersList}>
                            {value.map((reminder) => (
                                <Card key={reminder.id} contentStyle={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <Card.Content style={{ padding: 15 }}>
                                        <Text>
                                            <Text style={{ fontWeight: 'bold' }}>Tipo:</Text>{' '}
                                            {reminder.type === 'interval' ? 'Intervalo' :
                                                reminder.type === 'date' ? 'Único' :
                                                    reminder.type === 'weekly' ? `Semanal (${reminder.day})` :
                                                        'Diario'}
                                        </Text>
                                        <Text>
                                            <Text style={{ fontWeight: 'bold' }}>Mensaje:</Text> {reminder.message}
                                        </Text>
                                        {/* Conditionally render interval/timestamp based on type and if they exist */}
                                        {reminder.type === 'interval' && typeof reminder.interval === 'number' && reminder.unit && (
                                            <Text>
                                                <Text style={{ fontWeight: 'bold' }}>Cada:</Text> {reminder.interval} {reminder.unit.toLowerCase()}(s)
                                            </Text>
                                        )}
                                        {(reminder.type === 'date' || reminder.type === 'daily' || reminder.type === 'weekly') && reminder.timestamp && (
                                            <Text>
                                                <Text style={{ fontWeight: 'bold' }}>Fecha/Hora:</Text> {new Date(reminder.timestamp).toLocaleString()}
                                            </Text>
                                        )}
                                    </Card.Content>

                                    <Card.Actions>
                                        <IconButton icon="delete" mode='outlined' onPress={() => handleDeleteReminder(reminder.id)} />
                                    </Card.Actions>


                                </Card>
                            ))}
                        </View>
                    )}
                </View>

            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        
    },
    textInput: {
        marginBottom: 10,
    },
    typeSelectionAndInputs: {
        flexDirection: 'row',
        flex: 2, 
        gap: 5,
        marginVertical: 10,
        justifyContent: 'center'
    },
    dropdown: {
        flex: 1,
        marginRight: 10,
        minWidth: 120,
    },
    intervalContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        gap: 10,
        flex: 2,
        minWidth: 200,
    },
    intervalTextInput: {
        flex: 1,
    },
    datePickerContainer: {
        flex: 2,
        minWidth: 200,
    },
    weeklyDailyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 2,
        minWidth: 200,
    },
    addButton: {
        alignSelf: 'center',
    },
    remindersList: {
        marginTop: 10,
        gap: 10

    },

});

export default RemindersInput;