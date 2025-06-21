import { Day, IntervalUnit, IReminder, ReminderType, DayNumber } from '@/db/types';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Card, IconButton, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import uuid from 'react-native-uuid';
import CustomDateTimePicker from './CustomDateTimePicker';
import { TimePickerModal } from 'react-native-paper-dates';

type RemindersInputProps = {
    value: IReminder[];
    onChange: (reminders: IReminder[]) => void;
    label?: string;
    title: string;
};

const initialNewReminderState = {
    message: '',
    type: 'interval' as ReminderType,
    interval: undefined as number | undefined,
    unit: 'DAY' as IntervalUnit,
    timestamp: undefined as string | undefined,
    day: 'DOMINGO' as Day,
};

const RemindersInput: React.FC<RemindersInputProps> = ({ value, onChange, label = "Recordatorios", title }) => {
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
            ...initialNewReminderState,
            type: prev.type
        }));
    };

    const handleAddReminder = () => {
        if (!message.trim()) {
            Alert.alert('Error de validación', 'El mensaje del recordatorio no puede estar vacío.');
            return;
        }

        let validatedReminder: IReminder | null = null;

        switch (type) {
            case 'interval':
                const numericInterval = Number(interval);
                if (isNaN(numericInterval) || numericInterval <= 0) {
                    Alert.alert('Error de validación', 'El intervalo debe ser un número positivo válido.');
                    return;
                }
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
                return;
        }

        if (validatedReminder && !value.some(existingReminder => existingReminder.id === validatedReminder!.id)) {
            onChange([...value, validatedReminder]);
            clearInputs();
        } else if (validatedReminder) {
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
                            value={interval !== undefined ? String(interval) : ''}
                            onChangeText={(text) => setNewReminderData(prev => ({ ...prev, interval: Number(text) || undefined }))}
                            style={styles.intervalTextInput}
                            placeholder='Cantidad'
                        />
                        <Dropdown
                            mode='outlined'
                            options={[
                                { label: 'minuto(s)', value: 'MINUTE' },
                                { label: 'hora(s)', value: 'HOUR' },
                                { label: 'dia(s)', value: 'DAY' },
                                { label: 'semana(s)', value: 'WEEK' },
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
                            value={timestamp || ''}
                            onChange={(isoDate) => setNewReminderData(prev => ({ ...prev, timestamp: isoDate || undefined }))}
                            label="Fecha"
                        />
                    </View>
                );
            case 'weekly':
                return (
                    <View style={styles.weeklyDailyContainer}>
                        <Dropdown
                            mode='outlined'
                            options={Object.keys(DayNumber).filter(key => isNaN(Number(key))).map(dayKey => ({
                                label: dayKey.charAt(0) + dayKey.slice(1).toLowerCase(),
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
                        <SegmentedButtons
                            value={type}
                            onValueChange={(value) => {
                                setNewReminderData(prev => ({
                                    ...prev,
                                    type: value as ReminderType,
                                    timestamp: undefined,
                                    day: 'DOMINGO',
                                    interval: undefined,
                                    unit: 'DAY'
                                }));
                                onChange([]);
                            }}
                            buttons={[
                                { value: 'interval', label: 'Intervalo' },
                                { value: 'date', label: 'Único' },
                                { value: 'weekly', label: 'Semanal' },
                                { value: 'daily', label: 'Diario' },
                            ]}
                            style={styles.segmentedButtons}
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
        flexDirection: 'column',
        gap: 10,
        marginVertical: 10,
    },
    segmentedButtons: {
        marginBottom: 10,
    },
    dropdown: {
        flex: 1,
        marginRight: 10,
        minWidth: 120,
    },
    intervalContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        gap: 5,
        minWidth: 200,
    },
    intervalTextInput: {
        flex: 1,
    },
    datePickerContainer: {
        minWidth: 200,
    },
    weeklyDailyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
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