export const NOTIFICATION_SOUNDS = {
    'default': {
        name: 'predeterminado',
        uri: 'default' // Expo usa 'default' para el sonido del sistema
    },
    'x8bit': {
        name: 'x8bit',
        uri: 'x8bit.wav' // Solo el nombre del archivo, no require()
    },
    'x8bit02': {
        name: 'x8bit02',
        uri: 'x8bit02.wav'
    },
    'alarm': {
        name: 'alarm',
        uri: 'alarm.wav'
    },
    'campanas': {
        name: 'campanas',
        uri: 'campanas.wav'
    },
    'clocktower': {
        name: 'clocktower',
        uri: 'clocktower.wav'
    },
    'guerra': {
        name: 'guerra',
        uri: 'guerra.wav'
    },
    'guitarra': {
        name: 'guitarra',
        uri: 'guitarra.wav'
    },
    'hellooooyou': {
        name: 'hellooooyou',
        uri: 'hellooooyou.wav'
    },
    'nuclearalarm': {
        name: 'nuclearalarm',
        uri: 'nuclearalarm.wav'
    },
    'pipipipi': {
        name: 'pipipipi',
        uri: 'pipipipi.wav'
    },
    'pupetfnaf': {
        name: 'pupetfnaf',
        uri: 'pupetfnaf.wav'
    },
    'suspenso': {
        name: 'suspenso',
            uri: 'suspenso.wav'
    },
    'tuntun': {
        name: 'tuntun',
        uri: 'tuntun.wav'
    },
    'vibracion': {
        name: 'vibracion',
        uri: 'vibracion.wav'
    },
    'xilofono': {
        name: 'xilofono',
        uri: 'xilofono.wav'
    },
};

export type NotificationSoundKey = keyof typeof NOTIFICATION_SOUNDS;

// Función helper para obtener el URI del sonido
export const getSoundUri = (soundKey: string): string => {
    if (soundKey === 'default') return 'default';
    return NOTIFICATION_SOUNDS[soundKey as NotificationSoundKey]?.uri || 'default';
};