import { Stack } from 'expo-router'; 

export default function TasksLayout () {
    return (
        <Stack>
             <Stack.Screen
        name="index" // Corresponde a app/(app)/tasks/index.tsx (la lista de tareas)
        options={{
          headerShown: false, // Ocultamos el header aquí porque el Drawer Navigator ya lo proporciona
        }}
      />
      <Stack.Screen
        name="new" // Corresponde a app/(app)/tasks/new.tsx (añadir tarea)
        options={{
          title: 'Nueva Tarea', // Título de la cabecera cuando se abre esta pantalla
        }}
      />
      <Stack.Screen
        name="[id]" // Corresponde a app/(app)/tasks/[id].tsx (editar tarea)
        options={{
          title: 'Editar Tarea', // Título por defecto (lo cambiaremos dinámicamente)
        }}
      />


        </Stack>
    )
}