// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from './firebaseConfig';
import { ActivityIndicator, View, Alert } from 'react-native';
import DoctorHome from './DoctorHome';
import PatientHome from './PatientHome';
import AppointmentBooking from './AppointmentBooking';
import PatientProfile from './PatientProfile';
import ServiceList from './ServiceList';
import ClinicMap from './ClinicMap';
import ManageServices from './ManageServices';
import ManageClients from './ManageClients';
import AppointmentRequests from './AppointmentRequests';
import Schedule from './Schedule';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import DoctorProfile from './DoctorProfile';

const Drawer = createDrawerNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.log("Error fetching user role: ", error);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  return (
    <NavigationContainer>
      {user ? (
        <Drawer.Navigator initialRouteName={role === 'doctor' ? 'DoctorHome' : 'PatientHome'}
                          drawerContent={(props) => <CustomDrawerContent {...props} role={role} />}>
          {role === 'doctor' ? (
            <>
              <Drawer.Screen name="DoctorHome" component={DoctorHome} options={{ title: 'Главная' }} />
              <Drawer.Screen name="ManageServices" component={ManageServices} options={{ title: 'Управление услугами' }} />
              <Drawer.Screen name="ManageClients" component={ManageClients} options={{ title: 'Управление клиентами' }} />
              <Drawer.Screen name="AppointmentRequests" component={AppointmentRequests} options={{ title: 'Заявки на прием' }} />
              <Drawer.Screen name="Schedule" component={Schedule} options={{ title: 'Расписание приемов' }} />
              <Drawer.Screen name="DoctorProfile" component={DoctorProfile} options={{ title: 'Профиль доктора' }} />
            </>
          ) : (
            <>
              <Drawer.Screen name="PatientHome" component={PatientHome} options={{ title: 'Главная' }} />
              <Drawer.Screen
                name="AppointmentBooking"
                options={{ title: 'Запись на прием' }}
              >
                {props => <AppointmentBooking {...props} userId={user?.uid} />}
              </Drawer.Screen>
              <Drawer.Screen name="PatientProfile" component={PatientProfile} options={{ title: 'Профиль' }} />
              <Drawer.Screen name="ServiceList" component={ServiceList} options={{ title: 'Услуги и цены' }} />
              <Drawer.Screen name="ClinicMap" component={ClinicMap} options={{ title: 'Карта клиники' }} />
            </>
          )}
        </Drawer.Navigator>
      ) : (
        <Drawer.Navigator>
          <Drawer.Screen name="Login" component={LoginScreen} options={{ title: 'Вход' }} />
          <Drawer.Screen name="Register" component={RegisterScreen} options={{ title: 'Регистрация' }} />
        </Drawer.Navigator>
      )}
    </NavigationContainer>
  );
}

function CustomDrawerContent(props) {
  const { role } = props;
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Выход"
        onPress={() => {
          auth.signOut().then(() => {
            props.navigation.navigate('Login');
          });
        }}
        style={{ marginTop: 'auto' }}
      />
    </DrawerContentScrollView>
  );
}
