// src/app/pendientes/index.tsx
import { loadHabits, loadTasks, saveHabits, saveTasks } from '@/db/storage';
import { IHabit, ITask } from '@/db/types';
import { formatDueDate } from '@/utils/helpers';
import { cancelNotificationsForItem } from '@/utils/notificationService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Badge, Button, Card, Chip, Modal, Portal, Searchbar, Text, useTheme } from 'react-native-paper';

type IPendingItem = (ITask & { itemType: 'task', isDueToday: boolean, sortKey: string }) | (IHabit & { itemType: 'habit', isDueToday: boolean, sortKey: string });

const Pendientes = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [overdueModalVisible, setOverdueModalVisible] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState<ITask[]>([]);
  const theme = useTheme();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [loadedTasks, loadedHabits] = await Promise.all([loadTasks(), loadHabits()]);
    setTasks(loadedTasks);
    setHabits(loadedHabits);
    setLoading(false);
    return { loadedTasks, loadedHabits };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData().then(({ loadedTasks }) => {
        const overdue = loadedTasks.filter(task =>
          !task.isCompleted &&
          task.dueDate &&
          new Date(task.dueDate) < new Date()
        );
        setOverdueTasks(overdue);
        if (overdue.length > 0) setOverdueModalVisible(true);
      });
    }, [loadData])
  );

  const handleOverdueAction = async (taskId: string, action: 'complete' | 'delete') => {
    let updatedTasks = [...tasks];

    if (action === 'complete') {
      updatedTasks = updatedTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: true } : task
      );
    } else {
      await cancelNotificationsForItem(taskId);
      updatedTasks = updatedTasks.filter(task => task.id !== taskId);
    }

    await saveTasks(updatedTasks);
    setTasks(updatedTasks);
    setOverdueTasks(prev => prev.filter(task => task.id !== taskId));

    if (overdueTasks.length === 1) setOverdueModalVisible(false);
  };

  const handleCompleteHabit = async (habitId: string) => {
    const today = new Date().toISOString().slice(0, 10);

    const updatedHabits = habits.map(habit => {
      if (habit.id !== habitId) return habit;

      const lastCompleted = habit.lastCompletedDate?.slice(0, 10);
      if (lastCompleted === today) return habit; // Ya completado hoy

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = lastCompleted === yesterday ? habit.currentStreak + 1 : 1;

      return {
        ...habit,
        currentStreak: newStreak,
        bestStreak: Math.max(habit.bestStreak, newStreak),
        lastCompletedDate: new Date().toISOString(),
      };
    });

    await saveHabits(updatedHabits);
    setHabits(updatedHabits);
  };

  const getPendingItems = (): IPendingItem[] => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return [
      ...tasks
        .filter(task => !task.isCompleted)
        .map(task => ({
          ...task,
          sortKey: task.dueDate || new Date().toISOString(),
          itemType: 'task' as const,
          isDueToday: !!task.dueDate && new Date(task.dueDate).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0)
        })),
      ...habits
        .filter(habit => !habit.lastCompletedDate || habit.lastCompletedDate.slice(0, 10) !== todayStr) // <-- SOLO los no completados hoy
        .map(habit => ({
          ...habit,
          sortKey: habit.recurrence?.time || new Date().toISOString(),
          itemType: 'habit' as const,
          isDueToday: true // Ya filtraste, así que siempre true
        }))
    ].sort((a, b) => new Date(a.sortKey).getTime() - new Date(b.sortKey).getTime());
  };

  const renderItem = ({ item }: { item: IPendingItem }) => (
    <PendingItem item={item} theme={theme} onCompleteHabit={handleCompleteHabit} />
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  const filteredItems = getPendingItems().filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Portal>
        <Modal
          visible={overdueModalVisible}
          onDismiss={() => setOverdueModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Tareas vencidas</Text>

          {overdueTasks.map(task => (
            <Card key={task.id} style={styles.taskCard}>
              <Card.Content>
                <Text variant="bodyLarge">{task.title}</Text>
                <Text variant="bodySmall">
                  Vence: {formatDueDate(task.dueDate)}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleOverdueAction(task.id, 'delete')}>
                  Eliminar
                </Button>
                <Button mode="contained" onPress={() => handleOverdueAction(task.id, 'complete')}>
                  Completar
                </Button>
              </Card.Actions>
            </Card>
          ))}

          <Button
            mode="outlined"
            onPress={() => setOverdueModalVisible(false)}
            style={styles.modalButton}
          >
            Cerrar
          </Button>
        </Modal>
      </Portal>

      <Searchbar
        placeholder="Buscar..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">No hay tareas o habitos pendientes</Text>
          </View>
        }
      />
    </View>
  );
};

// Simplified item component
type PendingItemProps = {
  item: IPendingItem;
  theme: any;
  onCompleteHabit: (habitId: string) => void;
};

const PendingItem = ({ item, theme, onCompleteHabit }: PendingItemProps) => {
  const isTask = item.itemType === 'task';
  const isHabit = item.itemType === 'habit';

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <Avatar.Icon
            size={44}
            icon={isTask ? 'format-list-checks' : 'repeat'}
            style={{
              backgroundColor: isTask
                ? theme.colors.surfaceVariant
                : theme.colors.primaryContainer
            }}
          />
          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={1}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.secondaryText}>
              {isTask 
                ? `${new Date(item.dueDate!).toDateString()}`
                : `${item.recurrence.type.toUpperCase()} at ${item.recurrence.time}`}
            </Text>
          </View>
          <Chip mode="outlined" style={styles.chip}>
            {isTask ? 'Tarea' : 'Hábito'}
          </Chip>
        </View>

        {item.description && (
          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        )}

        {item.tags?.length > 0 && (
          <View style={styles.tags}>
            {item.tags.map((tag, i) => (
              <Chip key={i} mode="outlined" style={styles.tag}>
                {tag}
              </Chip>
            ))}
          </View>
        )}

        {item.isDueToday && (
          <Badge size={24} style={styles.badge}>Vence hoy</Badge>
        )}
      </Card.Content>
      <Card.Actions>
        <Button
          mode="text"
          onPress={() => router.push(`/${isTask ? 'tasks' : 'habits'}/${item.id}`)}
        >
          Detalles
        </Button>
        {/* Solo para hábitos pendientes de hoy */}
        {isHabit && item.isDueToday && (
          <Button
            mode={item.lastCompletedDate?.slice(0, 10) === new Date().toISOString().slice(0, 10) ? "contained" : "outlined"}
            onPress={() => onCompleteHabit(item.id)}
            disabled={item.lastCompletedDate?.slice(0, 10) === new Date().toISOString().slice(0, 10)}
            icon="check"
            compact
          >
            {item.lastCompletedDate?.slice(0, 10) === new Date().toISOString().slice(0, 10) ? "Hecho" : "Completado"}
          </Button>
        )}
      </Card.Actions>
    </Card>
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
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  cardContent: {
    padding: 16,
    gap: 12,
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF5722',
    marginTop: 8,
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
    borderRadius: 10,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  taskCard: {
    marginVertical: 8,
  },
  modalButton: {
    marginTop: 15,
  },
});

export default Pendientes;