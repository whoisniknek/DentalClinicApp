// PatientProfile.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from './firebaseConfig';

export default function PatientProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const db = getFirestore();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
          setEmail(userData.email || '');
          setPhone(userData.phone || '');
          setCardNumber(userData.cardNumber || ''); // Доктор заполняет это поле
        }
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    await updateDoc(doc(db, 'users', userId), { name, phone });
    alert('Профиль обновлен');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      <TextInput placeholder="Имя" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Телефон" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Электронная почта" value={email} editable={false} style={[styles.input, { backgroundColor: '#eee' }]} />
      <TextInput placeholder="Номер карты" value={cardNumber} editable={false} style={[styles.input, { backgroundColor: '#eee' }]} />
      <Button title="Сохранить изменения" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
});
