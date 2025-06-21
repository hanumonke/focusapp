import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { loadAppState, saveAppState } from '@/db/storage';
import { IAppState, ITask, initialAppState } from '@/db/types';
import { router, useFocusEffect } from 'expo-router';
import { FlatList } from 'react-native-gesture-handler';
import { Button, Card, Searchbar, Text, useTheme, IconButton, Avatar, Chip, Badge } from 'react-native-paper';
import { cancelNotificationsForItem } from '@/utils/notificationService';

const Tasks = () => {
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

  const handleCreateTask = () => {
    router.push('/tasks/new');
  };

  const handleDeleteTask = async (id: string) => {
    import('react-native').then(({ Alert }) => {
      Alert.alert(
        "Delete Task",
        "Are you sure you want to delete this task?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
            await cancelNotificationsForItem(id);
              const updatedTasks = appState.tasks.filter(task => task.id !== id);
              const updatedState = { ...appState, tasks: updatedTasks };
              await saveAppState(updatedState);
              setAppState(updatedState);
            }
          }
        ]
      );
    });
  };

  const handleDetails = (id: string) => router.push(`/tasks/${id}`);

  const toggleTaskCompletion = async (id: string) => {
    const updatedTasks = appState.tasks.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    const updatedState = { ...appState, tasks: updatedTasks };
    await saveAppState(updatedState);
    setAppState(updatedState);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredTasks = appState.tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  const renderTaskItem = ({ item }: { item: ITask }) => {
    const dueDateText = item.dueDate 
      ? new Date(item.dueDate).toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'No due date';

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.taskHeader}>
            <Avatar.Icon 
              size={44} 
              icon={item.isCompleted ? 'check' : 'format-list-checks'} 
              style={{ 
                backgroundColor: item.isCompleted 
                  ? theme.colors.primaryContainer 
                  : theme.colors.surfaceVariant 
              }}
            />
            <View style={styles.taskInfo}>
              <Text 
                variant="titleMedium" 
                numberOfLines={1} 
                style={[
                  styles.taskTitle,
                  item.isCompleted && styles.completedTask
                ]}
              >
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.dueDateText}>
                {dueDateText}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text 
              variant="bodyMedium" 
              numberOfLines={2} 
              style={styles.taskDescription}
            >
              {item.description}
            </Text>
          )}

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text variant="labelSmall" style={styles.sectionLabel}>
                TAGS
              </Text>
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, idx) => (
                  <Chip 
                    key={idx} 
                    mode="outlined" 
                    style={styles.tag}
                    textStyle={styles.tagText}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <View style={styles.statsContainer}>
            {item.reminders && item.reminders.length > 0 && (
              <View style={styles.remindersIndicator}>
                <IconButton
                  icon="bell"
                  size={16}
                  iconColor={theme.colors.primary}
                />
                <Text variant="labelSmall">
                  {item.reminders.length} reminder{item.reminders.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            
            <Badge 
              size={24} 
              style={[
                styles.statusBadge,
                item.isCompleted 
                  ? { backgroundColor: theme.colors.primary } 
                  : { backgroundColor: theme.colors.error }
              ]}
            >
              {item.isCompleted ? 'Done' : 'Pending'}
            </Badge>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="text" 
            onPress={() => toggleTaskCompletion(item.id)}
            textColor={theme.colors.primary}
            compact
          >
            {item.isCompleted ? 'Undo' : 'Complete'}
          </Button>
          <Button 
            mode="text" 
            onPress={() => handleDetails(item.id)}
            textColor={theme.colors.primary}
            compact
          >
            Details
          </Button>
          <IconButton
            icon="delete"
            iconColor={theme.colors.error}
            onPress={() => handleDeleteTask(item.id)}
          />
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search tasks..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.primary}
        inputStyle={{ color: theme.colors.onSurface }}
      />

      <Button 
        mode="contained" 
        onPress={handleCreateTask} 
        style={styles.addButton}
        icon="plus"
        contentStyle={styles.addButtonContent}
      >
        Add Task
      </Button>

      {filteredTasks.length !== 0 ? (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium">No tasks match your search</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyText}>
            No tasks yet
          </Text>
          <Button 
            mode="contained" 
            onPress={handleCreateTask}
            style={styles.emptyButton}
          >
            Create your first task
          </Button>
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
  addButton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  addButtonContent: {
    flexDirection: 'row-reverse',
    height: 48,
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
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  dueDateText: {
    opacity: 0.8,
    fontSize: 13,
  },
  taskDescription: {
    opacity: 0.8,
    lineHeight: 20,
  },
  tagsSection: {
    marginTop: 4,
  },
  sectionLabel: {
    opacity: 0.6,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  remindersIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    alignSelf: 'flex-end',
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

export default Tasks;