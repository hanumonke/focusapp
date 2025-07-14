import PointsBadge from '@/components/PointsBadge';
import { createNotificationChannels } from '@/utils/notificationService';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3LightTheme, PaperProvider, useTheme } from 'react-native-paper';
import { es, registerTranslation } from 'react-native-paper-dates';
import Icon from '@expo/vector-icons/MaterialCommunityIcons'; 
registerTranslation('es', es);

// Tema personalizado siguiendo buenas prácticas de UI/UX
const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Colores principales
    primary: '#88D7FE',
    primaryContainer: '#E3F4FF',
    onPrimary: '#1A1C1E',
    onPrimaryContainer: '#1A1C1E',

    // Colores secundarios
    secondary: '#FFA4A3',
    secondaryContainer: '#FFE8E8',
    onSecondary: '#1A1C1E',
    onSecondaryContainer: '#1A1C1E',

    // Colores terciarios (blanco y variaciones)
    tertiary: '#F8F9FA',
    tertiaryContainer: '#FFFFFF',
    onTertiary: '#1A1C1E',
    onTertiaryContainer: '#1A1C1E',

    // Colores de error
    error: '#DC3545',
    errorContainer: '#FFEBEE',
    onError: '#FFFFFF',
    onErrorContainer: '#1A1C1E',

    // Colores de fondo y superficie
    background: '#FFFFFF',
    onBackground: '#2C3E50',
    surface: '#FFFFFF',
    onSurface: '#2C3E50',
    surfaceVariant: '#F8F9FA',
    onSurfaceVariant: '#5A6C7D',

    // Colores de contorno
    outline: '#E1E8ED',
    outlineVariant: '#CBD5E0',

    // Colores de sombra y elevación
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#2C3E50',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#88D7FE',

    // Sistema de elevación
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F8F9FA',
      level3: '#F1F3F4',
      level4: '#E8EAED',
      level5: '#DADCE0',
    },
  },
};


export default function RootLayout() {
  useEffect(() => {
    createNotificationChannels();
  }, []);

  // Usar el hook de tema para los iconos
  const theme = customTheme;

  return (

    <PaperProvider theme={customTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>

        <Drawer
          screenOptions={{
            headerRight: () => <PointsBadge />,
            drawerActiveTintColor: theme.colors.primary,
            drawerInactiveTintColor: theme.colors.onSurfaceVariant,
          }}
        >
          <Drawer.Screen
            name='index'
            options={{
              drawerLabel: 'Pendientes',
              title: 'Pendientes',
              drawerIcon: ({ color, size }) => (
                <Icon name="clock-outline" color={color} size={size} />
              ),
            }}
          />




          <Drawer.Screen

            name="tasks/index" // Corresponde al directorio 'tasks'
            options={{
              drawerLabel: 'Mis Tareas',
              title: 'Mis Tareas', // Título de la cabecera cuando esta pantalla está activa
              drawerIcon: ({ color, size }) => (
                <Icon name="format-list-checks" color={color} size={size} />
              ),
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
              drawerLabel: 'Mis Hábitos',
              title: 'Mis Hábitos', // Título de la cabecera cuando esta pantalla está activa
              drawerIcon: ({ color, size }) => (
                <Icon name="repeat" color={color} size={size} />
              ),
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

          <Drawer.Screen
            name='settings'
            options={{
              drawerLabel: 'Ajustes',
              title: 'Ajustes',
              drawerIcon: ({ color, size }) => (
                <Icon name="cog-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen

            name="help" // Corresponde al archivo 'Help'
            options={{
              drawerLabel: 'Ayuda',
              title: 'Ayuda', // Título de la cabecera cuando esta pantalla está activa
              drawerIcon: ({ color, size }) => (
                <Icon name="help-circle-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Tips"
            options={{
              drawerLabel: 'Tips',
              title: 'Tips',
              drawerIcon: ({ color, size }) => (
                <Icon name="lightbulb-on-outline" color={color} size={size} />
              ),
            }}
          />
        </Drawer>



      </GestureHandlerRootView>
    </PaperProvider>
  );
}
