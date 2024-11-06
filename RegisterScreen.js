// RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const db = getFirestore();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Добавление данных пользователя в Firestore
      await addDoc(collection(db, 'users'), {
        id: userId,
        name,
        phone,
        email,
        role: 'client',
        cardNumber: '', // пустое поле, чтобы позже заполнил доктор
        number: Math.floor(Math.random() * 100000) // уникальный номер пользователя
      });

      Alert.alert('Успешно', 'Регистрация завершена');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
      <TextInput placeholder="Имя" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Телефон" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Электронная почта" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Пароль" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Зарегистрироваться" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
});
