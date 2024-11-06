import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ManageClients() {
  const [clients, setClients] = useState([]);
  const [editingClientId, setEditingClientId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCardNumber, setEditCardNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    // Получение текущего пользователя
    const user = auth.currentUser;
    setCurrentUser(user);

    const fetchClients = async () => {
      const clientsSnapshot = await getDocs(collection(db, 'users'));
      const allClients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Фильтруем только пользователей с ролью "patient"
      const filteredClients = allClients.filter(client => client.role === 'patient');
      setClients(filteredClients);
    };
    fetchClients();
  }, []);

  const startEditing = (client) => {
    // Проверка прав доступа: разрешить редактирование только для пользователей с ролью "patient"
    if (client.role !== 'patient') {
      alert('Вы можете редактировать только данные пациентов.');
      return;
    }
    setEditingClientId(client.id);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditCardNumber(client.cardNumber || '');
  };

  const saveClientChanges = async () => {
    if (editingClientId) {
      await updateDoc(doc(db, 'users', editingClientId), {
        name: editName,
        phone: editPhone,
        cardNumber: editCardNumber,
      });
      setClients(clients.map(client => client.id === editingClientId
        ? { ...client, name: editName, phone: editPhone, cardNumber: editCardNumber }
        : client
      ));
      setEditingClientId(null);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Поиск по имени или телефону"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredClients}
        renderItem={({ item }) => (
          <View style={styles.clientItem}>
            {editingClientId === item.id ? (
              <View>
                <Text style={styles.label}>Имя</Text>
                <TextInput
                  placeholder="Имя клиента"
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.input}
                />
                <Text style={styles.label}>Телефон</Text>
                <TextInput
                  placeholder="Телефон клиента"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                <Text style={styles.label}>Номер карты</Text>
                <TextInput
                  placeholder="Номер карты клиента"
                  value={editCardNumber}
                  onChangeText={setEditCardNumber}
                  style={styles.input}
                />
                <Button title="Сохранить" onPress={saveClientChanges} />
                <Button title="Отмена" color="red" onPress={() => setEditingClientId(null)} />
              </View>
            ) : (
              <View>
                <Text>Имя: {item.name}</Text>
                <Text>Телефон: {item.phone}</Text>
                <Text>Номер карты: {item.cardNumber || 'Не назначен'}</Text>
                <TouchableOpacity onPress={() => startEditing(item)} style={styles.editButton}>
                  <Text style={styles.editButtonText}>Редактировать</Text>
                </TouchableOpacity>
              </View>
            )}
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
  searchInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  clientItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  editButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginTop: 5 },
  editButtonText: { color: 'white', textAlign: 'center' }
});
