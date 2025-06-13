import { Drawer } from 'expo-router/drawer';
import Ionicons from "@expo/vector-icons"; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1}}>
    
        <Drawer>
         <Drawer.Screen
        name="tasks" // Corresponde al directorio 'tasks'
        options={{
          drawerLabel: 'Mis Tareas',
          title: 'Mis Tareas', // Título de la cabecera cuando esta pantalla está activa
        }}
      />
        </Drawer>
   
    </GestureHandlerRootView>
  );
}
