import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import styles from '../../../styles/modal_perfil';
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';
import Club_defecto from '../../../assets/img/Default_Imagen_Club.webp';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PerfilDelegadoModal = ({ isOpen, onClose, delegadoId }) => {
  const [delegado, setDelegado] = useState(null);
  const [clubActual, setClubActual] = useState(null);
  const [clubesAnteriores, setClubesAnteriores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && delegadoId) {
      fetchDelegadoData(delegadoId);
      fetchClubActual(delegadoId);
      fetchClubesAnteriores(delegadoId);
    }
  }, [isOpen, delegadoId]);
  
  const fetchDelegadoData = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/presidente_club/get_delegadoById/${id}`);
      setDelegado(res.data);
    } catch (error) {
      console.log('Error al obtener datos personales del delegado:', error);
      setDelegado(null);
    } finally {
      setLoading(false); // solo termina el loading general cuando ya cargó algo útil
    }
  };
  
  const fetchClubActual = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/presidente_club/clubActualDelegado/${id}`);
      setClubActual(res.data);
    } catch (error) {
      setClubActual(null);
    }
  };
  
  const fetchClubesAnteriores = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/presidente_club/clubesAnterioresDelegado/${id}`);
      setClubesAnteriores(res.data || []);
    } catch (error) {
      setClubesAnteriores([]);
    }
  };
  

  const getImagenPerfil = () => {
    if (delegado?.persona_imagen) return { uri: delegado.persona_imagen };
    return delegado?.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
  };

  const getImagenClub = (club) => {
    if (club?.club_imagen) return { uri: club.club_imagen };
    return Club_defecto;
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return `${edad} años`;
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3D8FA4" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>Perfil del Delegado</Text>

              {/* Datos Personales */}
              <View style={styles.header}>
                <Image source={getImagenPerfil()} style={styles.profileImage} />
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Nombre: </Text>
                    {delegado?.nombre} {delegado?.apellido}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Fecha de Nacimiento: </Text>
                    {delegado?.fecha_nacimiento}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Edad: </Text>
                    {calcularEdad(delegado?.fecha_nacimiento)}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Correo: </Text>
                    {delegado?.correo}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>C.I: </Text>
                    {delegado?.ci}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Dirección: </Text>
                    {delegado?.direccion}
                  </Text>
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

              {/* Cerrar */}
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

export default PerfilDelegadoModal;
