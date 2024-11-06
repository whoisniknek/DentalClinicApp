// LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Навигацию выполнять не нужно, так как App.js обрабатывает перенаправление на основе роли
    } catch (error) {
      Alert.alert('Ошибка входа', error.message);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Войти" onPress={handleLogin} />
      <TouchableOpacity onPress={handleRegister} style={styles.registerLink}>
        <Text style={styles.registerText}>Нет аккаунта? Зарегистрироваться</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  registerLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  registerText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
