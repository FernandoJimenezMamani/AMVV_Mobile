import React, { useState } from 'react'; 
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,Image } from 'react-native';
import axios from 'axios';
import { useSession } from '../../context/SessionProvider'; // Importar el contexto de sesión
import { useRouter } from 'expo-router'; 
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../../styles/login'
import logo from '../../assets/logo.png'; 

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const InicioDeSesion = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: ''
  });
  const { login } = useSession(); // Obtener la función login desde el contexto
  const router = useRouter(); // Para la navegación

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sesion/login`, formData);

      // Verifica que la respuesta contiene los datos esperados
      const { token } = response.data;

      // Llamar a la función login del contexto
      login({ token });
      
      // Navegar al dashboard después de un login exitoso
      router.push('/hamburgerAdmin');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'Correo o contraseña incorrectos');
    }
  };

  return (
    <LinearGradient
      colors={['#64848C', '#1B2426']} 
      style={styles.container}
    >
      <View style={styles.loginBox}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>INICIO DE SESIÓN</Text>
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
        <TouchableOpacity onPress={() => { /* Implementa lógica de recuperación de contraseña */ }}>
          <Text style={styles.forgotPassword}>¿Olvidó su contraseña?</Text>
        </TouchableOpacity>
        
        {/* Botón con gradiente */}
        <TouchableOpacity onPress={handleSubmit} style={styles.buttonContainer}>
          <LinearGradient
            colors={['#143E43', '#1E6770']} // Gradiente en el botón
            start={{ x: 0, y: 0 }} // Comienza desde la izquierda
            end={{ x: 1, y: 0 }}   // Termina en la derecha (to right)
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </LinearGradient>
        </TouchableOpacity>
        
      </View>
    </LinearGradient>
  );
};

export default InicioDeSesion;
