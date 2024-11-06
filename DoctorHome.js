import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function DoctorHome() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать, Доктор!</Text>
      <Button title="Управление услугами" onPress={() => navigation.navigate('ManageServices')} />
      <Button title="Управление клиентами" onPress={() => navigation.navigate('ManageClients')} />
      <Button title="Заявки на прием" onPress={() => navigation.navigate('AppointmentRequests')} />
      <Button title="Расписание приемов" onPress={() => navigation.navigate('Schedule')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 }
});
