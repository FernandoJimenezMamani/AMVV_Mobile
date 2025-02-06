import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { useSession } from '../../context/SessionProvider';
import { useRouter } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const Campeonatos = () => {
  const [campeonatos, setCampeonatos] = useState([]);
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Campeonatos/select`);
        setCampeonatos(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron obtener los campeonatos');
        console.error('Error al obtener los campeonatos:', error);
      }
    };

    fetchCampeonatos();
  }, []);

  const handleViewDetails = (id) => {
    router.push(`/categoria/indice/${id}`);
  };
  const handleEdit = (id) => {
    router.push(`/Campeonatos/Editar/${id}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.campeonatoCard}>
      <Text style={styles.campeonatoNombre}>{item.nombre}</Text>
      <Text style={styles.campeonatoFecha}>
        Inicio: {new Date(item.fecha_inicio).toLocaleDateString()}
      </Text>
      <View style={styles.campeonatoButtons}>
        <TouchableOpacity style={styles.button} onPress={() => handleViewDetails(item.id)}>
          <Text style={styles.buttonText}>Ver Detalles</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleEdit(item.id)}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Campeonatos</Text>
      <FlatList
        data={campeonatos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default Campeonatos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  campeonatoCard: {
    backgroundColor: '#507788',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  campeonatoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  campeonatoFecha: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
  },
  campeonatoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#3D8FA4',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
