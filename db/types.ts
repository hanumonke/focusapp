export interface IReminder {
    timestamp: string; // ISO 8601 execution time
    message: string;
    sound: string; // Notification sound
}

export interface ITask {
    id: string;
    title: string;
    description: string; // Markdown
    dueDate: string | null; // ISO
    tags: string[];
    isCompleted: boolean;
    reminders: IReminder[];
}
export type HabitRecurrenceType = 'daily' | 'weekly' | 'custom';

export interface IHabitRecurrence {
    type: HabitRecurrenceType;
    daysOfWeek?: number[]; // Solo si type === 'weekly'. Array de números (0=Domingo, 1=Lunes, ..., 6=Sábado)
    interval?: number; // Para 'custom', ej: 2 para "cada 2 días"
    unit?: 'day' | 'hour'; // Para 'custom', la unidad del intervalo
    time?: Date
}


export interface IHabitNotificationSettings {
    before?: IReminder; // Recordatorio antes de la hora
    onTime?: IReminder; // Recordatorio puntual
}

export interface IHabit {
    id: string;
    title: string;
    description: string; // Contenido Markdown
    tags: string[];
    recurrence: IHabitRecurrence | null; // Define cuándo se "espera" que se realice el hábito
    notificationSettings: IHabitNotificationSettings; // <--- NUEVO
    currentStreak: number; // Racha actual de días consecutivos completados
    bestStreak: number;    // Mejor racha histórica
    lastCompletedDate: string | null; // Fecha (ISO 8601, solo YYYY-MM-DD) de la última vez que se marcó como completado
    completionHistory: string[]; // Array de fechas (ISO 8601, solo YYYY-MM-DD) cuando el hábito fue completado
    createdAt: string; // Fecha de creación (ISO 8601)
    updatedAt: string; // Fecha de última actualización (ISO 8601)
}

export type IPendingItem = (ITask | IHabit) & {
    sortKey: string; // Para ordenar la lista (fecha/hora más próxima primero)
    itemType: 'task' | 'habit'; // Para saber qué tipo de ítem es al renderizarlo en la lista
    isDueToday?: boolean; // Para hábitos, indica si está debido hoy (útil para la interfaz)
};


// ESTADO GLOBAL


export interface IAppState {
    tasks: ITask[];   // Un array de todas tus tareas
    habits: IHabit[]; // Un array de todos tus hábitos
    settings: {       // Tus configuraciones de la app
        theme: 'light' | 'dark';
        enableNotifications: boolean;
        defaultNotificationSound: string;
    };
}

export const initialAppState: IAppState = {
    tasks: [],
    habits: [],
    settings: {
        theme: 'light',
        enableNotifications: true,
        defaultNotificationSound: 'default',
    },
};