import CustomHeader from '@/components/CustomHeader';
import { loadAppState } from '@/db/storage';
import { IHabit, IReminder } from '@/db/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Chip, Divider, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Details = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [habit, setHabit] = useState<IHabit | null>(null);
  const [loading, setLoading] = useState(true);
   const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchHabit = async () => {
        setLoading(true);
        const appState = await loadAppState();
        const found = appState.habits.find(t => t.id === id);
        setHabit(found || null);
        setLoading(false);
      };
      fetchHabit();
    }, [id, refreshKey]) // Add refreshKey as dependency
  );

    const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getRecurrenceText = (recurrence: IHabit['recurrence']) => {
    if (!recurrence) return 'No recurrence set';
    
    const time = recurrence.time 
      ? new Date(recurrence.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'No time set';

    switch (recurrence.type) {
      case 'daily':
        return `Daily at ${time}`;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDays = recurrence.daysOfWeek?.map(dayIndex => days[dayIndex]).join(', ');
        return `Weekly on ${selectedDays || 'no days'} at ${time}`;
      case 'custom':
        return `Every ${recurrence.interval} ${recurrence.unit}(s) at ${time}`;
      default:
        return 'Custom recurrence';
    }
  };

  const getStreakInfo = () => {
    if (!habit) return null;
    return (
      <View style={styles.streakContainer}>
        <View style={styles.streakItem}>
          <Text variant="labelMedium">Current Streak</Text>
          <Text variant="headlineMedium" style={styles.streakNumber}>
            {habit.currentStreak}
          </Text>
        </View>
        <View style={styles.streakItem}>
          <Text variant="labelMedium">Best Streak</Text>
          <Text variant="headlineMedium" style={styles.streakNumber}>
            {habit.bestStreak}
          </Text>
        </View>
      </View>
    );
  };

  const renderReminderCard = (reminder: IReminder, index: number) => {
    let details = '';
    let icon = 'bell';

    switch (reminder.type) {
      case 'daily':
        details = `Daily at ${reminder.timestamp ? new Date(reminder.timestamp).toLocaleTimeString() : 'no time'}`;
        icon = 'calendar-today';
        break;
      case 'weekly':
        details = `Weekly on ${reminder.day} at ${reminder.timestamp ? new Date(reminder.timestamp).toLocaleTimeString() : 'no time'}`;
        icon = 'calendar-week';
        break;
      case 'interval':
        details = `Every ${reminder.interval} ${reminder.unit?.toLowerCase()}s`;
        icon = 'timer';
        break;
      case 'date':
        details = `On ${reminder.timestamp ? new Date(reminder.timestamp).toLocaleString() : 'no date'}`;
        icon = 'calendar';
        break;
    }

    return (
      <Card key={index} style={styles.reminderCard}>
        <Card.Content>
          <View style={styles.reminderHeader}>
            {/* @ts-ignore */}
            <MaterialCommunityIcons name={icon} size={24} color="#6200ee" />
            <Text variant="titleMedium" style={styles.reminderTitle}>
              {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)} Reminder
            </Text>
          </View>
          <Text style={styles.reminderMessage}>{reminder.message}</Text>
          <Text style={styles.reminderDetails}>{details}</Text>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Habit not found.</Text>
      </View>
    );
  }

  return (
    <>
      <CustomHeader 
        materialIcon='note-edit' 
        backRoute='/habits' 
        title={habit.title || 'Habit Details'} 
        addAction={() => router.push(`/habits/new?id=${habit.id}`)} 
        refreshAction={handleRefresh} // Add this prop
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Main Habit Card */}
        <Card style={styles.habitCard}>
          <Card.Title 
            title={habit.title} 
            titleVariant="headlineMedium"
            titleStyle={styles.habitTitle}
          />
          <Card.Content>
            {habit.description && (
              <>
                <Text variant="bodyLarge" style={styles.habitDescription}>
                  {habit.description}
                </Text>
                <Divider style={styles.divider} />
              </>
            )}

            {habit.tags && habit.tags.length > 0 && (
              <>
                <Text variant="labelLarge" style={styles.sectionLabel}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {habit.tags.map((tag, idx) => (
                    <Chip key={idx} style={styles.tag} textStyle={styles.tagText}>
                      {tag}
                    </Chip>
                  ))}
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            <Text variant="labelLarge" style={styles.sectionLabel}>Schedule</Text>
            <View style={styles.scheduleRow}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#6200ee" />
              <Text style={styles.scheduleText}>
                {getRecurrenceText(habit.recurrence)}
              </Text>
            </View>
            <Divider style={styles.divider} />

            {getStreakInfo()}
            
            <View style={styles.metaInfo}>
              <Text variant="labelSmall">Created: {new Date(habit.createdAt).toLocaleDateString()}</Text>
              <Text variant="labelSmall">Last updated: {new Date(habit.updatedAt).toLocaleDateString()}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Reminders Section */}
        {habit.reminders && habit.reminders.length > 0 && (
          <>
            <Text variant="titleLarge" style={styles.remindersTitle}>
              Reminders ({habit.reminders.length})
            </Text>
            {habit.reminders.map((reminder, index) => renderReminderCard(reminder, index))}
          </>
        )}

        {/* Empty State for Reminders */}
        {(!habit.reminders || habit.reminders.length === 0) && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="bell-off" size={40} color="#888" />
              <Text variant="titleMedium" style={styles.emptyText}>
                No reminders set
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitCard: {
    marginBottom: 20,
  },
  habitTitle: {
    marginBottom: 8,
  },
  habitDescription: {
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionLabel: {
    marginBottom: 8,
    color: '#6200ee',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: '#e0e0e0',
  },
  tagText: {
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scheduleText: {
    flex: 1,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNumber: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  metaInfo: {
    marginTop: 8,
    gap: 4,
  },
  remindersTitle: {
    marginBottom: 16,
    color: '#6200ee',
  },
  reminderCard: {
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reminderTitle: {
    flex: 1,
  },
  reminderMessage: {
    marginBottom: 4,
  },
  reminderDetails: {
    color: '#666',
    fontSize: 14,
  },
  emptyCard: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    color: '#888',
  },
});

export default Details;