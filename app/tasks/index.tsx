import { getData } from '@/db/store';
import { Button } from '@react-navigation/elements';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

interface TaskItem {
    id: number,
    title: string,
    description: string,
    deadline: string,
    created_at: string
}
const TaskItem = ({ id, title, description, deadline }: TaskItem) => {
    return <View
        style={styles.taskitemContainer}
    >
        <Text>{title}</Text>
        <Text>{description}</Text>
        <Text>{deadline}</Text>
    </View>
}
const index = () => {
    const router = useRouter();
    const [mockTasks, setMockTask] = useState<TaskItem[]>([]);

    const fetchTasks = async () => {
        try {
            const data = await getData('db');
            if (data == null) throw Error('no data');
            // console.log(data)
            setMockTask(data);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchTasks();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>

            {/* add task button */}
            <Button 
            onPress={() => router.push('/tasks/add-task')}
            style={{ margin: 2, borderRadius: 0, }}>
                Agregar Tarea
            </Button>
            {/* Lista de Tareas */}

           { mockTasks.length > 0 ? 
            <FlatList
                data={mockTasks}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <TaskItem {...item} />}
            />
                :
            <Text>No hay tareas</Text>
        }


        </SafeAreaView>

    )

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // gap: 2,
        // padding: 5,


    },
    searchContainer: {
        backgroundColor: 'green',
        borderColor: 'black',
        borderStyle: 'solid',
        borderWidth: 0.5,
        flexDirection: 'row',
        paddingHorizontal: 2,

    },
    searchInput: {
        flex: 6,

    },
    searchIcon: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    filterContainer: {
        padding: 2,
        backgroundColor: 'blue'
    },
    taskitemContainer: {
        borderRadius: 10,
        backgroundColor: 'orange',
        margin: 3,
        minHeight: 100,
        justifyContent: 'space-around',
        padding: 10
    }
})

export default index