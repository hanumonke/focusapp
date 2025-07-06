import CustomHeader from '@/components/CustomHeader';
import { loadTasks } from '@/db/storage';
import { IReminder, ITask } from '@/db/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Chip, Divider, Text, useTheme } from 'react-native-paper';

const TaskDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      const tasks = await loadTasks();
      const found = tasks.find(t => t.id === id);
      setTask(found || null);
      setLoading(false);
    };
    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Tarea no encontrada.</Text>
      </View>
    );
  }

  const renderReminderCard = (reminder: IReminder, index: number) => {
    let details = '';
    let icon = 'bell';

    switch (reminder.type) {
      case 'daily':
        details = `Diario a las ${reminder.timestamp ? new Date(reminder.timestamp).toLocaleTimeString() : 'no time'}`;
        icon = 'calendar-today';
        break;
      case 'weekly':
        details = `Semanal ${reminder.daysOfWeek && reminder.daysOfWeek.length > 0
          ? ` los ${reminder.daysOfWeek.map(d => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]).join(', ')}`
          : ''} a las ${reminder.timestamp ? new Date(reminder.timestamp).toLocaleTimeString() : 'no time'}`;
        icon = 'calendar-week';
        break;
      case 'interval':
        details = `Cada ${reminder.interval} ${reminder.unit?.toLowerCase()}${reminder.interval === 1 ? '' : 's'}`;
        icon = 'timer';
        break;
      case 'date':
        details = `El ${reminder.timestamp ? new Date(reminder.timestamp).toLocaleString() : 'sin fecha'}`;
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
              {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)} Recordatorio
            </Text>
          </View>
          <Text style={styles.reminderMessage}>{reminder.message}</Text>
          <Text style={styles.reminderDetails}>{details}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <>
      <CustomHeader 
        materialIcon='note-edit' 
        backRoute='/tasks' 
        title={task.title || 'Detalles de la tarea'} 
        addAction={() => router.push(`/tasks/new?id=${task.id}`)} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.taskCard}>
          <Card.Title 
            title={task.title} 
            titleVariant="headlineMedium"
            titleStyle={styles.taskTitle}
            subtitle={`Estado: ${task.isCompleted ? 'Completada' : 'Pendiente'}`}
            subtitleStyle={{ 
              color: task.isCompleted ? theme.colors.primary : theme.colors.error 
            }}
          />
          <Card.Content>
            {task.description && (
              <>
                <Text variant="bodyLarge" style={styles.taskDescription}>
                  {task.description}
                </Text>
                <Divider style={styles.divider} />
              </>
            )}

            {task.dueDate && (
              <>
                <Text variant="labelLarge" style={styles.sectionLabel}>Vencimiento</Text>
                <View style={styles.dueDateRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color="#6200ee" />
                  <Text style={styles.dueDateText}>
                    {new Date(task.dueDate).toLocaleString()}
                  </Text>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {task.tags && task.tags.length > 0 && (
              <>
                <Text variant="labelLarge" style={styles.sectionLabel}>Etiquetas</Text>
                <View style={styles.tagsContainer}>
                  {task.tags.map((tag, idx) => (
                    <Chip key={idx} style={styles.tag} textStyle={styles.tagText}>
                      {tag}
                    </Chip>
                  ))}
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            <View style={styles.metaInfo}>
              <Text variant="labelSmall">Creada: {new Date(task.createdAt).toLocaleDateString()}</Text>
              <Text variant="labelSmall">Última actualización: {new Date(task.updatedAt).toLocaleDateString()}</Text>
            </View>
          </Card.Content>
        </Card>

        {task.reminders && task.reminders.length > 0 && (
          <>
            <Text variant="titleLarge" style={styles.remindersTitle}>
              Recordatorios ({task.reminders.length})
            </Text>
            {task.reminders.map((reminder, index) => renderReminderCard(reminder, index))}
          </>
        )}

        {(!task.reminders || task.reminders.length === 0) && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="bell-off" size={40} color="#888" />
              <Text variant="titleMedium" style={styles.emptyText}>
                Sin recordatorios
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
  taskCard: {
    marginBottom: 20,
  },
  taskTitle: {
    marginBottom: 8,
  },
  taskDescription: {
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionLabel: {
    marginBottom: 8,
    color: '#6200ee',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dueDateText: {
    flex: 1,
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

export default TaskDetails;