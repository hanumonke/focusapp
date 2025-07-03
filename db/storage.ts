// src/services/dataService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitsState, SettingsState, TasksState } from './types';

// Claves separadas para cada parte del estado
export const STORAGE_KEYS = {
  TASKS: '@Fokus:Tasks',
  HABITS: '@Fokus:Habits',
  SETTINGS: '@Fokus:Settings',
};

// --- TASKS ---
export const loadTasks = async (): Promise<TasksState> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error al cargar tareas:", e);
    return [];
  }
};

export const saveTasks = async (tasks: TasksState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error("Error al guardar tareas:", e);
  }
};

// --- HABITS ---
export const loadHabits = async (): Promise<HabitsState> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error al cargar hábitos:", e);
    return [];
  }
};

export const saveHabits = async (habits: HabitsState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error("Error al guardar hábitos:", e);
  }
};

// --- SETTINGS ---
export const loadSettings = async (): Promise<SettingsState> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return jsonValue
      ? JSON.parse(jsonValue)
      : {
          theme: 'light',
          enableNotifications: true,
          defaultNotificationSound: 'default',
        };
  } catch (e) {
    console.error("Error al cargar configuración:", e);
    return {
      theme: 'light',
      enableNotifications: true,
      defaultNotificationSound: 'default',
    };
  }
};

export const saveSettings = async (settings: SettingsState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Error al guardar configuración:", e);
  }
};

// --- LIMPIAR TODO (para pruebas) ---
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TASKS,
      STORAGE_KEYS.HABITS,
      STORAGE_KEYS.SETTINGS,
    ]);
    console.log("AsyncStorage limpiado.");
  } catch (e) {
    console.error("Error al limpiar AsyncStorage:", e);
  }
};