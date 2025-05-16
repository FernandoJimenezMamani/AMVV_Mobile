import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import styles from '../../../styles/index_tabla';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import DetallePagoTraspasoModal from '../DetallePagoTraspasoModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const HistorialPagosTraspasoClubMobile = () => {
  const { presidenteId } = useLocalSearchParams();
  const [clubId, setClubId] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [traspasoIdSeleccionado, setTraspasoIdSeleccionado] = useState(null);

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/campeonatos/select`);
        setCampeonatos(res.data);
        if (res.data.length > 0) setSelectedCampeonato(res.data[0].id);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron obtener los campeonatos');
      }
    };
    fetchCampeonatos();
  }, []);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/presidente_club/get_presidenteById/${presidenteId}`);
        setClubId(res.data.club_presidente);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener el club');
      }
    };
    if (presidenteId) fetchClub();
  }, [presidenteId]);

  useEffect(() => {
    const fetchPagos = async () => {
      if (!clubId || !selectedCampeonato) return;
      setPagos([]);
      try {
        const res = await axios.get(`${API_BASE_URL}/pagos/traspasos/por-club/${clubId}/${selectedCampeonato}`);
        setPagos(res.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron obtener los pagos de traspasos');
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, [clubId, selectedCampeonato]);

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const handleVerDetalle = (traspasoId) => {
    setTraspasoIdSeleccionado(traspasoId);
    setShowDetalle(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historial de Traspasos</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCampeonato}
          onValueChange={(value) => setSelectedCampeonato(value)}
          style={styles.picker}
        >
          {campeonatos.map((camp) => (
            <Picker.Item key={camp.id} label={camp.nombre} value={camp.id} />
          ))}
        </Picker>
      </View>

      {pagos.length === 0 ? (
        <Text style={styles.emptyText}>No hay pagos registrados</Text>
      ) : (
        pagos.map((pago) => (
          <View key={pago.traspaso_id} style={styles.clubContainer}>
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{pago.jugador_nombre} {pago.jugador_apellido}</Text>
              <Text style={styles.clubDescription}>{pago.monto_real} Bs - {formatFecha(pago.pago_fecha)}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleVerDetalle(pago.traspaso_id)}>
                <MaterialIcons name="remove-red-eye" size={24} color="#579FA6" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <DetallePagoTraspasoModal
        isOpen={showDetalle}
        onClose={() => setShowDetalle(false)}
        traspasoId={traspasoIdSeleccionado}
        campeonatoId={selectedCampeonato}
      />
    </ScrollView>
  );
};

export default HistorialPagosTraspasoClubMobile;
