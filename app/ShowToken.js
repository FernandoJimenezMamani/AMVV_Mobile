import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSession } from '../context/SessionProvider'; // Ajusta la ruta según tu estructura

const TokenScreen = ({ navigation }) => {
  const { tokenData } = useSession(); // Accede a los datos decodificados del token

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos del Token</Text>
      <Text style={styles.label}>Usuario: {tokenData?.nombre || 'N/A'}</Text>
      <Text style={styles.label}>Email: {tokenData?.correo || 'N/A'}</Text>
      
      {/* Mapeamos todos los roles */}
      <Text style={styles.label}>Roles:</Text>
      {tokenData?.roles?.map((rol, index) => (
        <Text key={index} style={styles.role}>{rol}</Text>
      )) || <Text style={styles.label}>N/A</Text>}
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>CONTINUAR AL DASHBOARD</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
  role: {
    fontSize: 16,
    color: '#007bff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TokenScreen;
