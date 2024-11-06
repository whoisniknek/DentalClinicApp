// ManageServices.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function ManageServices() {
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [services, setServices] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchServices = async () => {
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchServices();
  }, []);

  const addService = async () => {
    const newService = { name: serviceName, price: parseInt(servicePrice), duration: parseInt(serviceDuration) };
    const docRef = await addDoc(collection(db, 'services'), newService);
    setServices([...services, { ...newService, id: docRef.id }]);
    setServiceName('');
    setServicePrice('');
    setServiceDuration('');
  };

  const deleteService = async (id) => {
    await deleteDoc(doc(db, 'services', id));
    setServices(services.filter(service => service.id !== id));
  };

  return (
    <View style={styles.container}>

      <Text style={styles.label}>Название услуги</Text>
      <TextInput
        placeholder="Введите название услуги"
        value={serviceName}
        onChangeText={setServiceName}
        style={styles.input}
      />
      <Text style={styles.label}>Цена</Text>
      <TextInput
        placeholder="Введите цену"
        value={servicePrice}
        onChangeText={setServicePrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <Text style={styles.label}>Длительность (мин)</Text>
      <TextInput
        placeholder="Введите длительность в минутах"
        value={serviceDuration}
        onChangeText={setServiceDuration}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Добавить услугу" onPress={addService} />
      <Text style={styles.label}>Услуги:</Text>
      <FlatList
        data={services}
        renderItem={({ item }) => (
          <View style={styles.serviceItem}>
            <Text>{item.name} - {item.price}₽ ({item.duration} мин)</Text>
            <Button title="Удалить" onPress={() => deleteService(item.id)} color="red" />
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
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  serviceItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' }
});
