import { loadPoints } from '@/db/storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, IconButton } from 'react-native-paper';

const PointsBadge = () => {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      const pts = await loadPoints();
      setPoints(pts);
    };
    fetchPoints();

    const interval = setInterval(fetchPoints, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <IconButton
        icon="star"
        size={28}
        style={styles.icon}
        containerColor="#FFD600"
        iconColor="#fff"
        disabled
      />
      <Badge style={styles.badge}>{points}</Badge>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
    alignSelf: 'center',
  },
  icon: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF9800',
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PointsBadge;