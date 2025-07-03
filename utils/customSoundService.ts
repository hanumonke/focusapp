import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
// TODO Research about setting sounds notification
import NotificationSounds, { playSampleSound } from  'react-native-notification-sounds';


export const setCustomSound = async () => {

    try {
        console.log("EPA")
        const arrayOfNotifications = await NotificationSounds.getNotifications('notification'); 
        console.log("SOUNDS", arrayOfNotifications); 
        playSampleSound(arrayOfNotifications[1]); 
        
    } catch (error) {
       
    }
}