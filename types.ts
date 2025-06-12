export type NotificationTriggerConfig =
    | { type: 'date'; date: string; } // Para una notificación única en una fecha/hora específica (ISO 8601)
    | { type: 'daily'; hour: number; minute: number; repeats: boolean; } // Para diaria a una hora específica
    | { type: 'weekly'; weekday: number; hour: number; minute: number; repeats: boolean; } // Para semanal en un día y hora específicos (weekday: 1-7, Lunes-Domingo para Expo)
    | { type: 'interval'; seconds: number; repeats: boolean; } // Para repetir cada X segundos
    | { // Para un control más fino del calendario, combinando propiedades
        type: 'calendar';
        repeats: boolean; // Indica si se repite o no
        year?: number;    // Propiedades opcionales para mayor control (ej. cada mes el día 15)
        month?: number;
        day?: number;
        weekday?: number; // 1-7 para Lunes-Domingo
        hour?: number;
        minute?: number;
        second?: number;
    };

export interface IScheduledNotification {
    id: string; 
    triggerConfig: NotificationTriggerConfig; // La configuración que define cuándo y cómo se dispara
    notificationId: string | null; // EL ID que devuelve expo-notifications al programarla (CRUCIAL para CANCELAR)
    message?: string; 
}

export interface ITask {
    id: string;
    title: string; 
    description: string; // Markdown
    dueDate: string | null; // ISO
    tags: string[]; 
    isCompleted: boolean; 
    scheduledNotifications: IScheduledNotification[]; 
}

export type HabitRecurrenceType = 'daily' | 'weekly' | 'custom';

export interface IHabitRecurrenceDetails {
    type: HabitRecurrenceType;
    daysOfWeek?: number[]; // Solo si type === 'weekly'. Array de números (0=Domingo, 1=Lunes, ..., 6=Sábado)
    interval?: number; // Para 'custom', ej: 2 para "cada 2 días"
    unit?: 'day' | 'week' | 'month'; // Para 'custom', la unidad del intervalo
}

export interface IHabit {
    id: string; 
    title: string;
    description: string; // Contenido Markdown
    tags: string[];
    recurrence: IHabitRecurrenceDetails; // Define cuándo se "espera" que se realice el hábito
    scheduledNotifications: IScheduledNotification[]; // Recordatorios para el hábito
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