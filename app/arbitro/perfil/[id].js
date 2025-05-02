import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert 
} from 'react-native';
import axios from 'axios';
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';
import styles from '../../../styles/modal_perfil';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');

const PerfilArbitroModal = ({ isOpen, onClose, arbitroId }) => {
  const [arbitro, setArbitro] = useState(null);
  const [totalPartidos, setTotalPartidos] = useState(0);
  const [campeonatos, setCampeonatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !arbitroId) return;

      setLoading(true);
      setError(null);
      
      try {
        const [arbitroResponse, partidosResponse, campeonatosResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/arbitro/get_arbitroById/${arbitroId}`),
          axios.get(`${API_BASE_URL}/arbitro/matchesTotal/${arbitroId}`),
          axios.get(`${API_BASE_URL}/arbitro/campeonatos/${arbitroId}`)
        ]);
        
        setArbitro(arbitroResponse.data);
        setTotalPartidos(partidosResponse.data.total_partidos_arbitrados || 0);
        setCampeonatos(campeonatosResponse.data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar datos del árbitro');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, arbitroId]);

  const getImagenPerfil = () => {
    if (!arbitro) return defaultUserMenIcon;
    if (arbitro.persona_imagen) {
      return { uri: arbitro.persona_imagen };
    }
    return arbitro.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3D8FA4" />
              <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>Perfil del Árbitro</Text>
              
              <View style={styles.header}>
                <Image 
                  source={getImagenPerfil()} 
                  style={styles.profileImage} 
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Nombre: </Text>
                    {arbitro?.nombre || 'N/A'} {arbitro?.apellido || ''}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Fecha Nacimiento: </Text>
                    {arbitro?.fecha_nacimiento || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Edad: </Text>
                    {calcularEdad(arbitro?.fecha_nacimiento)}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Correo: </Text>
                    {arbitro?.correo || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>CI: </Text>
                    {arbitro?.ci || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Dirección: </Text>
                    {arbitro?.direccion || 'N/A'}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Partidos Arbitrados</Text>
              <View style={styles.clubBox}>
                <View style={styles.clubItem}>
                  <View style={styles.clubDetails}>
                    <Text style={styles.clubName}>{totalPartidos} partidos arbitrados</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Campeonatos Participados</Text>
              <View style={styles.clubBox}>
                {campeonatos.length > 0 ? (
                  campeonatos.map((camp, index) => (
                    <View key={`camp-${index}`} style={styles.clubItem}>
                      <View style={styles.clubDetails}>
                        <Text style={styles.clubName}>{camp.campeonato_nombre || 'Campeonato desconocido'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No ha participado en campeonatos</Text>
                )}
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PerfilArbitroModal;