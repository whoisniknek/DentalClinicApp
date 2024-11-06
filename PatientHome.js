import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PatientHome() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать, Пациент!</Text>
      <Button title="Запись на прием" onPress={() => navigation.navigate('AppointmentBooking')} />
      <Button title="Редактировать профиль" onPress={() => navigation.navigate('PatientProfile')} />
      <Button title="Услуги и цены" onPress={() => navigation.navigate('ServiceList')} />
      <Button title="Карта клиники" onPress={() => navigation.navigate('ClinicMap')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 }
});
