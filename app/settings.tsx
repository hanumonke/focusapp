import { setCustomSound } from '@/utils/customSoundService';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Divider, Switch, useTheme, Text, List, IconButton, Menu } from 'react-native-paper';

// Implement dark layout
// delete backup section
// Create user info section

const SettingsScreen = () => {
    const theme = useTheme();
    const [notificationsMode, setNotificationsMode] = useState('quiet');
    const [sound, setSound] = useState('default');
    const [soundMenuVisible, setSoundMenuVisible] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleSetSound = async () => {

        setCustomSound();
    };


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

            {/* <List.Section>
                <List.Subheader style={[styles.subheader, { color: theme.colors.primary }]}>
                    Notifications
                </List.Subheader>

                <List.Item
                    title="Alarming notifications"
                    description="Play sound even when device is silent"
                    left={props => <List.Icon {...props} icon="bell-alert" />}
                    right={() => (
                        <Switch
                            value={notificationsMode !== 'quiet'}
                            onValueChange={() => setNotificationsMode(notificationsMode === 'quiet' ? 'alarm' : 'quiet')}
                        />
                    )}
                />

                <List.Item
                    title="Default Sound"
                    description={sound}
                    left={props => <List.Icon {...props} icon="music" />}
                    right={() => (
                        <Button onPress={handleSetSound}>Custom</Button>
                    )}
                />
            </List.Section>
            <Divider /> */}

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