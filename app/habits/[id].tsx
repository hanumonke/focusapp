import CustomHeader from '@/components/CustomHeader';
import { loadHabits } from '@/db/storage';
import { IHabit } from '@/db/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Chip, Divider, Text } from 'react-native-paper';

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
        const habitsState = await loadHabits();
        const found = habitsState.find(t => t.id === id);
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
    if (!recurrence) return 'No se configuró la recurrencia';
    
    const time = recurrence.time 
      ? new Date(recurrence.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'No se configuró el momento de recurrencia';

    switch (recurrence.type) {
      case 'daily':
        return `Diario - ${time}`;
      case 'weekly':
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const selectedDays = recurrence.daysOfWeek?.map(dayIndex => days[dayIndex]).join(', ');
        return `Semanal - ${selectedDays || 'Sin días'} - ${time}`;

      default:
        return 'Recurrencia personalizada';
    }
  };

  const getStreakInfo = () => {
    if (!habit) return null;
    return (
      <View style={styles.streakContainer}>
        <View style={styles.streakItem}>
          <Text variant="labelMedium">Racha actual</Text>
          <Text variant="headlineMedium" style={styles.streakNumber}>
            {habit.currentStreak}
          </Text>
        </View>
        <View style={styles.streakItem}>
          <Text variant="labelMedium">Mejor racha</Text>
          <Text variant="headlineMedium" style={styles.streakNumber}>
            {habit.bestStreak}
          </Text>
        </View>
      </View>
    );
  };



  

  // Helper to render a single reminder config
const renderHabitReminder = (
  config: IHabit['reminderOnTime'] | IHabit['reminderBefore'],
  type: 'onTime' | 'before'
) => {
  if (!config || !config.enabled) return null;

  let icon = type === 'onTime' ? 'bell' : 'bell-alert';
  let label = type === 'onTime' ? 'A la hora programada' : `Antes (${config.minutesBefore} min)`;
  let snooze = config.snoozeMinutes ? `Posponer: ${config.snoozeMinutes} min` : '';
  let message = config.message || (type === 'onTime' ? '¡Es hora de tu hábito!' : 'Recordatorio antes de la hora del hábito');

  return (
    <Card style={styles.reminderCard}>
      <Card.Content>
        <View style={styles.reminderHeader}>
          {/* @ts-ignore */}
          <MaterialCommunityIcons name={icon} size={24} color="#6200ee" />
          <Text variant="titleMedium" style={styles.reminderTitle}>
            {label}
          </Text>
        </View>
        <Text style={styles.reminderMessage}>{message}</Text>
        {snooze ? <Text style={styles.reminderDetails}>{snooze}</Text> : null}
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
        <Text>Hábito no encontrado.</Text>
      </View>
    );
  }

  return (
    <>
      <CustomHeader 
        materialIcon='note-edit' 
        backRoute='/habits' 
        title={habit.title || 'Hábito no encontrado.'} 
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
                <Text variant="labelLarge" style={styles.sectionLabel}>Etiquetas</Text>
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

            <Text variant="labelLarge" style={styles.sectionLabel}>Horario</Text>
            <View style={styles.scheduleRow}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#6200ee" />
              <Text style={styles.scheduleText}>
                {getRecurrenceText(habit.recurrence)}
              </Text>
            </View>
            <Divider style={styles.divider} />

            {getStreakInfo()}
            
            <View style={styles.metaInfo}>
              <Text variant="labelSmall">Creado: {new Date(habit.createdAt).toLocaleDateString()}</Text>
              <Text variant="labelSmall">Última actualización: {new Date(habit.updatedAt).toLocaleDateString()}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Reminders Section */}
        <Text variant="titleLarge" style={styles.remindersTitle}>
          Recordatorios
        </Text>
        {(!habit.reminderOnTime?.enabled && !habit.reminderBefore?.enabled) && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="bell-off" size={40} color="#888" />
              <Text variant="titleMedium" style={styles.emptyText}>
                Sin recordatorios
              </Text>
            </Card.Content>
          </Card>
        )}
        {renderHabitReminder(habit.reminderOnTime, 'onTime')}
        {renderHabitReminder(habit.reminderBefore, 'before')}

       
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