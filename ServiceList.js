import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchServices = async () => {
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchServices();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список услуг и цены</Text>
      <FlatList
        data={services}
        renderItem={({ item }) => (
          <View style={styles.serviceItem}>
            <Text>{item.name} - {item.price}₽ ({item.duration} мин)</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  serviceItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
});
