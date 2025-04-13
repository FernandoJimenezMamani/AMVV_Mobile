import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../../styles/index_tabla';
import TablaSolicitudesPresidente from '../tabla_solicitud_presidente';
import TablaSolicitudesJugador from '../tabla_solicitud_jugador';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const IndiceSolicitudesPresidente = () => {
  const [tipoSolicitud, setTipoSolicitud] = useState('Presidente');
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/campeonatos/select`);
        setCampeonatos(response.data);
        const activo = response.data.find(c => c.estado !== 3);
        setSelectedCampeonato(activo ? activo.id : response.data[0]?.id);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener campeonatos');
        console.error(error);
      }
    };
    fetchCampeonatos();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitudes de Traspaso</Text>

      <View style={styles.filterContainer}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoSolicitud}
            onValueChange={(itemValue) => setTipoSolicitud(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Solicitudes de Presidentes" value="Presidente" />
            <Picker.Item label="Solicitudes de Jugadores" value="Jugador" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCampeonato}
            onValueChange={(itemValue) => setSelectedCampeonato(itemValue)}
            style={styles.picker}
          >
            {campeonatos.map((camp) => (
              <Picker.Item 
                key={camp.id} 
                label={`🏆 ${camp.nombre}`} 
                value={camp.id} 
              />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={estadoFiltro}
            onValueChange={(itemValue) => setEstadoFiltro(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Todos los Estados" value="TODOS" />
            <Picker.Item label="Pendiente" value="PENDIENTE" />
            <Picker.Item label="Aprobado" value="APROBADO" />
            <Picker.Item label="Rechazado" value="RECHAZADO" />
          </Picker>
        </View>
      </View>

      {tipoSolicitud === 'Presidente' && (
        <TablaSolicitudesPresidente 
          campeonatoId={selectedCampeonato} 
          estadoFiltro={estadoFiltro} 
        />
      )}

      {tipoSolicitud === 'Jugador' && (
        <TablaSolicitudesJugador 
          campeonatoId={selectedCampeonato}   
          estadoFiltro={estadoFiltro} 
        />
      )}
    </ScrollView>
  );
};

export default IndiceSolicitudesPresidente;