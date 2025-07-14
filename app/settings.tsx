// TODO: play sample of sound
//TODO: verificar que se esta guardando la config

import { loadSettings, saveSettings } from '@/db/storage';
import { ISettingsState } from '@/db/types';
import { rescheduleAllNotifications } from '@/utils/notificationService';
import { NOTIFICATION_SOUNDS, NotificationSoundKey, getSoundUri } from '@/utils/notificationSoundOptions';
import { getAllScheduledNotificationsAsync } from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, List, Menu, Switch, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAudioPlayer} from "expo-audio"; 

// Implement dark layout
// delete backup section
// Create user info section

import { useGlobalStyles } from '@/utils/globalStyles';
import { getScheduledNotifications } from '@/utils/notificationService';

const SettingsScreen = () => {
    // const audioSource = require("../assets/sounds/hello.mp3")
    // const player = useAudioPlayer(audioSource); 
    const theme = useTheme();
    const global = useGlobalStyles();
    const [notificationsMode, setNotificationsMode] = useState('quiet');
    const [sound, setSound] = useState('default');
    const [sounds, setSounds] = useState(NOTIFICATION_SOUNDS)
    const [soundMenuVisible, setSoundMenuVisible] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [saveButtonActive, setSaveButtonActive] = useState(false);
    const [hard, setHard] = useState('')
    const [medium, setMedium] = useState('')
    const [easy, setEasy] = useState('')

    useEffect(() => {

        const loadSettingsState = async () => {
            try {
                const settings = await loadSettings();
                if (settings) {

                    const defaultSound = settings.defaultNotificationSound
                    if (defaultSound && defaultSound !== undefined) {
                        console.log("defaultSound: ", defaultSound);
                        setSound(defaultSound);

                    } else {
                        throw Error("error al cargar el sonido predeterminado")
                    }

                    const difficulty = settings.difficulty;

                    if (difficulty && difficulty !== undefined) {
                        console.log("difficulty: ", difficulty);
                        setHard(difficulty.hard.toString());
                        setMedium(difficulty.medium.toString());
                        setEasy(difficulty.easy.toString());


                    } else {
                        throw Error("error al cargar las dificultades")
                    }
                } else {
                    throw Error("error al cargar la configuracion");
                }

            } catch (error) {
                console.error(error)
            }


        }
        loadSettingsState();
    }, [])


    const saveDifficulty = async () => {

        try {
            const settings = await loadSettings();
            if (settings) {
                const newSettings: ISettingsState = { ...settings, 
                                                        difficulty: { hard: Number(hard), 
                                                                      medium: Number(medium), 
                                                                      easy: Number(easy) } 
                                                    }
                await saveSettings(newSettings); 
            }


        } catch (error) {
            console.error(error); 
        }

    }



    const handleSetSound = (key: NotificationSoundKey) => {
        setSaveButtonActive(true);
        console.log(`Selected sound key: ${key}`);
        setSound(key);
        setSoundMenuVisible(false);

        // player.replace({uri: sounds[key].uri})
        // player.play(); 

    };


    const saveDefaultSound = async (soundKey: string) => {
        // save the sound
        try {
            const settingsState = await loadSettings();
            await saveSettings({
                ...settingsState,
                defaultNotificationSound: soundKey // Guardar la clave, no el URI
            })
            console.log(`Sound updated to: ${soundKey}`);
        } catch (error) {
            console.error(error)
        }

    }

    const handleSaveSound = async () => {
        console.log("SAVING:", sound)
        try {

            await saveDefaultSound(sound);

            const settings = await loadSettings();
            console.log(settings.defaultNotificationSound);
            setSaveButtonActive(false);
            // UPDATE ALL NOTIFICATION SOUNDS?
            await rescheduleAllNotifications();
            const notifications = await getAllScheduledNotificationsAsync();
            notifications.forEach(n => console.log(n));
        } catch (error) {
            console.error(error);
        }
    }

    const checkScheduledNotifications = async () => {
      try {
        const notifications = await getScheduledNotifications();
        console.log('=== SCHEDULED NOTIFICATIONS ===');
        console.log(`Total: ${notifications.length}`);
        notifications.forEach((notification, index) => {
          console.log(`${index + 1}. ID: ${notification.identifier}`);
          console.log(`   Title: ${notification.content.title}`);
          console.log(`   Body: ${notification.content.body}`);
          console.log(`   Trigger: ${JSON.stringify(notification.trigger)}`);
          console.log('---');
        });
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    const debugSoundSettings = async () => {
        try {
            const settings = await loadSettings();
            console.log('=== SOUND SETTINGS DEBUG ===');
            console.log(`Default sound key: ${settings.defaultNotificationSound}`);
            console.log(`Sound URI: ${getSoundUri(settings.defaultNotificationSound || 'default')}`);
            
            // Verificar notificaciones programadas
            const notifications = await getScheduledNotifications();
            console.log(`Scheduled notifications: ${notifications.length}`);
            notifications.forEach((notification, index) => {
                console.log(`${index + 1}. Sound: ${notification.content.sound}`);
            });
        } catch (error) {
            console.error('Error debugging sound settings:', error);
        }
    };


    return (
        <SafeAreaView edges={['bottom']} style={global.container}>
            <ScrollView contentContainerStyle={[global.container, { paddingBottom: 32 }]}
              keyboardShouldPersistTaps="handled"
            >
                <List.Section>
                    <List.Subheader style={[styles.subheader, { color: '#666666' }]}>Apariencia</List.Subheader>
                    <List.Item
                        title="Modo oscuro"
                        left={props => <List.Icon {...props} icon="theme-light-dark" />}
                        right={() => (
                            <Switch
                                value={isDarkMode}
                                onValueChange={() => setIsDarkMode(!isDarkMode)}
                            />
                        )}
                    />
                </List.Section>
                <Divider />

                <List.Section>
                    <List.Subheader style={[styles.subheader, { color: '#666666' }]}>Notificationes</List.Subheader>
                    <Menu
                        visible={soundMenuVisible}
                        onDismiss={() => setSoundMenuVisible(false)}
                        anchor={<List.Item
                            title="Sonido por defecto"
                            description={sound}
                            left={props => <List.Icon {...props} icon="music" />}
                            right={() => (
                                <>
                                    <Button 
                                      mode="outlined"
                                      onPress={() => setSoundMenuVisible(true)}
                                      textColor={theme.colors.onSurface}
                                      style={{ borderColor: theme.colors.outline }}
                                    >
                                      Seleccionar
                                    </Button>
                                    <Button 
                                      mode="contained" 
                                      onPress={handleSaveSound} 
                                      disabled={!saveButtonActive}
                                      buttonColor={theme.colors.primary}
                                      textColor={theme.colors.onPrimary}
                                    >
                                      Guardar
                                    </Button>
                                </>
                            )}
                        />}>
                        <FlatList
                            style={{ maxHeight: 250 }}
                            data={Object.keys(sounds)}
                            renderItem={({ item }) => {
                                return <Menu.Item onPress={() => handleSetSound(item as NotificationSoundKey)} title={item} />
                            }}
                        />
                    </Menu>
                </List.Section>
                <Divider />

                <List.Section>
                    <List.Subheader style={[styles.subheader, { color: '#666666' }]}>Dificultad</List.Subheader>
                    <View style={{ gap: 12, padding: 16 }}>
                        <TextInput label="Dificil" keyboardType='numeric' value={hard} onChangeText={setHard} style={global.input} mode="outlined" />
                        <TextInput label="Medio" keyboardType='numeric' value={medium} onChangeText={setMedium} style={global.input} mode="outlined" />
                        <TextInput label="Facil" keyboardType='numeric' value={easy} onChangeText={setEasy} style={global.input} mode="outlined" />
                        <Button
                            mode="contained"
                            icon="content-save"
                            style={[global.button, { alignSelf: 'center', minWidth: 160, justifyContent: 'center' }]}
                            contentStyle={{ justifyContent: 'center', alignItems: 'center' }}
                            labelStyle={{ textAlign: 'center', width: '100%' }}
                            onPress={saveDifficulty}
                            buttonColor={theme.colors.secondary}
                            textColor={theme.colors.onSecondary}
                        >
                            Guardar
                        </Button>
                    </View>
                </List.Section>
                <Divider />

                {/*
                <List.Section>
                    <List.Subheader style={[styles.subheader, { color: '#666666' }]}>Cuenta</List.Subheader>
                    <List.Item
                        title="Información de usuario"
                        description="Ver y editar tu perfil"
                        left={props => <List.Icon {...props} icon="account" />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                    />
                </List.Section>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Versión de la app 1.0.0</Text>
                </View>
                <Button 
                  mode="outlined" 
                  onPress={checkScheduledNotifications}
                  style={[{ marginTop: 16 }, { borderColor: theme.colors.outline }]}
                  textColor={theme.colors.onSurface}
                >
                  Debug: Check Notifications
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={debugSoundSettings}
                  style={[{ marginTop: 16 }, { borderColor: theme.colors.outline }]}
                  textColor={theme.colors.onSurface}
                >
                  Debug: Check Sound Settings
                </Button>
                */}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    subheader: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
    },
    button: {
        marginHorizontal: 8,
        borderRadius: 8,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    versionText: {
        opacity: 0.6,
        fontStyle: 'italic',
    },
});

export default SettingsScreen; 