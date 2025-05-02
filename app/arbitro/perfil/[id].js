import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import styles from '../../../styles/modal_perfil'; // Reutilizamos el mismo archivo de estilos
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PerfilArbitroModal = ({ isOpen, onClose, id }) => {
  const [arbitro, setArbitro] = useState(null);
  const [totalPartidos, setTotalPartidos] = useState(0);
  const [campeonatos, setCampeonatos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !id || isNaN(id)) return;
  
      setLoading(true);
      try {
        // Datos del árbitro
        const arbitroRes = await axios.get(`${API_BASE_URL}/arbitro/get_arbitroById/${id}`);
        setArbitro(arbitroRes.data);
      } catch (err) {
        console.error('Error al obtener árbitro:', err);
        setArbitro(null);
      }
  
      try {
        // Total de partidos
        const totalRes = await axios.get(`${API_BASE_URL}/arbitro/matchesTotal/${id}`);
        setTotalPartidos(totalRes.data?.total_partidos_arbitrados ?? 0);
      } catch (err) {
        console.warn('No tiene partidos arbitrados (404 esperado)');
        setTotalPartidos(0);
      }
  
      try {
        // Campeonatos
        const campRes = await axios.get(`${API_BASE_URL}/arbitro/campeonatos/${id}`);
        setCampeonatos(Array.isArray(campRes.data) ? campRes.data : []);
      } catch (err) {
        console.warn('No tiene campeonatos registrados (404 esperado)');
        setCampeonatos([]);
      }
  
      setLoading(false);
    };
  
    fetchData();
  }, [isOpen, id]);
  
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
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>Perfil del Árbitro</Text>

              <View style={styles.header}>
                <Image source={getImagenPerfil()} style={styles.profileImage} />
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Nombre: </Text>{arbitro?.nombre} {arbitro?.apellido}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Fecha de Nacimiento: </Text>{arbitro?.fecha_nacimiento}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Edad: </Text>{calcularEdad(arbitro?.fecha_nacimiento)}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Correo: </Text>{arbitro?.correo}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>C.I: </Text>{arbitro?.ci}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Dirección: </Text>{arbitro?.direccion}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Partidos Arbitrados</Text>
              <View style={styles.clubBox}>
                <Text style={styles.clubName}>{totalPartidos} partidos</Text>
              </View>

              <Text style={styles.sectionTitle}>Campeonatos Participados</Text>
              <View style={styles.clubBox}>
                {campeonatos.length > 0 ? (
                  campeonatos.map((camp, index) => (
                    <View key={`camp-${index}`} style={styles.clubItem}>
                      <Text style={styles.clubName}>{camp.campeonato_nombre}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No ha participado en campeonatos.</Text>
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
