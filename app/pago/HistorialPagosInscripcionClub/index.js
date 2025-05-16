import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import styles from '../../../styles/index_tabla';
import Club_defecto from '../../../assets/img/Club_defecto.png';
import { MaterialIcons } from '@expo/vector-icons';
import DetallePagoInscripcionModal from '../DetallePagoInscripcionModal'; // Tu modal de detalle

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const HistorialPagosInscripcionClubMobile = () => {
  const { presidenteId } = useLocalSearchParams();
  const [clubId, setClubId] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [equipoIdSeleccionado, setEquipoIdSeleccionado] = useState(null);

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/campeonatos/select`);
        setCampeonatos(response.data);
        if (response.data.length > 0) {
          setSelectedCampeonato(response.data[0].id);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener los campeonatos');
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
      try {
        const res = await axios.get(`${API_BASE_URL}/pagos/inscripcion/por-club/${clubId}/${selectedCampeonato}`);
        setPagos(res.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo obtener el historial de pagos');
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

  const getImagenClub = (imagen) => imagen ? { uri: imagen } : Club_defecto;

  const handleVerDetalle = (equipoId) => {
    setEquipoIdSeleccionado(equipoId);
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
      <Text style={styles.title}>Historial de Pagos de Inscripción</Text>

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
          <View key={pago.equipoId} style={styles.clubContainer}>
            <Image source={getImagenClub(pago.imagen_club)} style={styles.clubImage} />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{pago.equipo}</Text>
              <Text style={styles.clubDescription}>{pago.monto} Bs - {formatFecha(pago.fecha)}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleVerDetalle(pago.equipoId)}>
                <MaterialIcons name="remove-red-eye" size={24} color="#579FA6" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <DetallePagoInscripcionModal
        isOpen={showDetalle}
        onClose={() => setShowDetalle(false)}
        equipoId={equipoIdSeleccionado}
        campeonatoId={selectedCampeonato}
      />
    </ScrollView>
  );
};

export default HistorialPagosInscripcionClubMobile;
