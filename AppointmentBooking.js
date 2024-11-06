// AppointmentBooking.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import moment from 'moment';

export default function AppointmentBooking({ userId }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);

  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      // Получение услуг
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Получение докторов с фильтрацией по роли "doctor"
      const doctorsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'doctor')));
      setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const handleDateChange = async (day) => {
    const today = moment().startOf('day');
    const selectedDay = moment(day.dateString);

    if (selectedDay.isBefore(today)) {
      Alert.alert('Ошибка', 'Нельзя выбрать прошедшую дату.');
      return;
    }

    if (selectedDay.isSame(today, 'day') && moment().isAfter(moment().set({ hour: 18, minute: 0 }))) {
      Alert.alert('Ошибка', 'На сегодня запись уже невозможна.');
      return;
    }

    setSelectedDate(day.dateString);

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('date', '==', day.dateString)
    );
    const snapshot = await getDocs(appointmentsQuery);

    // Получение занятых временных слотов
    const busyTimes = snapshot.docs.map(doc => ({
      time: doc.data().time,
      duration: services.find(service => service.id === doc.data().serviceId)?.duration || 0,
    }));

    // Генерация интервалов с 9:00 до 17:45, чтобы последний прием мог закончиться к 18:00
    const allTimes = Array.from({ length: 36 }, (_, i) => {
      const hours = 9 + Math.floor(i / 2);
      const minutes = (i % 2) * 30;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });

    const available = allTimes.filter((time) => {
      return !busyTimes.some(busy => {
        const [busyHour, busyMinute] = busy.time.split(':').map(Number);
        const busyStart = busyHour * 60 + busyMinute;
        const [hour, minute] = time.split(':').map(Number);
        const current = hour * 60 + minute;
        return current >= busyStart && current < busyStart + busy.duration;
      });
    });
    setAvailableTimes(available);
  };

  const handleBooking = async () => {
    console.log("Selected values:", {
      date: selectedDate,
      time: selectedTime,
      service: selectedService,
      doctor: selectedDoctor,
    });

    if (!selectedDate) {
      Alert.alert('Ошибка', 'Выберите дату приема.');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Ошибка', 'Выберите время приема.');
      return;
    }
    if (!selectedService) {
      Alert.alert('Ошибка', 'Выберите услугу.');
      return;
    }
    if (!selectedDoctor) {
      Alert.alert('Ошибка', 'Выберите доктора.');
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        clientId: userId,
        doctorId: selectedDoctor,
        serviceId: selectedService,
        date: selectedDate,
        time: selectedTime,
        status: 'Ожидание'
      });
      Alert.alert('Успех', 'Запись на прием создана.');
    } catch (error) {

      console.error("Ошибка при создании записи:", error);
      Alert.alert('Ошибка', 'Не удалось создать запись.');
    }

  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Выберите дату приема</Text>
        <Calendar
          minDate={moment().format('YYYY-MM-DD')} // Ограничение на прошедшие даты
          onDayPress={handleDateChange}
          markedDates={{ [selectedDate]: { selected: true, selectedColor: '#2E66E7' } }}
        />

        <Text style={styles.title}>Выберите время</Text>
        <Picker selectedValue={selectedTime} onValueChange={(itemValue) => setSelectedTime(itemValue)}>
          {availableTimes.map(time => (
            <Picker.Item key={time} label={time} value={time} />
          ))}
        </Picker>

        <Text style={styles.title}>Выберите услугу</Text>
        <Picker selectedValue={selectedService} onValueChange={(itemValue) => setSelectedService(itemValue)}>
          {services.map(service => (
            <Picker.Item key={service.id} label={`${service.name} - ${service.price}₽`} value={service.id} />
          ))}
        </Picker>

        <Text style={styles.title}>Выберите доктора</Text>
        <Picker selectedValue={selectedDoctor} onValueChange={(itemValue) => setSelectedDoctor(itemValue)}>
          {doctors.map(doctor => (
            <Picker.Item key={doctor.id} label={doctor.name} value={doctor.id} />
          ))}
        </Picker>

        <Button title="Записаться" onPress={handleBooking} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 16 },
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});
