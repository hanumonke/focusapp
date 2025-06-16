import { IntervalUnit, IReminder, ReminderType, timeToSeconds } from '@/db/types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, Text, TextInput } from 'react-native-paper';
import { Dropdown, DropdownInput } from 'react-native-paper-dropdown';
import uuid from 'react-native-uuid';
import CustomDateTimePicker from './CustomDateTimePicker';

type RemindersInputProps = {
    value: IReminder[];
    onChange: (tags: string[]) => void;
    label?: string;
    title: string // Habit / Task title
};

const RemindersInput: React.FC<RemindersInputProps> = ({ value, onChange, label = "Recordatorios", title }) => {
    const [currentReminderMessage, setCurrentReminderMessage] = useState('');
    // INTERVAL TYPE PROPS
    const [currentReminderInterval, setCurrentReminderInterval] = useState('');
    const [currentReminderIntervalUnit, setCurrentReminderIntervalUnit] = useState('DAY');
    // DATE TYPE PROPS
    const [currentReminderTimestamp, setCurrentReminderTimestamp] = useState('');

    // TYPE
    const [currentReminderType, setCurrentReminderType] = useState('interval');


    const handleAddReminder = () => {
        const newReminder: IReminder = {
            id: uuid.v4(),
            type: currentReminderType as ReminderType, 
            title: title, 
            message: currentReminderMessage, 
            // interval type
            interval: Number(currentReminderInterval),
            unit: currentReminderIntervalUnit as IntervalUnit, 
            // date type
            timestamp: currentReminderTimestamp, 
            sound: 'default'
        };

        console.log(newReminder);
    }

    const handleDeleteReminder = (index: string) => {
        console.log(index)
    }

    //   const handleAddTag = () => {

    //     if (!value.includes(newReminder)) {
    //     const draftReminder = {
    //         id: uuid.v4() as string, 

    //     }
    //       onChange([...value, newReminder]);
    //       setNewTag({});
    //     }
    //   };

    //   const handleRemoveTag = (tagToRemove: string) => {
    //     onChange(value.filter(tag => tag !== tagToRemove));
    //   };

    return (
        <View >
            <Text variant="titleMedium" >{label}</Text>

            <View>
                {/* ZONE FOR REMINDER INPUTS */}

                <TextInput
                    value={currentReminderMessage}
                    onChangeText={setCurrentReminderMessage}
                    mode='outlined'
                    placeholder='mensaje'
                    
                />

                <Dropdown
                    mode='outlined'
                    options={[{ label: 'Intervalo', value: 'interval' }, { label: 'Unico', value: 'date' }]}
                    value={currentReminderType}
                    onSelect={(selectedValue?: string) => setCurrentReminderType(selectedValue ?? 'interval')}
                />

                {/* SI TYPE ES INTERVAL */}

                {
                    currentReminderType == 'interval' ?
                    <View>
                        {/* intervalo de tiempo para notificaciones */}
                        <TextInput mode='outlined' inputMode='numeric' value={currentReminderInterval} onChangeText={setCurrentReminderInterval} />
                        <Dropdown
                            mode='outlined'
                            options={[
                                { label: 'minuto(s)', value: 'MINUTE' },
                                { label: 'hora(s)', value: 'HOUR' },
                                { label: 'dia(s)', value: 'HOUR' },
                            ]}
                            value={currentReminderIntervalUnit}
                            onSelect={(selectedValue?: string) => setCurrentReminderIntervalUnit(selectedValue ?? 'DAY')}
                        />
                    </View>

                    :

                    <View>
                        <CustomDateTimePicker value={currentReminderTimestamp} onChange={setCurrentReminderTimestamp} label="Fecha Límite" />
                    </View>
                }
                <IconButton icon="plus" mode='contained' onPress={handleAddReminder} />
            </View>



            {value.length > 0 && (
                <View>
                    {value.map((reminder, index) => (
                        <Card>
                            <Text>
                            {reminder.title}
                            {reminder.message}
                            {reminder.interval}
                            {reminder.unit}
                            {reminder.timestamp}
                        </Text>
                        <IconButton icon="delete" mode='outlined' onPress={() => handleDeleteReminder(reminder.id)} />
                        </Card>
                    ))}
                </View>
            )}
        </View>
    );
};


export default RemindersInput;