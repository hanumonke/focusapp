import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Button,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Alert
} from 'react-native';

import { IAppState, initialAppState } from '@/types'; // Importa tus tipos
import { loadAppState, saveAppState, clearAppState } from '@/db/store';
import uuid from "react-native-uuid"; 


const Tasks = () => {
    const [appState, setAppState] = useState<IAppState>(initialAppState);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        const loadedState = await loadAppState();
        setAppState(loadedState);
        setLoading(false);
    }, []);

    const saveData = useCallback(async () => {
        await saveAppState(appState);
    }, [appState]);

    const addDummyTask = useCallback(async () => {
     
        try {
             const newTask = {
            id: uuid.v4(), // Genera un ID único para la tarea
            title: `Tarea de prueba ${appState.tasks.length + 1}`,
            description: "Esta es una tarea creada para probar el almacenamiento.",
            dueDate: new Date().toISOString(),
            tags: ["test", "dummy"],
            isCompleted: false,
            completedAt: null,
            scheduledNotifications: [], // Por ahora, sin notificaciones
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        alert(newTask); 
        // Actualiza el estado de React con la nueva tarea
        setAppState(prevState => ({
            ...prevState,
            tasks: [...prevState.tasks, newTask], // Añade la nueva tarea al array existente
        }));

        // IMPORTANTE: Luego de actualizar el estado, guárdalo en AsyncStorage
        await saveData(); // Llama a saveData para persistir el cambio
        Alert.alert("Tarea Añadida", `Se añadió "${newTask.title}".`);
            
        } catch (error) {
            console.error(error); 
        }
       
        
    }, [appState, saveData]);




     useEffect(() => {
        loadData();
    }, [loadData]); // Se ejecuta una sola vez al montar el componente

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Cargando datos...</Text>
            </View>
        );
    }

    return (
       <ScrollView>
            {/* Searchbar */}

            <View>
                <Button title="Añadir Tarea de Prueba" onPress={addDummyTask} />
            </View>

         
           
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
        paddingTop: 50,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    subheader: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
        color: '#555',
    },
    jsonOutput: {
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 5,
        fontFamily: 'monospace',
        minHeight: 200,
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'column',
        gap: 10, // Espacio entre botones
        marginBottom: 20,
    }
});

export default Tasks