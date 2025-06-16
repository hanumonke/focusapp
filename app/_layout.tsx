import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
export default function RootLayout() {

  return (
    
    <PaperProvider theme={MD3LightTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>

        <Drawer>
          <Drawer.Screen
            name="tasks/index" // Corresponde al directorio 'tasks'
            options={{
              drawerLabel: 'Mis Tareas',
              title: 'Mis Tareas', // Título de la cabecera cuando esta pantalla está activa
            }}
          />
          <Drawer.Screen
            name="tasks/new" // Corresponde al directorio 'tasks'
            options={{
              title: 'Agregar Tarea',
              drawerItemStyle: { display: 'none' },
              headerShown: false
            }}
          />
          <Drawer.Screen
            name="tasks/[id]" // Corresponde al directorio 'tasks'
            options={{
              drawerItemStyle: { display: 'none' },
              headerShown: false
            }}
          />
          {/* HABITS */}
          <Drawer.Screen
            name="habits/index" // Corresponde al directorio 'tasks'
            options={{
              drawerLabel: 'Mis Habitos',
              title: 'Mis Habitos', // Título de la cabecera cuando esta pantalla está activa
            }}
          />
          <Drawer.Screen
            name="habits/new" // Corresponde al directorio 'tasks'
            options={{
              drawerItemStyle: { display: 'none' },
              headerShown: false
            }}
          />
          <Drawer.Screen
            name="habits/[id]" // Corresponde al directorio 'tasks'
            options={{
              drawerItemStyle: { display: 'none' },
              headerShown: false
            }}
          />
        </Drawer>

      </GestureHandlerRootView>
    </PaperProvider>
  );
}
