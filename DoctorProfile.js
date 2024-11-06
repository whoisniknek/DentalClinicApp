// DoctorProfile.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from './firebaseConfig';

export default function DoctorProfile() {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const db = getFirestore();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
          setSpecialization(userData.specialization || '');
          setPhone(userData.phone || '');
        } else {
          Alert.alert('Ошибка', 'Профиль пользователя не найден');
        }
      }
    };
    fetchDoctorProfile();
  }, [userId]);

  const handleSave = async () => {
    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          name,
          specialization,
          phone,
        });
        Alert.alert('Успех', 'Профиль обновлен');
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось обновить профиль');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Редактировать профиль</Text>
      <Text style={styles.label}>ФИО</Text>
      <TextInput
        placeholder="Введите ФИО"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Text style={styles.label}>Специализация</Text>
      <TextInput
        placeholder="Введите специализацию"
        value={specialization}
        onChangeText={setSpecialization}
        style={styles.input}
      />
      <Text style={styles.label}>Телефон</Text>
      <TextInput
        placeholder="Введите телефон"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <Button title="Сохранить изменения" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
});
