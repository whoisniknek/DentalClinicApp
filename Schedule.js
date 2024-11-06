import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { auth } from './firebaseConfig';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker'; // Библиотека для календаря

export default function Schedule() {
  const [appointments, setAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const db = getFirestore();
  const currentDoctorId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentDoctorId) return;

      try {
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', currentDoctorId)
        );

        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = await Promise.all(
          appointmentsSnapshot.docs.map(async (appointmentDoc) => {
            const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() };
            const clientDoc = await getDoc(doc(db, 'users', appointment.clientId));
            const clientName = clientDoc.exists() ? clientDoc.data().name : 'Неизвестно';
            const serviceDoc = await getDoc(doc(db, 'services', appointment.serviceId));
            const serviceName = serviceDoc.exists() ? serviceDoc.data().name : 'Не указана';

            return {
              ...appointment,
              clientName,
              serviceName,
            };
          })
        );

        const currentAppointments = appointmentsData.filter(appt => appt.status !== 'Выполнено');
        const completedAppointmentsList = appointmentsData.filter(appt => appt.status === 'Выполнено');

        setAppointments(currentAppointments);
        setCompletedAppointments(completedAppointmentsList);
      } catch (error) {
        console.error("Ошибка при загрузке данных приемов:", error);
        Alert.alert("Ошибка", "Не удалось загрузить данные приемов.");
      }
    };

    fetchAppointments();
  }, [currentDoctorId]);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateFilter;
    setShowDatePicker(false);
    setDateFilter(moment(currentDate).format('YYYY-MM-DD'));
  };

  const filteredAppointments = dateFilter
    ? appointments.filter(appt => moment(appt.date).isSame(dateFilter, 'day'))
    : appointments;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Расписание приемов</Text>
      <Button title="Выбрать дату" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={dateFilter ? new Date(dateFilter) : new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {dateFilter && (
        <View style={styles.filterContainer}>
          <Text>Выбранная дата: {dateFilter}</Text>
          <Button title="Очистить фильтр" onPress={() => setDateFilter(null)} />
        </View>
      )}

      <FlatList
        data={filteredAppointments}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            <Text style={styles.text}>Клиент: {item.clientName}</Text>
            <Text style={styles.text}>Дата и время: {item.date} {item.time}</Text>
            <Text style={styles.text}>Услуга: {item.serviceName}</Text>
            <Text style={styles.text}>Статус: {item.status}</Text>
            {item.status === 'Одобрено' && (
              <Button title="Выполнено" onPress={() => markAsCompleted(item.id)} />
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noDataText}>Нет текущих приемов</Text>}
      />

      <Text style={[styles.title, { marginTop: 20 }]}>Выполненные приемы</Text>
      <FlatList
        data={completedAppointments}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            <Text style={styles.text}>Клиент: {item.clientName}</Text>
            <Text style={styles.text}>Дата и время: {item.date} {item.time}</Text>
            <Text style={styles.text}>Услуга: {item.serviceName}</Text>
            <Text style={styles.text}>Статус: {item.status}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noDataText}>Нет выполненных приемов</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 5 },
  appointmentItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 10 },
  noDataText: { textAlign: 'center', fontSize: 16, color: '#aaa', marginTop: 20 },
  filterContainer: { marginVertical: 10 },
});
