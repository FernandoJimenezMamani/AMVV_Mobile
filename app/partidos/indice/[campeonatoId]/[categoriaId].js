import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PartidosList = () => {
  const { campeonatoId, categoriaId } = useLocalSearchParams(); // Obtener los parámetros desde la URL
  const [partidos, setPartidos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/partidos/select/${categoriaId}/${campeonatoId}`);
        setPartidos(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron obtener los partidos');
        console.error('Error al obtener los partidos:', error);
      }
    };

    if (categoriaId && campeonatoId) {
      fetchPartidos();
    }
  }, [categoriaId, campeonatoId]);

  const handleRegistrarPartido = () => {
    router.push(`/partidos/registroResultados/${partidoId}/${campeonatoId}/${categoriaId}`);
  };

  const handleVerTabla = () => {
    router.push(`/tablaposiciones/${categoriaId}/${campeonatoId}`);
  };

  const handlePartidoClick = (partidoId) => {
    router.push(`/partidos/registroResultados/${partidoId}/${campeonatoId}/${categoriaId}`);
  };

  const renderPartidoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.partidoCard}
      onPress={() => handlePartidoClick(item.id)}
    >
      <View style={styles.teamInfo}>
        <View style={styles.team}>
         
          <Text style={styles.teamName}>{item.equipo_local_nombre}</Text>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.team}>
          <Image source={{ uri: item.equipo_visitante_imagen }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{item.equipo_visitante_nombre}</Text>
        </View>
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchDate}>{formatDate(item.fecha)}</Text>
        <Text style={styles.matchTime}>
          {new Date(item.fecha).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const formatDate = (fecha) => {
    const now = new Date();
    const partidoDate = new Date(fecha);
    const currentWeek = now.getWeek();
    const partidoWeek = partidoDate.getWeek();

    if (currentWeek === partidoWeek) {
      return partidoDate.toLocaleDateString('es-ES', { weekday: 'long' });
    } else {
      return partidoDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  // Adding getWeek method to Date prototype
  Date.prototype.getWeek = function () {
    const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
    const pastDaysOfYear = (this - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partidos</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRegistrarPartido}>
          <Text style={styles.buttonText}>Registrar Partido</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleVerTabla}>
          <Text style={styles.buttonText}>Ver tabla</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={partidos}
        renderItem={renderPartidoItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default PartidosList;

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
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#507788',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  partidoCard: {
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  teamInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  team: {
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  teamName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  matchInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  matchDate: {
    fontSize: 14,
    color: '#555',
  },
  matchTime: {
    fontSize: 14,
    color: '#555',
  },
});
