// TODO: play sample of sound
//TODO: verificar que se esta guardando la config

import { loadSettings, saveSettings } from '@/db/storage';
import { rescheduleAllNotifications } from '@/utils/notificationService';
import { NOTIFICATION_SOUNDS, NotificationSoundKey } from '@/utils/notificationSoundOptions';
import { getAllScheduledNotificationsAsync } from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Button, Divider, Switch, useTheme, Text, List, IconButton, Menu } from 'react-native-paper';
// import { useAudioPlayer} from "expo-audio"; 

// Implement dark layout
// delete backup section
// Create user info section

const SettingsScreen = () => {
    // const audioSource = require("../assets/sounds/hello.mp3")
    // const player = useAudioPlayer(audioSource); 
    const theme = useTheme();
    const [notificationsMode, setNotificationsMode] = useState('quiet');
    const [sound, setSound] = useState('default');
    const [sounds, setSounds] = useState(NOTIFICATION_SOUNDS)
    const [soundMenuVisible, setSoundMenuVisible] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [saveButtonActive, setSaveButtonActive] = useState(false);

    useEffect(() => {
        const loadSound = async () => {
            try {
                
                const settingsState = await loadSettings(); 
                const defaultSound = settingsState.defaultNotificationSound
                if (!defaultSound) throw Error("Error cargando el mensaje") ; 
                console.log("Sonido actual: ", defaultSound);
                setSound(defaultSound); 
            } catch (error) {
                console.log(error)
            }

        }
        loadSound(); 
    }, [])

    const handleSetSound = (key: NotificationSoundKey) => {
    setSaveButtonActive(true); 
    if (sounds[key] !== undefined || null ) console.log(key)
    const { uri } = sounds[key]; 
    console.log("Sonido nuevo: ", uri); 
    setSound(key); 

    setSoundMenuVisible(false); 
    
    // player.replace({uri: sounds[key].uri})
    // player.play(); 

    };


    const saveDefaultSound = async (soundUri: string) => {
        // save the sound
        try {
            const settingsState = await loadSettings(); 
            await saveSettings({
                ...settingsState, 
                defaultNotificationSound: soundUri
            })
            console.log("SOUND UPDATED")
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



    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <List.Section>
                <List.Subheader style={[styles.subheader, { color: theme.colors.primary }]}>
                    Apariencia
                </List.Subheader>

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
                <List.Subheader style={[styles.subheader, { color: theme.colors.primary }]}>
                    Notifications
                </List.Subheader>

                {/* <List.Item
                    title="Alarming notifications"
                    description="Play sound even when device is silent"
                    left={props => <List.Icon {...props} icon="bell-alert" />}
                    right={() => (
                        <Switch
                            value={notificationsMode !== 'quiet'}
                            onValueChange={() => setNotificationsMode(notificationsMode === 'quiet' ? 'alarm' : 'quiet')}
                        />
                    )}
                /> */}
        

                <Menu
                    
                    visible={soundMenuVisible}
                    onDismiss={() => setSoundMenuVisible(false)}
                    anchor={<List.Item
                        title="Default Sound"
                        description={sound}
                        left={props => <List.Icon {...props} icon="music" />}
                        right={() => (
                            <>
                            <Button onPress={() => setSoundMenuVisible(true)}>Custom</Button>
                            <Button mode='contained' onPress={handleSaveSound} disabled={!saveButtonActive}>Save</Button>
                            </>
                        )}
                    />}>

                    <FlatList 
                        style={{maxHeight: 250}}
                        data={Object.values(sounds)}
                        renderItem={({item}) => {
                            return <Menu.Item onPress={() => handleSetSound(item.name as NotificationSoundKey)} title={item.name} />
                        }}
                    
                    />


                </Menu>

   


            </List.Section>
            <Divider />

            {/* <List.Section>
                <List.Subheader style={[styles.subheader, { color: theme.colors.primary }]}>
                    Data Management
                </List.Subheader>

                <List.Item
                    title="Backup & Restore"
                    description="Save or load your data"
                    left={props => <List.Icon {...props} icon="cloud-upload" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                />

                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        icon="content-save"
                        style={styles.button}
                        onPress={() => console.log('Save backup')}
                    >
                        Create Backup
                    </Button>

                    <Button
                        mode="outlined"
                        icon="cloud-download"
                        style={styles.button}
                        onPress={() => console.log('Restore backup')}
                    >
                        Restore Backup
                    </Button>
                </View>
            </List.Section>
            <Divider /> */}

            <List.Section>
                <List.Subheader style={[styles.subheader, { color: theme.colors.primary }]}>
                    Cuenta
                </List.Subheader>

                <List.Item
                    title="Información de usuario"
                    description="Ver y editar tu perfil"
                    left={props => <List.Icon {...props} icon="account" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                />

                {/* <List.Item
                    title="Privacy Settings"
                    description="Manage your privacy preferences"
                    left={props => <List.Icon {...props} icon="lock" />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                /> */}
            </List.Section>

            <View style={styles.footer}>
                <Text style={styles.versionText}>Versión de la app 1.0.0</Text>
            </View>
        </ScrollView>
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