import CustomHeader from '@/components/CustomHeader';
import { loadAppState } from '@/db/storage';
import { ITask } from '@/db/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';

const Details = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      const appState = await loadAppState();
      const found = appState.tasks.find(t => t.id === id);
      setTask(found || null);
      setLoading(false);
    };
    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No se encontró la tarea.</Text>
      </View>
    );
  }

  return (
    <>
    <CustomHeader materialIcon='note-edit' backRoute='/tasks' title={`${task.title || 'Cargando...'}`} addAction={() => router.push(`/tasks/new?id=${task.id}`)} />
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Card.Title title={task.title} />
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 8 }}>{task.description}</Text>
          {task.dueDate && (
            <Text variant="labelLarge" style={{ marginBottom: 8 }}>
              Vence: {new Date(task.dueDate).toLocaleString()}
            </Text>
          )}
          {task.tags && task.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {task.tags.map((tag, idx) => (
                <Chip key={idx} style={{ marginRight: 4, marginBottom: 4 }}>{tag}</Chip>
              ))}
            </View>
          )}

          {task.reminders && task.reminders.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {task.reminders.map((reminder, idx) => (
                <Text key={idx} style={{ marginRight: 4, marginBottom: 4 }}>{reminder.message}</Text>
              ))}
            </View>
          )}
          <Text variant="labelSmall">
            Estado: {task.isCompleted ? 'Completada' : 'Pendiente'}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
    </>
  );
};

export default Details;