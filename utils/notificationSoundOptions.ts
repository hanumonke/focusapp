export const NOTIFICATION_SOUNDS = {
    'default': {
        name: 'predeterminado',
        uri: 'default' // Expo usa 'default' para el sonido del sistema
    },
    'x8bit': {
        name: 'x8bit',
        uri: require('../assets/sounds/x8bit.mp3')
    },
    'x8bit02': {
        name: 'x8bit02',
        uri: require('../assets/sounds/x8bit02.mp3')
    },
    'alarm': {
        name: 'alarm',
        uri: require('../assets/sounds/alarm.mp3')
    },
    'campanas': {
        name: 'campanas',
        uri: require('../assets/sounds/campanas.mp3')
    },
    'clocktower': {
        name: 'clocktower',
        uri: require('../assets/sounds/clocktower.mp3')
    },
    'guerra': {
        name: 'guerra',
        uri: require('../assets/sounds/guerra.mp3')
    },
    'guitarra': {
        name: 'guitarra',
        uri: require('../assets/sounds/guitarra.mp3')
    },
    'hellooooyou': {
        name: 'hellooooyou',
        uri: require('../assets/sounds/hellooooyou.mp3')
    },
    'nuclearalarm': {
        name: 'nuclearalarm',
        uri: require('../assets/sounds/nuclearalarm.mp3')
    },
    'pipipipi': {
        name: 'pipipipi',
        uri: require('../assets/sounds/pipipipi.mp3')
    },
    'pupetfnaf': {
        name: 'pupetfnaf',
        uri: require('../assets/sounds/pupetfnaf.mp3')
    },
    'suspenso': {
        name: 'suspenso',
        uri: require('../assets/sounds/suspenso.mp3')
    },
    'tuntun': {
        name: 'tuntun',
        uri: require('../assets/sounds/tuntun.mp3')
    },
    'vibracion': {
        name: 'vibracion',
        uri: require('../assets/sounds/vibracion.mp3')
    },
    'xilofono': {
        name: 'xilofono',
        uri: require('../assets/sounds/xilofono.mp3')
    },
};

export type NotificationSoundKey = keyof typeof NOTIFICATION_SOUNDS;