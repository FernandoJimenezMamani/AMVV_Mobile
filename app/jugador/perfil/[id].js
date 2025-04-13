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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');

const PerfilJugadorModal = ({ isOpen, onClose, id }) => {
    const [jugador, setJugador] = useState(null);
    const [clubes, setClubes] = useState([]); // Asegúrate de inicializar como array vacío
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        if (!isOpen || !id || isNaN(id)) return;
  
        setLoading(true);
        setError(null);
        
        try {
          const [jugadorResponse, clubesResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/persona/get_personaById/${id}`),
            axios.get(`${API_BASE_URL}/jugador/ObtenerJugadoresPreviousClubs/${id}`)
              .catch(() => ({ data: [] })) // Si falla, devuelve array vacío
          ]);
          
          setJugador(jugadorResponse.data);
          setClubes(clubesResponse.data || []); // Asegura que siempre sea array
        } catch (err) {
          console.error('Error:', err);
          setError('Error al cargar datos');
          setClubes([]); // Reinicia a array vacío
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [isOpen, id]);

  const getImagenPerfil = () => {
    if (!jugador) return defaultUserMenIcon;
    if (jugador.persona_imagen) {
      return { uri: jugador.persona_imagen };
    }
    return jugador.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
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

  const clubesActivos = clubes.filter(club => club.estadoclub === 1);
  const clubesInactivos = clubes.filter(club => club.estadoclub !== 1);

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
              <Text style={styles.title}>Perfil del Jugador</Text>
              
              <View style={styles.header}>
                <Image 
                  source={getImagenPerfil()} 
                  style={styles.profileImage} 
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Nombre: </Text>
                    {jugador?.nombre || 'N/A'} {jugador?.apellido || ''}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Fecha Nacimiento: </Text>
                    {jugador?.fecha_nacimiento || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Edad: </Text>
                    {calcularEdad(jugador?.fecha_nacimiento)}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Correo: </Text>
                    {jugador?.correo || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>CI: </Text>
                    {jugador?.ci || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Dirección: </Text>
                    {jugador?.direccion || 'N/A'}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Clubes Actuales</Text>
              <View style={styles.clubBox}>
                {clubesActivos.length > 0 ? (
                  clubesActivos.map((club, index) => (
                    <View key={`active-${index}`} style={styles.clubItem}>
                      <Image 
                        source={club.club_imagen ? { uri: club.club_imagen } : defaultUserMenIcon} 
                        style={styles.clubIcon} 
                      />
                      <View style={styles.clubDetails}>
                        <Text style={styles.clubName}>{club.club_nombre || 'Club desconocido'}</Text>
                        <Text style={styles.clubTeam}>Equipo {club.equipos_jugador || 'N/A'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No tiene clubes activos</Text>
                )}
              </View>

              <Text style={styles.sectionTitle}>Clubes Previos</Text>
              <View style={styles.clubBox}>
                {clubesInactivos.length > 0 ? (
                  clubesInactivos.map((club, index) => (
                    <View key={`inactive-${index}`} style={styles.clubItem}>
                      <Image 
                        source={club.club_imagen ? { uri: club.club_imagen } : defaultUserMenIcon} 
                        style={styles.clubIcon} 
                      />
                      <View style={styles.clubDetails}>
                        <Text style={styles.clubName}>{club.club_nombre || 'Club desconocido'}</Text>
                        <Text style={styles.clubTeam}>{club.equipos_jugador || 'N/A'}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No tiene clubes previos registrados</Text>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D8FA4',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#3D8FA4',
  },
  infoContainer: {
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e5c68',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  clubBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  clubIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#3D8FA4',
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D8FA4',
  },
  clubTeam: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 10,
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PerfilJugadorModal;