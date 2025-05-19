import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import styles from '../../../styles/index_tabla';
import TablaSolicitudesPresidente from '../tabla_solicitud_presidente';
import TablaSolicitudesJugador from '../tabla_solicitud_jugador';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter} from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const IndiceSolicitudesPresidente = () => {
  const [tipoSolicitud, setTipoSolicitud] = useState('Presidente');
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/campeonatos/select`);
        setCampeonatos(response.data);
        const activo = response.data.find(c => c.estado !== 3);
        setSelectedCampeonato(activo ? activo.id : response.data[0]?.id);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener campeonatos');
      } finally {
        setLoading(false);
      }
    };
    fetchCampeonatos();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#143E42" />
          </TouchableOpacity>
        <Text style={styles.title}>Solicitudes de Traspaso</Text>
      </View>

      {/* Filtro de Tipo de Solicitud */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoSolicitud}
          onValueChange={setTipoSolicitud}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          <Picker.Item label="Tipo de solicitud" value="" enabled={false} color="#999" />
          <Picker.Item label="Solicitudes de Presidentes" value="Presidente" />
          <Picker.Item label="Solicitudes de Jugadores" value="Jugador" />
        </Picker>
      </View>

      {/* Filtro de Campeonato */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCampeonato}
          onValueChange={setSelectedCampeonato}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          <Picker.Item label="Seleccione campeonato" value="" enabled={false} color="#999" />
          {campeonatos.map((camp) => (
            <Picker.Item 
              key={camp.id} 
              label={camp.nombre.length > 15 ? `${camp.nombre.substring(0, 15)}...` : camp.nombre}
              value={camp.id}
            />
          ))}
        </Picker>
      </View>

      {/* Filtro de Estado - CORREGIDO */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={estadoFiltro}
          onValueChange={setEstadoFiltro}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          <Picker.Item label="Filtrar por estado" value="" enabled={false} color="#999" />
          <Picker.Item label="Todos los estados" value="TODOS" />
          <Picker.Item label="Pendiente" value="PENDIENTE" />
          <Picker.Item label="Aprobado" value="APROBADO" />
          <Picker.Item label="Rechazado" value="RECHAZADO" />
          <Picker.Item label="Finalizado" value="FINALIZADO" />
        </Picker>
      </View>

      <ScrollView style={styles.listContainer}>
        {tipoSolicitud === 'Presidente' ? (
          <TablaSolicitudesPresidente 
            campeonatoId={selectedCampeonato} 
            estadoFiltro={estadoFiltro} 
          />
        ) : (
          <TablaSolicitudesJugador 
            campeonatoId={selectedCampeonato}   
            estadoFiltro={estadoFiltro} 
          />
        )}
      </ScrollView>
    </View>
  );
};

export default IndiceSolicitudesPresidente;