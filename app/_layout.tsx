import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { storeData } from '@/db/store';
import db from '@/db/db.json'
import { useEffect } from 'react';
export default function RootLayout() {
  useEffect(() => {

    storeData(db, 'db')

  }, [])
  return (
    <GestureHandlerRootView style={{ flex: 1}}>
    
        <Drawer>
          <Drawer.Screen name="tasks/index" options={{ title: 'Tareas' }} />
        </Drawer>
   
    </GestureHandlerRootView>
  );
}
