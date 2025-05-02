import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useSession } from '../../context/SessionProvider';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import logo from '../../assets/logo.png';
import styles from '../../styles/login';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { registerForPushNotifications } from '../../services/notification';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const InicioDeSesion = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: '',
  });
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const { login, updateRole } = useSession(); // Usa updateRole del contexto
  const router = useRouter();

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sesion/login`, formData);
      console.log('Respuesta del backend:', response.data);

      const { requireRoleSelection, roles, token, user } = response.data;

      if (requireRoleSelection) {
        setRoles(roles);
      } else {
        login({ user, token });
        // Registrar token push después del login exitoso
        try {
          await registerForPushNotifications();
        } catch (error) {
          console.error('Error al registrar notificaciones push:', error);

        }
        router.push('/campeonato'); // Cambiado de '/hamburgerAdmin' a '/campeonatos'
        Toast.show({
                type: 'success',
                text1: 'Iniciaste sesion',
                position: 'bottom'
              });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Correo o contraseña incorrectos',
          position: 'bottom'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Ocurrió un error al iniciar sesión',
          position: 'bottom'
        });
      }
    }
  };

  const handleRoleSelection = async () => {
    if (!selectedRoleId) {
      Alert.alert('Advertencia', 'Seleccione un rol para continuar');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/sesion/login`,
        { ...formData, selectedRoleId },
        { withCredentials: true }
      );

      const { token, user } = response.data;
      login({ user, token });

      // Guardar el rol seleccionado en el contexto y AsyncStorage
      const selectedRole = roles.find((role) => role.id === selectedRoleId);
      if (selectedRole) {
        updateRole(selectedRole);
      }

      router.push('/'); 
      Toast.show({
        type: 'success',
        text1: 'Iniciaste sesion',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Error al procesar el rol seleccionado:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar su rol');
    }
  };

  return (
    <LinearGradient colors={['#64848C', '#1B2426']} style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
        <Icon name="home" size={32} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.loginBox}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>INICIO DE SESIÓN</Text>
        {roles.length > 0 ? (
          <View style={styles.roleSelectionContainer}>
            <Text style={styles.roleSelectionTitle}>Seleccione un rol</Text>
            <Picker
              selectedValue={selectedRoleId}
              style={styles.roleSelect}
              onValueChange={(itemValue) => setSelectedRoleId(itemValue)}
            >
              <Picker.Item label="-- Seleccione un rol --" value="" />
              {roles.map((role) => (
                <Picker.Item key={role.id} label={role.nombre} value={role.id} />
              ))}
            </Picker>
            <TouchableOpacity onPress={handleRoleSelection} style={styles.buttonContainer}>
              <LinearGradient
                colors={['#143E43', '#1E6770']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario o correo"
                value={formData.correo}
                onChangeText={(value) => handleChange('correo', value)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={formData.contraseña}
                onChangeText={(value) => handleChange('contraseña', value)}
                secureTextEntry
              />
            </View>
            <TouchableOpacity onPress={handleSubmit} style={styles.buttonContainer}>
              <LinearGradient
                colors={['#143E43', '#1E6770']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
};

export default InicioDeSesion;