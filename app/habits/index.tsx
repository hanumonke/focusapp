import { loadHabits, loadPoints, saveHabits, savePoints } from '@/db/storage';
import { HabitsState, IHabit } from '@/db/types';
import { useGlobalStyles } from '@/utils/globalStyles';
import { cancelNotificationsForItem } from '@/utils/notificationService';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Avatar, Badge, Button, Card, Chip, IconButton, Searchbar, Text, useTheme } from 'react-native-paper';

// QUITAR LO DE MEJOR RACHA

const Habits = () => {
  const [habits, setHabits] = useState<HabitsState>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const global = useGlobalStyles();

  const loadData = useCallback(async () => {
    setLoading(true);
    const loadedHabits = await loadHabits();
    setHabits(loadedHabits);
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
        "Eliminar hábito",
        "¿Seguro que deseas eliminar este hábito?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              await cancelNotificationsForItem(id);
              const updatedHabits = habits.filter(habit => habit.id !== id);
              await saveHabits(updatedHabits);
              setHabits(updatedHabits);
              setLoading(false);
            }
          }
        ]
      );
    });
  };

  const handleDetails = (id: string) => router.push(`/habits/${id}`);

  const askToSaveStreak = async (habit: IHabit) => {
    const streakSaveCost = 50; // Cost in points
    const currentPoints = await loadPoints();
    
    if (currentPoints < streakSaveCost) {
      Alert.alert("Puntos insuficientes", `Necesitas ${streakSaveCost} puntos para salvar tu racha. Tienes ${currentPoints} puntos.`);
      return;
    }

    Alert.alert(
      "¿Salvar racha?",
      `¿Quieres gastar ${streakSaveCost} puntos para salvar tu racha de ${habit.currentStreak} días para "${habit.title}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, salvar",
          onPress: async () => {
            // Deduct points first
            await savePoints(currentPoints - streakSaveCost);
            
            // Mark as completed yesterday to maintain the streak
            const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            const updatedHabits = habits.map(h => 
              h.id === habit.id ? { ...h, lastCompletedDate: yesterdayStr } : h
            );
            await saveHabits(updatedHabits);
            setHabits(updatedHabits);
            Alert.alert("¡Racha salvada!", "Tu racha ha sido mantenida.");
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Reset streaks if missed (simple/pragmatic)
  useEffect(() => {
    const resetStreaksIfMissed = async () => {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);

      let updated = false;
      const updatedHabits = habits.map(habit => {
        if (!habit.lastCompletedDate) return habit;
        const last = habit.lastCompletedDate.slice(0, 10);
        
        // Check if streak should be reset (missed more than 1 day)
        if (last !== todayStr && last !== yesterdayStr && habit.currentStreak !== 0) {
          // Ask user if they want to save the streak
          askToSaveStreak(habit);
          return habit; // Don't reset immediately, let user decide
        }
        return habit;
      });

      if (updated) {
        await saveHabits(updatedHabits);
        setHabits(updatedHabits);
      }
    };

    if (habits.length > 0) resetStreaksIfMissed();
    
  }, [habits.length]);

  const getRecurrenceText = (recurrence: IHabit['recurrence']) => {
    if (!recurrence) return 'Sin recurrencia';

    const time = recurrence.time 
      ? recurrence.time
      : 'Sin hora';

    switch (recurrence.type) {
      case 'daily':
        return `Diario a las ${time}`;
      case 'weekly':
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const selectedDays = recurrence.daysOfWeek?.map(dayIndex => days[dayIndex]).join(', ');
        return `Semanal los ${selectedDays || 'sin días'} a las ${time}`;
      default:
        return 'Recurrencia personalizada';
    }
  };

  const filteredHabits = habits.filter(habit =>
    habit.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={global.centered}>
        <ActivityIndicator size="large" />
        <Text>Cargando hábitos...</Text>
      </View>
    );
  }
  

  const renderHabitItem = ({ item }: { item: IHabit }) => {
    const getRecurrenceIcon = () => {
      switch (item.recurrence?.type) {
        case 'daily': return 'calendar-today';
        case 'weekly': return 'calendar-week';
        default: return 'calendar-blank';
      }
    };


    // Show reminders indicator if any reminder is enabled
    const hasReminders = item.reminderOnTime?.enabled || item.reminderBefore?.enabled;

    return (
      <Card style={global.card}>
        <Card.Content style={global.cardContent}>
          <View style={global.habitHeader}>
            <Avatar.Icon 
              size={44} 
              icon={getRecurrenceIcon()} 
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
            <View style={global.habitInfo}>
              <Text variant="titleMedium" numberOfLines={1} style={global.habitTitle}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={global.recurrenceText}>
                {getRecurrenceText(item.recurrence)}
              </Text>
            </View>
            {hasReminders && (
              <View style={global.remindersIndicator}>
                <IconButton icon="bell" size={20} iconColor={theme.colors.primary} />
                <Text variant="labelSmall" style={{ color: '#666666' }}>
                  Recordatorios
                </Text>
              </View>
            )}
          </View>

          {item.description && (
            <Text 
              variant="bodyMedium" 
              numberOfLines={2} 
              style={global.habitDescription}
            >
              {item.description}
            </Text>
          )}

          {item.tags && item.tags.length > 0 && (
            <View style={global.tagsSection}>
              <Text variant="labelSmall" style={global.sectionLabel}>
                ETIQUETAS
              </Text>
              <View style={global.tagsContainer}>
                {item.tags.map((tag, idx) => (
                  <Chip 
                    key={idx} 
                    mode="outlined" 
                    style={global.tag}
                    
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <View style={global.statsContainer}>
            <View style={global.streakContainer}>
              <View style={global.streakItem}>
                <Text variant="labelSmall" style={global.streakLabel}>
                  RACHA
                </Text>
                <Badge size={24}>
                  {item.currentStreak}
                </Badge>
              </View>
              {/* <View style={global.streakItem}>
                <Text variant="labelSmall" style={global.streakLabel}>
                  MEJOR
                </Text>
                <Badge size={24}>
                  {item.bestStreak}
                </Badge>
              </View> */}
            </View>
          </View>
        </Card.Content>
        <Card.Actions style={global.cardActions}>
          <Button 
            mode="outlined" 
            onPress={() => handleDetails(item.id)}
            textColor={theme.colors.onSurface}
            style={{ borderColor: theme.colors.outline }}
            compact
          >
            Detalles
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
    <View style={global.container}>
      <Searchbar
        placeholder="Buscar hábitos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={global.input}
        iconColor={theme.colors.primary}
        inputStyle={{ color: theme.colors.onSurface }}
      />

      <Button 
        mode="contained" 
        onPress={handleCreateHabit} 
        style={global.button}
        icon="plus"
        contentStyle={global.addButtonContent}
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
      >
        Agregar hábito
      </Button>

      {filteredHabits.length !== 0 ? (
        <FlatList
          data={filteredHabits}
          renderItem={renderHabitItem}
          keyExtractor={item => item.id}
          contentContainerStyle={global.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={global.emptyContainer}>
              <Text variant="titleMedium">Ningún hábito coincide con tu búsqueda</Text>
            </View>
          }
        />
      ) : (
        <View style={global.emptyContainer}>
          <Text variant="titleMedium" style={global.emptyText}>
            Aún no tienes hábitos
          </Text>
          <Button 
            mode="contained" 
            onPress={handleCreateHabit}
            style={global.emptyButton}
            buttonColor={theme.colors.secondary}
            textColor={theme.colors.onSecondary}
          >
            Crea tu primer hábito
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