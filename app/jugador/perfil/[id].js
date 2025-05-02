import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useSession } from '../../../context/SessionProvider';
import rolMapping from '../../../constants/roles';
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';
import styles from '../../../styles/modal_perfil';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');

const PerfilJugadorModal = ({ isOpen, onClose, id }) => {
  const [jugador, setJugador] = useState(null);
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSession();

  const hasRole = (...roles) => {
    return user && user.rol && roles.includes(user.rol.nombre);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !id || isNaN(id)) return;

      setLoading(true);
      setError(null);

      try {
        const [jugadorResponse, clubesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/jugador/get_jugadorById/${id}`),
          axios.get(`${API_BASE_URL}/jugador/ObtenerJugadoresPreviousClubs/${id}`).catch(() => ({ data: [] }))
        ]);

        setJugador(jugadorResponse.data);
        setClubes(clubesResponse.data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar datos');
        setClubes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, id]);

  const getImagenPerfil = () => {
    if (!jugador) return defaultUserMenIcon;
    if (jugador.persona_imagen) return { uri: jugador.persona_imagen };
    return jugador.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
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

  const clubesActivos = clubes.filter(club => club.estadoclub === 1);
  const clubesInactivos = clubes.filter(club => club.estadoclub !== 1);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
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
              <Text style={styles.title}>Perfil del Jugador</Text>

              <View style={styles.header}>
                <Image source={getImagenPerfil()} style={styles.profileImage} />
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Nombre: </Text>{jugador?.nombre} {jugador?.apellido}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Fecha Nacimiento: </Text>{jugador?.fecha_nacimiento || 'N/A'}</Text>
                  <Text style={styles.infoText}><Text style={styles.infoLabel}>Edad: </Text>{calcularEdad(jugador?.fecha_nacimiento)}</Text>
                  {hasRole(rolMapping.PresidenteAsociacion) && (
                    <>
                      <Text style={styles.infoText}><Text style={styles.infoLabel}>Correo: </Text>{jugador?.correo || 'N/A'}</Text>
                      <Text style={styles.infoText}><Text style={styles.infoLabel}>CI: </Text>{jugador?.ci || 'N/A'}</Text>
                      <Text style={styles.infoText}><Text style={styles.infoLabel}>Dirección: </Text>{jugador?.direccion || 'N/A'}</Text>
                    </>
                  )}
                </View>
              </View>

              <Text style={styles.sectionTitle}>Clubes Actuales</Text>
              <View style={styles.clubBox}>
                {clubesActivos.length > 0 ? clubesActivos.map((club, index) => (
                  <View key={`active-${index}`} style={styles.clubItem}>
                    <Image source={club.club_imagen ? { uri: club.club_imagen } : defaultUserMenIcon} style={styles.clubIcon} />
                    <View style={styles.clubDetails}>
                      <Text style={styles.clubName}>{club.club_nombre || 'Club desconocido'}</Text>
                      <Text style={styles.clubTeam}>Equipo {club.equipos_jugador || 'N/A'}</Text>
                    </View>
                  </View>
                )) : <Text style={styles.emptyText}>No tiene clubes activos</Text>}
              </View>

              <Text style={styles.sectionTitle}>Clubes Previos</Text>
              <View style={styles.clubBox}>
                {clubesInactivos.length > 0 ? clubesInactivos.map((club, index) => (
                  <View key={`inactive-${index}`} style={styles.clubItem}>
                    <Image source={club.club_imagen ? { uri: club.club_imagen } : defaultUserMenIcon} style={styles.clubIcon} />
                    <View style={styles.clubDetails}>
                      <Text style={styles.clubName}>{club.club_nombre || 'Club desconocido'}</Text>
                      <Text style={styles.clubTeam}>{club.equipos_jugador || 'N/A'}</Text>
                    </View>
                  </View>
                )) : <Text style={styles.emptyText}>No tiene clubes previos registrados</Text>}
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

export default PerfilJugadorModal;