// src/app/pendientes/index.tsx
import { loadAppState } from '@/db/storage';
import { IAppState, initialAppState, IHabit, IPendingItem, ITask } from '@/db/types';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Avatar, Badge, Button, Card, Chip, Searchbar, Text, useTheme } from 'react-native-paper';

const Pendientes = () => {
  const [appState, setAppState] = useState<IAppState>(initialAppState);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const loadData = useCallback(async () => {
    setLoading(true);
    const loadedState = await loadAppState();
    setAppState(loadedState);
    setLoading(false);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getPendingItems = (): IPendingItem[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const pendingTasks: IPendingItem[] = appState.tasks
      .filter(task => !task.isCompleted)
      .map(task => ({
        ...task,
        sortKey: task.dueDate || new Date().toISOString(),
        itemType: 'task',
        isDueToday: task.dueDate 
          ? new Date(task.dueDate).getTime() <= today 
          : false
      }));

    const pendingHabits: IPendingItem[] = appState.habits.map(habit => {
      const lastCompleted = habit.lastCompletedDate 
        ? new Date(habit.lastCompletedDate).getTime() 
        : 0;
      
      return {
        ...habit,
        sortKey: habit.recurrence?.time || new Date().toISOString(),
        itemType: 'habit',
        isDueToday: lastCompleted < today
      };
    });

    return [...pendingTasks, ...pendingHabits]
      .sort((a, b) => new Date(a.sortKey).getTime() - new Date(b.sortKey).getTime());
  };

  const filteredItems = getPendingItems().filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading items...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: IPendingItem }) => {
    if (item.itemType === 'task') {
      return renderTaskItem(item as ITask & IPendingItem);
    } else {
      return renderHabitItem(item as IHabit & IPendingItem);
    }
  };

  const renderTaskItem = (task: ITask & IPendingItem) => {
    const dueDateText = task.dueDate 
      ? new Date(task.dueDate).toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'No due date';

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.itemHeader}>
            <Avatar.Icon 
              size={44} 
              icon="format-list-checks" 
              style={{ backgroundColor: theme.colors.surfaceVariant }}
            />
            <View style={styles.itemInfo}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" numberOfLines={1} style={styles.itemTitle}>
                  {task.title}
                </Text>
                <Chip 
                  mode="outlined" 
                  style={styles.typeChip}
                  textStyle={styles.typeChipText}
                >
                  Task
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.dueDateText}>
                {dueDateText}
              </Text>
            </View>
          </View>

          {task.description && (
            <Text variant="bodyMedium" numberOfLines={2} style={styles.itemDescription}>
              {task.description}
            </Text>
          )}

          {task.tags && task.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {task.tags.map((tag, index) => (
                <Chip 
                  key={index}
                  mode="outlined"
                  style={styles.tag}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}

          {task.isDueToday && (
            <Badge size={24} style={styles.dueTodayBadge}>
              Due Today
            </Badge>
          )}
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="text" 
            onPress={() => router.push(`/tasks/${task.id}`)}
            textColor={theme.colors.primary}
            compact
          >
            Details
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderHabitItem = (habit: IHabit & IPendingItem) => {
    const getRecurrenceText = () => {
      if (!habit.recurrence) return 'No schedule';
      
      const time = habit.recurrence.time 
        ? new Date(habit.recurrence.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'No time set';

      switch (habit.recurrence.type) {
        case 'daily': return `Daily at ${time}`;
        case 'weekly':
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const selectedDays = habit.recurrence.daysOfWeek?.map(dayIndex => days[dayIndex]).join(', ');
          return `Weekly on ${selectedDays || 'no days'} at ${time}`;
        case 'custom': return `Every ${habit.recurrence.interval} ${habit.recurrence.unit}(s) at ${time}`;
        default: return 'Custom schedule';
      }
    };

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.itemHeader}>
            <Avatar.Icon 
              size={44} 
              icon="repeat" 
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
            <View style={styles.itemInfo}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" numberOfLines={1} style={styles.itemTitle}>
                  {habit.title}
                </Text>
                <Chip 
                  mode="outlined" 
                  style={[styles.typeChip, { backgroundColor: theme.colors.secondaryContainer }]}
                  textStyle={styles.typeChipText}
                >
                  Habit
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.recurrenceText}>
                {getRecurrenceText()}
              </Text>
            </View>
          </View>

          {habit.description && (
            <Text variant="bodyMedium" numberOfLines={2} style={styles.itemDescription}>
              {habit.description}
            </Text>
          )}

          {habit.tags && habit.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {habit.tags.map((tag, index) => (
                <Chip 
                  key={index}
                  mode="outlined"
                  style={styles.tag}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.streakContainer}>
              <View style={styles.streakItem}>
                <Text variant="labelSmall" style={styles.streakLabel}>
                  CURRENT
                </Text>
                <Badge size={24} style={styles.streakBadge}>
                  {habit.currentStreak}
                </Badge>
              </View>
              <View style={styles.streakItem}>
                <Text variant="labelSmall" style={styles.streakLabel}>
                  BEST
                </Text>
                <Badge size={24} style={styles.streakBadge}>
                  {habit.bestStreak}
                </Badge>
              </View>
            </View>
          </View>

          {habit.isDueToday && (
            <Badge size={24} style={styles.dueTodayBadge}>
              Due Today
            </Badge>
          )}
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="text" 
            onPress={() => router.push(`/habits/${habit.id}`)}
            textColor={theme.colors.primary}
            compact
          >
            Details
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search pending items..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.primary}
        inputStyle={{ color: theme.colors.onSurface }}
      />

      {filteredItems.length !== 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium">No items match your search</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyText}>
            No pending items
          </Text>
        </View>
      )}
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
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  recurrenceText: {
    opacity: 0.8,
    fontSize: 13,
  },
  dueDateText: {
    opacity: 0.8,
    fontSize: 13,
  },
  itemDescription: {
    opacity: 0.8,
    lineHeight: 20,
  },
  typeChip: {
    borderRadius: 6,
    height: 35,
  },
  typeChipText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    borderRadius: 6,
    height: 32,
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakLabel: {
    opacity: 0.6,
  },
  streakBadge: {
    backgroundColor: 'transparent',
  },
  dueTodayBadge: {
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
  emptyText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: 8,
  },
});

export default Pendientes;