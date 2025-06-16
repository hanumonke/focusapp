import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    View
} from 'react-native';

import { loadAppState, saveAppState } from '@/db/storage';
import { IAppState, initialAppState, ITask } from '@/db/types';
import { router, useFocusEffect } from 'expo-router';
import { FlatList } from 'react-native-gesture-handler';
import { Button, Card, Checkbox, Searchbar, Text } from 'react-native-paper';

const Tasks = () => {
    const [appState, setAppState] = useState<IAppState>(initialAppState);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        const loadedState = await loadAppState();
        setAppState(loadedState);
        setLoading(false);
    }, []);

    const handleCreateTask = () => {
        router.push('/tasks/new');
    };

    const handleDeleteTask = async (id: string) => {
        import('react-native').then(({ Alert }) => {
            Alert.alert(
                "Eliminar tarea",
                "¿Estás seguro de que deseas eliminar esta tarea?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: async () => {
                            const updatedTasks = appState.tasks.filter(task => task.id !== id);
                            const updatedState = { ...appState, tasks: updatedTasks };
                            await saveAppState(updatedState);
                            setAppState(updatedState);
                        }
                    }
                ]
            );
        });
    };

    const handleDetails = (id: string) => router.push(`/tasks/${id}`)

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Cargando datos...</Text>
            </View>
        );
    }

    const renderTaskItem = ({ item }: { item: ITask }) => (
        <Card style={styles.card} elevation={1}>
            <Card.Content style={styles.cardContent}>
                <Checkbox.Android
                    status={item.isCompleted ? 'checked' : 'unchecked'}
                    onPress={() => console.log(item.id)}
                />
                <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{item.title}</Text>
                    <Text variant="bodyMedium" numberOfLines={2}>{item.description}</Text>
                    {item.dueDate && (
                        <Text variant="labelSmall" style={{ marginTop: 4 }}>
                            Vence: {new Date(item.dueDate).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </Card.Content>
            <Card.Actions>
                <Button onPress={() => handleDetails(item.id)}>Detalles</Button>
                <Button onPress={() => handleDeleteTask(item.id)} buttonColor='red' textColor="white">Eliminar</Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Buscar"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
            />
            <Button mode='contained' onPress={handleCreateTask} style={styles.addButton}>
                Agregar Tarea
            </Button>
            {appState.tasks.length !== 0 ? (
                <FlatList
                    data={appState.tasks}
                    renderItem={renderTaskItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            ) : (
                <Text style={styles.noTasks}>No hay tareas</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchbar: {
        marginBottom: 8,
    },
    addButton: {
        marginBottom: 12,
    },
    card: {
        marginBottom: 10,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    noTasks: {
        textAlign: 'center',
        marginTop: 32,
        color: '#888',
    },
    list: {
        paddingBottom: 16,
    },
});

export default Tasks;