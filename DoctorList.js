// DoctorList.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorSnapshot = await getDocs(collection(db, 'doctors'));
      setDoctors(doctorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchDoctors();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список докторов</Text>
      <FlatList
        data={doctors}
        renderItem={({ item }) => (
          <View style={styles.doctorItem}>
            <Text>ФИО: {item.name}</Text>
            <Text>Специализация: {item.specialization}</Text>
            <Text>Телефон: {item.phone}</Text>
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
  doctorItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 10 }
});
