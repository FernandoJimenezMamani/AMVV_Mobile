import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

// Importa tus imágenes por defecto
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';

// Importa tus estilos
import styles from '../../../styles/index_tabla';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaJugadoresEquipo = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clubId, categoriaId, equipoId } = params;
  
  const [jugadores, setJugadores] = useState([]);
  const [filteredJugadores, setFilteredJugadores] = useState([]);
  const [showConfirmRegister, setShowConfirmRegister] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJugadores();
    if (equipoId) {
      fetchEquipoById();
    }
  }, [clubId, categoriaId, equipoId]);

  useEffect(() => {
    applyFilters();
  }, [searchName, jugadores]);

  const fetchJugadores = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/jugador/get_jugador_club_Category`, {
        club_id: clubId,
        categoria_id: categoriaId,
        id_equipo: equipoId
      });
      setJugadores(response.data);
      setFilteredJugadores(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los jugadores',
      });
      console.error('Error al obtener los jugadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipoById = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipo/get_equipo/${equipoId}`);
      setEquipo(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar la información del equipo',
      });
      console.error('Error al obtener el equipo:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...jugadores];

    // Filtrar por nombre
    if (searchName) {
      filtered = filtered.filter((jugador) =>
        `${jugador.nombre_persona} ${jugador.apellido_persona}`
          .toLowerCase()
          .includes(searchName.toLowerCase())
      );
    }

    setFilteredJugadores(filtered);
  };

  const handleProfileClick = (personaId) => {
    setShowPerfilModal(true);
    setJugadorSeleccionado(personaId);
  };

  const handleClosePerfilModal = () => {
    setShowPerfilModal(false);
    setJugadorSeleccionado(null);
  };

  const handleConfirmRegister = async () => {
    try {
      const data = {
        equipo_id: equipoId, 
        jugador_id: jugadorSeleccionado.jugador_id, 
      };
      
      await axios.post(`${API_BASE_URL}/jugador/post_jugadorEquipo`, data);
      
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: 'Jugador añadido al equipo correctamente',
      });
      
      setShowConfirmRegister(false);
      fetchJugadores();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo añadir el jugador al equipo',
      });
      console.error('Error al registrar el jugador:', error);
    }
  };

  const getImagenPerfil = (jugador) => {
    if (jugador.imagen_persona) {
      return { uri: jugador.imagen_persona };
    }
    return jugador.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const renderJugador = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.playerInfoContainer}>
        <Image
          source={getImagenPerfil(item)}
          style={styles.smallImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.playerName}>
            {item.nombre_persona} {item.apellido_persona}
          </Text>
          <Text style={styles.clubName}>
            {item.nombre_club || 'Sin Club'}
          </Text>
          <Text style={styles.playerRole}>
            Edad: {item.edad_jugador} - CI: {item.ci_persona}
          </Text>
          <Text style={styles.playerRole}>
            Nacimiento: {formatDate(item.fecha_nacimiento_persona)}
          </Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, item.eliminado === 'S' && { opacity: 0.5 }]}
          onPress={() => {
            setJugadorSeleccionado(item);
            setShowConfirmRegister(true);
          }}
          disabled={item.eliminado === 'S'}
        >
          <Icon name="person-add" size={24} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, item.eliminado === 'S' && { opacity: 0.5 }]}
          onPress={() => handleProfileClick(item.persona_id)}
          disabled={item.eliminado === 'S'}
        >
          <Icon name="remove-red-eye" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D8FA4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {equipo ? `Añadir jugadores a ${equipo.equipo_nombre}` : "Añadir jugadores"}
        </Text>
      </View>

      {/* Filtro de búsqueda */}
      <View style={styles.filterContainer}>
        <TextInput
          style={{
            height: 40,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 10,
            backgroundColor: 'white',
          }}
          placeholder="Buscar por nombre"
          value={searchName}
          onChangeText={setSearchName}
        />
      </View>

      {/* Lista de jugadores */}
      {filteredJugadores.length > 0 ? (
        <FlatList
          data={filteredJugadores}
          renderItem={renderJugador}
          keyExtractor={(item) => item.jugador_id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noResultsText}>No se encontraron jugadores</Text>
      )}

      {/* Modal de confirmación */}
      <Modal
        visible={showConfirmRegister}
        transparent={true}
        onRequestClose={() => setShowConfirmRegister(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
          }}>
            <Text style={{ marginBottom: 15, fontSize: 16 }}>
              ¿Seguro que quieres añadir a {jugadorSeleccionado?.nombre_persona} {jugadorSeleccionado?.apellido_persona} al equipo {equipo?.equipo_nombre}?
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  padding: 10,
                  backgroundColor: '#ccc',
                  borderRadius: 5,
                  flex: 1,
                  marginRight: 10,
                  alignItems: 'center',
                }}
                onPress={() => setShowConfirmRegister(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  padding: 10,
                  backgroundColor: '#2196F3',
                  borderRadius: 5,
                  flex: 1,
                  alignItems: 'center',
                }}
                onPress={handleConfirmRegister}
              >
                <Text style={{ color: 'white' }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de perfil (simplificado) */}
      <Modal
        visible={showPerfilModal}
        animationType="slide"
        onRequestClose={handleClosePerfilModal}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <TouchableOpacity 
            style={{ alignSelf: 'flex-end', marginBottom: 20 }}
            onPress={handleClosePerfilModal}
          >
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
            Perfil del Jugador
          </Text>
          
          {jugadorSeleccionado && (
            <View>
              <Image
                source={getImagenPerfil(jugadorSeleccionado)}
                style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center' }}
              />
              
              <Text style={{ fontSize: 18, marginTop: 10 }}>
                {jugadorSeleccionado.nombre_persona} {jugadorSeleccionado.apellido_persona}
              </Text>
              
              <Text style={{ marginTop: 5 }}>
                CI: {jugadorSeleccionado.ci_persona}
              </Text>
              
              <Text style={{ marginTop: 5 }}>
                Fecha de Nacimiento: {formatDate(jugadorSeleccionado.fecha_nacimiento_persona)}
              </Text>
              
              <Text style={{ marginTop: 5 }}>
                Edad: {jugadorSeleccionado.edad_jugador} años
              </Text>
              
              <Text style={{ marginTop: 5 }}>
                Club: {jugadorSeleccionado.nombre_club || 'Sin Club'}
              </Text>
            </View>
          )}
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

export default ListaJugadoresEquipo;