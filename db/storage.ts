// src/services/dataService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IAppState, initialAppState } from './types';

const APP_STATE_KEY = '@MyApp:AppState';

export const loadAppState = async (): Promise<IAppState> => {
    try {
        const jsonValue = await AsyncStorage.getItem(APP_STATE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : initialAppState;
    } catch (e) {
        console.error("Error al cargar el estado de la app:", e);
        return initialAppState;
    }
};

export const saveAppState = async (state: IAppState): Promise<void> => {
    try {
        const serializedState = {
            ...state,
            habits: state.habits.map(habit => ({
                ...habit,
                tags: habit.tags || [], // Ensure tags is always an array
                recurrence: habit.recurrence ? {
                    ...habit.recurrence,
                    time: habit.recurrence.time
                        ? new Date(habit.recurrence.time).toISOString()
                        : undefined
                } : null,
                createdAt: new Date(habit.createdAt).toISOString(),
                updatedAt: new Date().toISOString()
            }))
        };

        await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(serializedState));

        console.log("Estado guardado exitosamente.");
    } catch (e) {
        console.error("Error al guardar el estado de la app:", e);
    }
};

// Función extra para limpiar para pruebas
export const clearAppState = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(APP_STATE_KEY);
        console.log("AsyncStorage limpiado.");
    } catch (e) {
        console.error("Error al limpiar AsyncStorage:", e);
    }
};