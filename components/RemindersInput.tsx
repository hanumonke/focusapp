import { DayNumber, IReminder, ReminderType } from '@/db/types';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import uuid from 'react-native-uuid';
import CustomDateTimePicker from './CustomDateTimePicker';


type RemindersInputProps = {
    value: IReminder[];
    onChange: (reminders: IReminder[]) => void;
    label?: string;
    title: string;
    dueDate?: string | undefined | null;
};

const initialNewReminderState = {
    message: '',
    type: 'date' as ReminderType,
    timestamp: undefined as string | undefined,
    daysOfWeek: [] as DayNumber[], // <-- Usa DayNumber[]
};

const daysInOrder = [
    { label: 'Dom', value: 0 as DayNumber },
    { label: 'Lun', value: 1 as DayNumber },
    { label: 'Mar', value: 2 as DayNumber },
    { label: 'Mié', value: 3 as DayNumber },
    { label: 'Jue', value: 4 as DayNumber },
    { label: 'Vie', value: 5 as DayNumber },
    { label: 'Sáb', value: 6 as DayNumber },
];

const RemindersInput: React.FC<RemindersInputProps> = ({ value, onChange, label = "Recordatorios", title, dueDate }) => {
    const [newReminderData, setNewReminderData] = useState(initialNewReminderState);
    const { message, type, timestamp, daysOfWeek } = newReminderData;
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
            Alert.alert('Error', 'El mensaje es obligatorio');
            return;
        }

        let validatedReminder: IReminder | null = null;

        switch (type) {
            case 'date':
                if (!timestamp) {
                    Alert.alert('Error', ' Debes seleccionar una fecha y hora para el recordatorio único');
                    return;
                }
                if (dueDate && timestamp && new Date(timestamp) > new Date(dueDate)) {
                    Alert.alert('Error', 'La hora del recordatorio no puede ser posterior a la fecha de vencimiento de la tarea');
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
                    Alert.alert('Error', 'Debes seleccionar una hora para el recordatorio semanal.');
                    return;
                }
                if (!daysOfWeek || daysOfWeek.length === 0) {
                    Alert.alert('Error', 'Selecciona al menos un día para el recordatorio semanal');
                    return;
                }
                validatedReminder = {
                    id: uuid.v4() as string,
                    type: 'weekly',
                    title: title,
                    message: message.trim(),
                    daysOfWeek: daysOfWeek as DayNumber[], // <-- asegúrate de que es DayNumber[]
                    timestamp: timestamp,
                    sound: 'default'
                };
                break;
            case 'daily':
                if (!timestamp) {
                    Alert.alert('Error', 'Debes seleccionar una hora para el recordatorio diario.');
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
                Alert.alert('Error', 'Tipo de recordatorio inválido.');
                return;
        }

        if (validatedReminder && !value.some(existingReminder => existingReminder.id === validatedReminder!.id)) {
            onChange([...value, validatedReminder]);
            clearInputs();
        } else if (validatedReminder) {
            Alert.alert('Recordatorio duplicado', 'Este recordatorio ya ha sido añadido.');
        }
    };

    const handleDeleteReminder = (reminderId: string) => {
        onChange(value.filter(reminder => reminder.id !== reminderId));
    };

    const renderReminderInputs = () => {
        switch (type) {
            case 'date':
                return (
                    <View style={styles.datePickerContainer}>
                        <CustomDateTimePicker
                            limitDate={dueDate}
                            value={timestamp || ''}
                            onChange={(isoDate) => setNewReminderData(prev => ({ ...prev, timestamp: isoDate || undefined }))}
                            label="Date"
                        />
                    </View>
                );
            case 'weekly':
                return (
                    <View style={styles.chipContainer}>
                        {daysInOrder.map(({ label, value: dayNum }) => {
                            const isSelected = daysOfWeek.includes(dayNum);
                            return (
                                <Chip
                                    mode='outlined'
                                    compact
                                    style={{ height: 36 }}
                                    key={label}
                                    selected={isSelected}
                                    showSelectedOverlay
                                    showSelectedCheck={false}
                                    onPress={() => {
                                        setNewReminderData(prev => ({
                                            ...prev,
                                            daysOfWeek: isSelected
                                                ? prev.daysOfWeek.filter(d => d !== dayNum)
                                                : [...prev.daysOfWeek, dayNum as DayNumber] // <-- Usa DayNumber aquí
                                        }));
                                    }}
                                >{label}</Chip>
                            );
                        })}
                        <Button onPress={() => setIsTimePickerVisible(true)} mode='outlined' icon='clock-edit'>
                            {timestamp ? new Date(timestamp).toLocaleTimeString('en-US', { timeStyle: "short" }) : "HOra"}
                        </Button>
                    </View>
                );
            case 'daily':
                return (
                    <View style={styles.dailyDailyContainer}>
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
            <View>
                <Text variant="titleMedium">{label}</Text>

                <View style={styles.container}>
                    <TextInput
                        value={message}
                        onChangeText={(text) => setNewReminderData(prev => ({ ...prev, message: text }))}
                        mode='outlined'
                        placeholder='Message'
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
                                    daysOfWeek: [],
                                }));
                                onChange([]);
                            }}
                            buttons={[
                                { value: 'date', label: 'Único' },
                                { value: 'daily', label: 'Diario' },
                                { value: 'weekly', label: 'Semanal' },
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
                </View>
                <IconButton style={styles.addButton} icon="plus" mode='contained' onPress={handleAddReminder} />
                {value.length > 0 && (
                    <View style={styles.remindersList}>
                        {value.map((reminder) => (
                            <Card key={reminder.id} contentStyle={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                <Card.Content style={{ padding: 15, }}>
                                    <Text>
                                        <Text style={{ fontWeight: 'bold' }}>Type:</Text>{' '}
                                        {
                                            reminder.type === 'date' ? 'One-time' :
                                                reminder.type === 'weekly' ? `Weekly` :
                                                    'Daily'}
                                    </Text>
                                    <Text>
                                        <Text style={{ fontWeight: 'bold' }}>Message:</Text> {reminder.message}
                                    </Text>
                                    {(reminder.type === 'date' || reminder.type === 'daily' || reminder.type === 'weekly') && reminder.timestamp && (
                                        <Text>
                                            <Text style={{ fontWeight: 'bold' }}>Date/Time:</Text> {new Date(reminder.timestamp).toLocaleString()}
                                        </Text>
                                    )}
                                    {reminder.type === 'weekly' && reminder.daysOfWeek && (
                                        <Text>
                                            <Text style={{ fontWeight: 'bold' }}>Days:</Text> {reminder.daysOfWeek.map(d => daysInOrder[d].label).join(', ')}
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
    datePickerContainer: {
        minWidth: 200,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    dailyDailyContainer: {
        justifyContent: 'center',
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