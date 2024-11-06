// AppointmentRequests.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { auth } from './firebaseConfig';
import moment from 'moment';

export default function AppointmentRequests() {
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const db = getFirestore();
  const currentDoctorId = auth.currentUser?.uid;  // Получаем ID текущего доктора

  useEffect(() => {
    const fetchAppointmentRequests = async () => {
      if (!currentDoctorId) return;

      try {
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', currentDoctorId),
          where('status', '==', 'Ожидание')
        );

        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentRequestsData = await Promise.all(
          appointmentsSnapshot.docs.map(async (appointmentDoc) => {
            const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() };

            // Загрузка данных клиента
            const clientDoc = await getDoc(doc(db, 'users', appointment.clientId));
            const clientName = clientDoc.exists() ? clientDoc.data().name : 'Неизвестно';

            // Загрузка данных услуги
            const serviceDoc = await getDoc(doc(db, 'services', appointment.serviceId));
            const serviceName = serviceDoc.exists() ? serviceDoc.data().name : 'Не указана';

            return {
              ...appointment,
              clientName,
              serviceName,
            };
          })
        );

        setAppointmentRequests(appointmentRequestsData);
      } catch (error) {
        console.error("Ошибка при загрузке заявок на прием:", error);
        Alert.alert("Ошибка", "Не удалось загрузить заявки на прием.");
      }
    };

    fetchAppointmentRequests();
  }, [currentDoctorId]);

  const approveRequest = async (id) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'Одобрено' });
      setAppointmentRequests(prevRequests =>
        prevRequests.map(req => req.id === id ? { ...req, status: 'Одобрено' } : req)
      );
    } catch (error) {
      console.error("Ошибка при одобрении заявки:", error);
      Alert.alert("Ошибка", "Не удалось одобрить заявку.");
    }
  };

  const declineRequest = async (id) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'Отклонено' });
      setAppointmentRequests(prevRequests =>
        prevRequests.map(req => req.id === id ? { ...req, status: 'Отклонено' } : req)
      );
    } catch (error) {
      console.error("Ошибка при отклонении заявки:", error);
      Alert.alert("Ошибка", "Не удалось отклонить заявку.");
    }
  };

  return (
    <View style={styles.container}>

      <FlatList
        data={appointmentRequests}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            <Text style={styles.text}>Клиент: {item.clientName}</Text>
            <Text style={styles.text}>Дата и время: {item.date} {item.time}</Text>
            <Text style={styles.text}>Услуга: {item.serviceName}</Text>
            <Text style={styles.text}>Статус: {item.status}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Одобрить" onPress={() => approveRequest(item.id)} />
              <Button title="Отклонить" onPress={() => declineRequest(item.id)} color="red" />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noDataText}>Нет заявок на прием</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 5 },
  appointmentItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  noDataText: { textAlign: 'center', fontSize: 16, color: '#aaa', marginTop: 20 },
});
