// src/app/pendientes/index.tsx
import { loadHabits, loadPoints, loadSettings, loadTasks, saveHabits, savePoints, saveTasks } from '@/db/storage';
import { IHabit, ITask } from '@/db/types';
import { useGlobalStyles } from '@/utils/globalStyles';
import { formatDueDate } from '@/utils/helpers';
import { cancelNotificationsForItem } from '@/utils/notificationService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Modal, Portal, Searchbar, Text, useTheme } from 'react-native-paper';

// Tipos simples para items pendientes
type PendingTask = ITask & { type: 'task' };
type PendingHabit = IHabit & { type: 'habit' };
type PendingItem = PendingTask | PendingHabit;

const Pendientes = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [overdueModalVisible, setOverdueModalVisible] = useState(false);
  const [overdueItems, setOverdueItems] = useState<PendingItem[]>([]);
  const [hasCheckedOverdue, setHasCheckedOverdue] = useState(false);
  const theme = useTheme();
  const global = useGlobalStyles();

  // Cargar datos
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedTasks, loadedHabits] = await Promise.all([loadTasks(), loadHabits()]);
      setTasks(loadedTasks);
      setHabits(loadedHabits);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar items vencidos al cargar la pantalla
  useFocusEffect(
    useCallback(() => {
      setHasCheckedOverdue(false); // Resetear para nueva verificación
      loadData();
    }, [loadData])
  );

  // Verificar items vencidos después de cargar datos
  React.useEffect(() => {
    console.log('=== useEffect triggered ===');
    console.log('Loading:', loading);
    console.log('Tasks length:', tasks.length);
    console.log('Habits length:', habits.length);
    console.log('Has checked overdue:', hasCheckedOverdue);
    
    if (!loading && (tasks.length > 0 || habits.length > 0) && !hasCheckedOverdue) {
      console.log('Calling checkOverdueItems...');
      checkOverdueItems();
      setHasCheckedOverdue(true);
    } else {
      console.log('Not calling checkOverdueItems - conditions not met');
    }
  }, [loading, tasks, habits, hasCheckedOverdue]);

  // Función principal para verificar items vencidos
  const checkOverdueItems = () => {
    console.log('=== CHECKING OVERDUE ITEMS ===');
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
    console.log('Current time:', now.toISOString());
    console.log('Today:', today);

    // Tareas vencidas (no completadas y fecha pasada)
    const overdueTasks: PendingTask[] = tasks
      .filter(task => !task.isCompleted && task.dueDate)
      .filter(task => {
        const dueDate = new Date(task.dueDate!);
        return dueDate < now;
      })
      .map(task => ({ ...task, type: 'task' as const }));

    console.log('Overdue tasks found:', overdueTasks.length);

    // Hábitos vencidos (no completados hoy y hora pasada)
    const overdueHabits: PendingHabit[] = habits
      .filter(habit => {
        console.log(`Checking habit: ${habit.title}`);
        console.log(`  Last completed: ${habit.lastCompletedDate}`);
        console.log(`  Time: ${habit.recurrence.time}`);
        
        // No completado hoy
        const lastCompletedToday = habit.lastCompletedDate?.slice(0, 10) === today;
        console.log(`  Completed today: ${lastCompletedToday}`);
        
        if (lastCompletedToday) {
          console.log(`  Skipping - completed today`);
          return false;
        }
        
        // Verificar si ya pasó la hora programada
        try {
          const [hours, minutes] = habit.recurrence.time.split(':').map(Number);
          const scheduledTime = new Date();
          scheduledTime.setHours(hours, minutes, 0, 0);
          const isOverdue = now > scheduledTime;
          console.log(`  Scheduled time: ${scheduledTime.toISOString()}`);
          console.log(`  Is overdue: ${isOverdue}`);
          return isOverdue;
        } catch {
          console.log(`Invalid time format for habit: ${habit.title}`);
          return false;
        }
      })
      .map(habit => ({ ...habit, type: 'habit' as const }));

    console.log('Overdue habits found:', overdueHabits.length);

    const allOverdue = [...overdueTasks, ...overdueHabits];
    console.log('Total overdue items:', allOverdue.length);
    
    setOverdueItems(allOverdue);

    if (allOverdue.length > 0) {
      console.log('Setting modal visible to true');
      setOverdueModalVisible(true);
    } else {
      console.log('No overdue items, modal stays closed');
    }
  };

  // Completar tarea
  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Actualizar tarea como completada
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: true } : t
    );
    await saveTasks(updatedTasks);
    setTasks(updatedTasks);

    // Sumar puntos
    const settings = await loadSettings();
    const points = await loadPoints();
    const pointsToAdd = settings.difficulty[task.difficulty || 'medium'];
    await savePoints(points + pointsToAdd);

    // Remover del modal
    removeFromOverdue(taskId);
  };

  // Completar hábito
  const completeHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Calcular nueva racha
    const lastCompleted = habit.lastCompletedDate?.slice(0, 10);
    const newStreak = lastCompleted === yesterday ? habit.currentStreak + 1 : 1;

    // Actualizar hábito
    const updatedHabits = habits.map(h => 
      h.id === habitId ? {
        ...h,
        currentStreak: newStreak,
        bestStreak: Math.max(h.bestStreak, newStreak),
        lastCompletedDate: new Date().toISOString()
      } : h
    );
    await saveHabits(updatedHabits);
    setHabits(updatedHabits);

    // Remover del modal
    removeFromOverdue(habitId);
  };

  // Salvar racha de hábito vencido
  const saveStreak = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const cost = 50; // Costo en puntos
    const points = await loadPoints();

    if (points < cost) {
      Alert.alert('Puntos insuficientes', `Necesitas ${cost} puntos para salvar tu racha.`);
      return;
    }

    Alert.alert(
      '¿Salvar racha?',
      `¿Gastar ${cost} puntos para salvar tu racha de ${habit.currentStreak} días?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: async () => {
            // Descontar puntos
            await savePoints(points - cost);

            // Marcar como completado ayer para mantener la racha
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            const updatedHabits = habits.map(h => 
              h.id === habitId ? { ...h, lastCompletedDate: yesterday } : h
            );
            await saveHabits(updatedHabits);
            setHabits(updatedHabits);

            // Remover del modal
            removeFromOverdue(habitId);
          }
        }
      ]
    );
  };

  // Eliminar item del modal
  const removeFromOverdue = (itemId: string) => {
    const newOverdue = overdueItems.filter(item => item.id !== itemId);
    setOverdueItems(newOverdue);
    
    if (newOverdue.length === 0) {
      setOverdueModalVisible(false);
    }
  };

  // Eliminar item completamente
  const deleteItem = async (itemId: string) => {
    const task = tasks.find(t => t.id === itemId);
    const habit = habits.find(h => h.id === itemId);

    if (task) {
      // Para tareas: eliminar completamente
      await cancelNotificationsForItem(itemId);
      const updatedTasks = tasks.filter(t => t.id !== itemId);
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } else if (habit) {
      // Para hábitos: resetear racha como penalización
      Alert.alert(
        '¿Resetear racha?',
        `¿Estás seguro de que no quieres salvar la racha de "${habit.title}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Si',
            style: 'destructive',
            onPress: async () => {
              // Cerrar modal primero para evitar bucle
              removeFromOverdue(itemId);
              
              // Luego actualizar el hábito: resetear racha Y marcar como completado hoy
              const updatedHabits = habits.map(h => 
                h.id === itemId ? { 
                  ...h, 
                  currentStreak: 0,
                  lastCompletedDate: new Date().toISOString() // Marcar como completado hoy
                } : h
              );
              await saveHabits(updatedHabits);
              setHabits(updatedHabits);
            }
          }
        ]
      );
      return; // No continuar con removeFromOverdue aquí
    }

    removeFromOverdue(itemId);
  };

  // Obtener items pendientes para mostrar en la lista
  const getPendingItems = (): PendingItem[] => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const todayDay = now.getDay(); // 0=Domingo, 1=Lunes, ...

    const pendingTasks: PendingTask[] = tasks
      .filter(task => !task.isCompleted)
      .map(task => ({ ...task, type: 'task' as const }));

    const pendingHabits: PendingHabit[] = habits
      .filter(habit => {
        // No mostrar si ya fue completado hoy
        if (habit.lastCompletedDate?.slice(0, 10) === today) return false;
        // Solo mostrar si está programado para hoy
        if (habit.recurrence.type === 'daily') {
          return true;
        } else if (habit.recurrence.type === 'weekly') {
          // daysOfWeek: [0,1,2,3,4,5,6] (Domingo a Sábado)
          // Fix: todayDay may be a number, but .includes expects DayNumber type
          return habit.recurrence.daysOfWeek?.includes(todayDay as any);
        }
        return false;
      })
      .map(habit => ({ ...habit, type: 'habit' as const }));

    return [...pendingTasks, ...pendingHabits];
  };

  // Verificar si un hábito está vencido
  const isHabitOverdue = (habit: PendingHabit): boolean => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    
    // Si ya está completado hoy, no está vencido
    if (habit.lastCompletedDate?.slice(0, 10) === today) return false;
    
    // Verificar si ya pasó la hora programada
    try {
      const [hours, minutes] = habit.recurrence.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      return now > scheduledTime;
    } catch {
      return false;
    }
  };

  // Renderizar item individual
  const renderItem = ({ item }: { item: PendingItem }) => (
    <Card style={[global.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={global.header}>
          <Avatar.Icon
            size={44}
            icon={item.type === 'task' ? 'format-list-checks' : 'repeat'}
            style={{
              backgroundColor: item.type === 'task' 
                ? theme.colors.surfaceVariant 
                : theme.colors.primaryContainer
            }}
          />
          <View style={global.info}>
            <Text variant="titleMedium">{item.title}</Text>
            <Text variant="bodySmall" style={global.secondaryText}>
              {item.type === 'task' 
                ? `Vence: ${formatDueDate(item.dueDate)}`
                : `Hora: ${item.recurrence.time}`
              }
            </Text>
          </View>
          <Chip mode="outlined" style={global.chip}>
            {item.type === 'task' ? 'Tarea' : 'Hábito'}
          </Chip>
        </View>

        {item.description && (
          <Text variant="bodyMedium" numberOfLines={2} style={global.description}>
            {item.description}
          </Text>
        )}

        {item.tags?.length > 0 && (
          <View style={global.tags}>
            {item.tags.map((tag, i) => (
              <Chip key={i} mode="outlined" style={global.tag}>
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>

      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => router.push(`/${item.type === 'task' ? 'tasks' : 'habits'}/${item.id}`)}
          textColor={theme.colors.onSurface}
          style={{ borderColor: theme.colors.outline }}
        >
          Detalles
        </Button>
        
        {item.type === 'task' ? (
          <Button 
            mode="contained" 
            onPress={() => completeTask(item.id)}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
          >
            Completar
          </Button>
        ) : (
          <Button 
            mode="contained" 
            onPress={() => completeHabit(item.id)}
            buttonColor={theme.colors.secondary}
            textColor={theme.colors.onSecondary}
            disabled={
              item.lastCompletedDate?.slice(0, 10) === new Date().toISOString().slice(0, 10) ||
              isHabitOverdue(item)
            }
          >
            Completar
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={global.centered}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  const filteredItems = getPendingItems().filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={global.container}>
      {/* Modal de items vencidos */}
      <Portal>
        <Modal
          visible={overdueModalVisible}
          onDismiss={() => setOverdueModalVisible(false)}
          contentContainerStyle={global.modal}
        >
          <Text variant="titleLarge" style={global.modalTitle}>
            Items vencidos ({overdueItems.length})
          </Text>

          {overdueItems.map(item => (
            <Card key={item.id} style={global.modalCard}>
              <Card.Content>
                <Text variant="bodyLarge">{item.title}</Text>
                <Text variant="bodySmall">
                  {item.type === 'task' 
                    ? `Vence: ${formatDueDate(item.dueDate)}`
                    : `Programado: ${item.recurrence.time}`
                  }
                </Text>
                <Chip mode="outlined" style={global.chip}>
                  {item.type === 'task' ? 'Tarea' : 'Hábito'}
                </Chip>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="outlined"
                  onPress={() => deleteItem(item.id)}
                  textColor={theme.colors.onSurface}
                  style={{ borderColor: theme.colors.outline }}
                >
                  {item.type === 'habit' ? 'Cerrar' : 'Eliminar'}
                </Button>
                {item.type === 'task' ? (
                  <Button 
                    mode="contained" 
                    onPress={() => completeTask(item.id)}
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.onPrimary}
                  >
                    Completar
                  </Button>
                ) : (
                  <Button 
                    mode="contained" 
                    onPress={() => saveStreak(item.id)}
                    buttonColor={theme.colors.secondary}
                    textColor={theme.colors.onSecondary}
                  >
                    Salvar racha (50 pts)
                  </Button>
                )}
              </Card.Actions>
            </Card>
          ))}

          <Button
            mode="outlined"
            onPress={() => setOverdueModalVisible(false)}
            style={[global.modalButton, { borderColor: theme.colors.outline }]}
            textColor={theme.colors.onSurface}
          >
            Cerrar
          </Button>
        </Modal>
      </Portal>

      {/* Botón de debug */}
      {/* <Button 
        onPress={() => {
          console.log('=== DEBUG OVERDUE ===');
          console.log('Tasks loaded:', tasks.length);
          console.log('Habits loaded:', habits.length);
          console.log('Overdue items:', overdueItems.length);
          console.log('Modal visible:', overdueModalVisible);
          
          const now = new Date();
          const today = now.toISOString().slice(0, 10);
          console.log('Current time:', now.toISOString());
          console.log('Today:', today);
          
          // Debug tasks
          tasks.forEach(task => {
            if (!task.isCompleted && task.dueDate) {
              const dueDate = new Date(task.dueDate);
              const isOverdue = dueDate < now;
              console.log(`Task: ${task.title}, Due: ${dueDate.toISOString()}, Overdue: ${isOverdue}`);
            }
          });
          
          // Debug habits
          habits.forEach(habit => {
            const lastCompleted = habit.lastCompletedDate?.slice(0, 10);
            const completedToday = lastCompleted === today;
            console.log(`Habit: ${habit.title}`);
            console.log(`  Time: ${habit.recurrence.time}`);
            console.log(`  Last completed: ${lastCompleted}`);
            console.log(`  Completed today: ${completedToday}`);
            
            if (!completedToday) {
              try {
                const [hours, minutes] = habit.recurrence.time.split(':').map(Number);
                const scheduledTime = new Date();
                scheduledTime.setHours(hours, minutes, 0, 0);
                const isOverdue = now > scheduledTime;
                console.log(`  Scheduled: ${scheduledTime.toISOString()}`);
                console.log(`  Is overdue: ${isOverdue}`);
              } catch (error) {
                console.log(`  Error parsing time: ${error}`);
              }
            }
          });
          
          // Force check overdue
          checkOverdueItems();
        }}
        mode="outlined"
        style={[{ marginBottom: 10 }, { borderColor: theme.colors.outline }]}
        textColor={theme.colors.onSurface}
      >
        Debug Overdue
      </Button> */}

      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={global.input}
      />

      {/* Lista de items pendientes */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={global.container}
        ListEmptyComponent={
          <View style={global.emptyContainer}>
            <Text variant="titleMedium">No hay items pendientes</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  secondaryText: {
    opacity: 0.8,
    fontSize: 13,
  },
  description: {
    opacity: 0.8,
    lineHeight: 20,
    marginTop: 8,
  },
  chip: {
    borderRadius: 6,
    height: 35,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    borderRadius: 6,
    height: 32,
  },
  list: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalCard: {
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  modalButton: {
    marginTop: 15,
  },
});

export default Pendientes;