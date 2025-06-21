import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { loadAppState, saveAppState } from '@/db/storage';
import { IAppState, IHabit, initialAppState } from '@/db/types';
import { router, useFocusEffect } from 'expo-router';
import { FlatList } from 'react-native-gesture-handler';
import { Button, Card, Searchbar, Text, useTheme, IconButton, Avatar, Chip, Badge } from 'react-native-paper';
import { cancelNotificationsForItem } from '@/utils/notificationService';

const Habits = () => {
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

  const handleCreateHabit = () => {
    router.push('/habits/new');
  };

  const handleDeleteHabit = async (id: string) => {
    import('react-native').then(({ Alert }) => {
      Alert.alert(
        "Delete Habit",
        "Are you sure you want to delete this habit?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              await cancelNotificationsForItem(id);
              const updatedHabits = appState.habits.filter(habit => habit.id !== id);
              const updatedState = { ...appState, habits: updatedHabits };
              await saveAppState(updatedState);
              setAppState(updatedState);
              setLoading(false);
            }
          }
        ]
      );
    });
  };

  const handleDetails = (id: string) => router.push(`/habits/${id}`);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getRecurrenceText = (recurrence: IHabit['recurrence']) => {
    if (!recurrence) return 'No schedule';
    
    const time = recurrence.time 
      ? new Date(recurrence.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'No time set';

    switch (recurrence.type) {
      case 'daily':
        return `Daily at ${time}`;
      case 'weekly':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDays = recurrence.daysOfWeek?.map(dayIndex => days[dayIndex]).join(', ');
        return `Weekly on ${selectedDays || 'no days'} at ${time}`;
      case 'custom':
        return `Every ${recurrence.interval} ${recurrence.unit}(s) at ${time}`;
      default:
        return 'Custom schedule';
    }
  };

  const filteredHabits = appState.habits.filter(habit =>
    habit.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading habits...</Text>
      </View>
    );
  }

  const renderHabitItem = ({ item }: { item: IHabit }) => {
    const getRecurrenceIcon = () => {
      switch (item.recurrence?.type) {
        case 'daily': return 'calendar-today';
        case 'weekly': return 'calendar-week';
        case 'custom': return 'calendar-sync';
        default: return 'calendar-blank';
      }
    };

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.habitHeader}>
            <Avatar.Icon 
              size={44} 
              icon={getRecurrenceIcon()} 
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
            <View style={styles.habitInfo}>
              <Text variant="titleMedium" numberOfLines={1} style={styles.habitTitle}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.recurrenceText}>
                {getRecurrenceText(item.recurrence)}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text 
              variant="bodyMedium" 
              numberOfLines={2} 
              style={styles.habitDescription}
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
            <View style={styles.streakContainer}>
              <View style={styles.streakItem}>
                <Text variant="labelSmall" style={styles.streakLabel}>
                  CURRENT
                </Text>
                <Badge size={24} style={styles.streakBadge}>
                  {item.currentStreak}
                </Badge>
              </View>
              <View style={styles.streakItem}>
                <Text variant="labelSmall" style={styles.streakLabel}>
                  BEST
                </Text>
                <Badge size={24} style={styles.streakBadge}>
                  {item.bestStreak}
                </Badge>
              </View>
            </View>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="text" 
            onPress={() => handleDetails(item.id)}
            textColor={theme.colors.primary}
            compact
          >
            Details
          </Button>
          <IconButton
            icon="pencil"
            iconColor={theme.colors.primary}
            onPress={() => router.push(`/habits/new?id=${item.id}`)}
          />
          <IconButton
            icon="delete"
            iconColor={theme.colors.error}
            onPress={() => handleDeleteHabit(item.id)}
          />
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search habits..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.primary}
        inputStyle={{ color: theme.colors.onSurface }}
      />

      <Button 
        mode="contained" 
        onPress={handleCreateHabit} 
        style={styles.addButton}
        icon="plus"
        contentStyle={styles.addButtonContent}
      >
        Add Habit
      </Button>

      {filteredHabits.length !== 0 ? (
        <FlatList
          data={filteredHabits}
          renderItem={renderHabitItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium">No habits match your search</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyText}>
            No habits yet
          </Text>
          <Button 
            mode="contained" 
            onPress={handleCreateHabit}
            style={styles.emptyButton}
          >
            Create your first habit
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
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  recurrenceText: {
    opacity: 0.8,
    fontSize: 13,
  },
  habitDescription: {
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
  remindersIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

export default Habits;