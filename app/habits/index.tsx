import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    View
} from 'react-native';

// TODO: implement search feature
// TODO: build the real habit card
// TODO: connect with the details page


import { loadAppState, saveAppState } from '@/db/storage';
import { IAppState, IHabit, initialAppState } from '@/db/types';
import { router, useFocusEffect } from 'expo-router';
import { FlatList } from 'react-native-gesture-handler';
import { Button, Card, Searchbar, Text } from 'react-native-paper';

const Habits = () => {
    const [appState, setAppState] = useState<IAppState>(initialAppState);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        const loadedState = await loadAppState();
        setAppState(loadedState);
        setLoading(false);
    }, []);

    const handleCreateHabit = () => {
        router.push('/habits/new');
    };

    const handleDeleteHabit = async (id: string) => {
        import('react-native').then(({ Alert }) => {
            Alert.alert(
                "Eliminar habito",
                "¿Estás seguro de que deseas eliminar esta habito?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: async () => {
                            const updatedHabits = appState.habits.filter(habit => habit.id !== id);
                            const updatedState = { ...appState, habits: updatedHabits };
                            await saveAppState(updatedState);
                            setAppState(updatedState);
                        }
                    }
                ]
            );
        });
    };

    const handleDetails = (id: string) => router.push(`/habits/${id}`)

    useFocusEffect(
        useCallback(() => {
            loadData();
            console.log('Habitos:', appState.habits)
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

    const renderHabitItem = ({ item }: { item: IHabit }) => (
         <Card style={styles.card} elevation={1}>
            <Card.Content style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{item.title}</Text>
                    <Text variant="bodyMedium" numberOfLines={2}>{item.description}</Text>
                </View>
            </Card.Content>
            <Card.Actions>
                <Button onPress={() => handleDetails(item.id)}>Detalles</Button>
                <Button onPress={() => handleDeleteHabit(item.id)} buttonColor='red' textColor="white">Eliminar</Button>
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
            <Button mode='contained' onPress={handleCreateHabit} style={styles.addButton}>
                Agregar habito
            </Button>
            {appState.tasks.length !== 0 ? (
                <FlatList
                    data={appState.habits}
                    renderItem={renderHabitItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            ) : (
                <Text style={styles.noTasks}>No hay habitos</Text>
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

export default Habits;