import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import axios from 'axios';
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';
import Club_defecto from '../../../assets/img/Default_Imagen_Club.webp';
import { useSession } from '../../../context/SessionProvider';
import rolMapping from '../../../constants/roles';
import styles from '../../../styles/modal_perfil';

const { width } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PerfilPresidenteModal = ({ isOpen, onClose, presidenteId }) => {
  const [presidente, setPresidente] = useState(null);
  const [clubActual, setClubActual] = useState(null);
  const [clubesAnteriores, setClubesAnteriores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSession();
  
  useEffect(() => {
    if (isOpen && presidenteId) {
      fetchPresidenteData(presidenteId);
      fetchClubActual(presidenteId);
      fetchClubesAnteriores(presidenteId);
    }
  }, [isOpen, presidenteId]);

  const fetchPresidenteData = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/presidente_club/get_presidenteById/${id}`);
      setPresidente(response.data);
    } catch (error) {
      console.error('Error al obtener datos del presidente:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubActual = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/presidente_club/clubActual/${id}`);
      setClubActual(response.data);
    } catch (error) {
      console.error('Error al obtener el club actual del presidente:', error);
    }
  };

  const fetchClubesAnteriores = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/presidente_club/clubesAnteriores/${id}`);
      setClubesAnteriores(response.data);
    } catch (error) {
      
    }
  };

  const getImagenPerfil = () => {
    if (presidente?.persona_imagen) {
      return { uri: presidente.persona_imagen };
    }
    return presidente?.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
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
    return edad;
  };

  const getImagenClub = (club) => {
    if (club?.club_imagen) {
      return { uri: club.club_imagen };
    }
    return Club_defecto;
  };

  const hasRole = (...roles) => {
    return user && user.rol && roles.includes(user.rol.nombre);
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3D8FA4" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>Perfil del Presidente</Text>
              
              {/* Header con información del presidente */}
              <View style={styles.header}>
                <Image source={getImagenPerfil()} style={styles.profileImage} />
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Nombre: </Text>
                    {presidente?.nombre} {presidente?.apellido}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Fecha de Nacimiento: </Text>
                    {presidente?.fecha_nacimiento || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Edad: </Text>
                    {calcularEdad(presidente?.fecha_nacimiento)} años
                  </Text>
                  {hasRole(rolMapping.PresidenteAsociacion) && (
                    <>
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Correo: </Text>
                        {presidente?.correo || 'N/A'}
                      </Text>
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Cédula de Identidad: </Text>
                        {presidente?.ci || 'N/A'}
                      </Text>
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Dirección: </Text>
                        {presidente?.direccion || 'N/A'}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Club Actual */}
              <Text style={styles.sectionTitle}>Club Actual</Text>
              <View style={styles.clubBox}>
                {clubActual ? (
                  <View style={styles.clubItem}>
                    <Image source={getImagenClub(clubActual)} style={styles.clubIcon} />
                    <View style={styles.clubDetails}>
                      <Text style={styles.clubName}>{clubActual.club_nombre}</Text>
                      <Text style={styles.clubTeam}>{clubActual.descripcion}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No tiene un club activo actualmente.</Text>
                )}
              </View>

              {/* Clubes Anteriores */}
              <Text style={styles.sectionTitle}>Clubes Anteriores</Text>
              <View style={styles.clubBox}>
                {clubesAnteriores.length > 0 ? (
                  clubesAnteriores.map((club, index) => (
                    <View key={index} style={styles.clubItem}>
                      <Image source={getImagenClub(club)} style={styles.clubIcon} />
                      <View style={styles.clubDetails}>
                        <Text style={styles.clubName}>{club.club_nombre}</Text>
                        <Text style={styles.clubTeam}>{club.descripcion}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No tiene clubes anteriores registrados.</Text>
                )}
              </View>

              {/* Botón de cerrar */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PerfilPresidenteModal;