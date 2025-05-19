import React, { useEffect, useState,useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity,TextInput, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import CrearJugadorModal from './crear';
import styles from '../../styles/index_tabla';
import defaultUserMenIcon from '../../assets/img/Default_Imagen_Men.webp'
import defaultUserWomenIcon from '../../assets/img/Default_Imagen_Women.webp'
import Icon from 'react-native-vector-icons/MaterialIcons';
import PerfilJugadorModal from './perfil/[id]'; // ajustá la ruta si es diferente
import EditarJugadorModal from './editar';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaJugadores = () => {
  const [jugadores, setJugadores] = useState([]);
  const [filteredJugadores, setFilteredJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [selectedJugadorId, setSelectedJugadorId] = useState(null);
  const [filterState, setFilterState] = useState('No filtrar');
  const [searchName, setSearchName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [jugadorToDelete, setJugadorToDelete] = useState(null);
  const [visibleJugadores, setVisibleJugadores] = useState(5);
  const flatListRef = useRef(null);
  const router = useRouter();
  const [perfilJugadorVisible, setPerfilJugadorVisible] = useState(false);
  const [jugadorIdPerfil, setJugadorIdPerfil] = useState(null);

  // Función para obtener la lista de jugadores
  const fetchJugadores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jugador/jugadores`);
      if (response.data && Array.isArray(response.data)) {
        setJugadores(response.data);
        setFilteredJugadores(response.data); // Inicialmente, mostrar todos los jugadores
      } else {
        setError('No se encontraron datos de jugadores.');
      }
    } catch (error) {
      setError('No se pudo obtener la lista de jugadores. Verifica la conexión o el endpoint.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los jugadores al montar el componente
  useEffect(() => {
    fetchJugadores();
  }, []);

  // Aplicar filtros cuando cambien los estados de filtro o búsqueda
  useEffect(() => {
    applyFilters();
  }, [filterState, searchName, jugadores]);

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = [...jugadores];

    // Filtrar por estado
    if (filterState !== 'No filtrar') {
      filtered = filtered.filter((jugador) =>
        filterState === 'Activo' ? jugador.eliminado === 'N' : jugador.eliminado === 'S'
      );
    }

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

  // Manejar la apertura del modal de edición
  const handleEditClick = (jugadorId) => {
    setSelectedJugadorId(jugadorId);
    setShowEditarModal(true);
  };

  // Manejar la apertura del modal de registro
  const handleRegistrarClick = () => {
    setSelectedJugadorId(null);
    setShowCrearModal(true);
  };

  // Manejar el cierre del modal
  const handleCloseCrearModal = () => {
    setShowCrearModal(false);
    setSelectedJugadorId(null);
    fetchJugadores(); // Actualizar la lista después de cerrar el modal
  };

  // Manejar la eliminación de un jugador
  const handleDeleteClick = (id) => {
    setJugadorToDelete(id);
    setShowConfirm(true);
  };

  const handleProfileClick = (jugadorId) => {
    setJugadorIdPerfil(jugadorId);
    setPerfilJugadorVisible(true);
  };
  
  const handleCloseEditarModal = () => {
    setShowEditarModal(false); // Cierra el modal de edición
    setSelectedJugadorId(null); // Limpia el ID del delegado seleccionado
  };
  
  // Manejar la confirmación de eliminación
  const handleConfirmDelete = async () => {
    try {
      const user_id = 1; // Cambiar esto si necesitas un valor dinámico
      await axios.put(`${API_BASE_URL}/persona/delete_persona/${jugadorToDelete}`, { user_id });
      Alert.alert('Éxito', 'Jugador desactivado exitosamente');
      fetchJugadores();
    } catch (error) {
      Alert.alert('Error', 'No se pudo desactivar el jugador');
    } finally {
      setShowConfirm(false);
      setJugadorToDelete(null);
    }
  };

  // Manejar la activación de un jugador
  const handleActivateUser = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/persona/activatePersona/${id}`);
      Alert.alert('Éxito', 'Jugador activado exitosamente');
      fetchJugadores();
    } catch (error) {
      Alert.alert('Error', 'No se pudo activar el jugador');
    }
  };

  const getImagenPerfil = (arbitro) => {
      if (arbitro.imagen_persona) {
        return { uri: arbitro.imagen_persona }; 
      }
      return arbitro.genero_persona === 'V'
        ? defaultUserMenIcon
        : defaultUserWomenIcon;
    };

    const handleLoadMore = () => {
      setVisibleJugadores((prev) => prev + 5);
    };
    
    const scrollToTop = () => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    };

  // Mostrar un indicador de carga si los datos están cargando
  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
  }

  // Mostrar un mensaje de error si hay un problema
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchJugadores}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mostrar un mensaje si no hay jugadores
  if (jugadores.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No hay jugadores registrados.</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleRegistrarClick}>
          <Text style={styles.addButtonText}>+1 jugador</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Jugadores</Text>
      
      {/* Botón para registrar jugador */}
      <TouchableOpacity style={styles.addButton} onPress={handleRegistrarClick}>
        <Text style={styles.addButtonText}>+1 jugador</Text>
      </TouchableOpacity>
      <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre"
          value={searchName}
          onChangeText={setSearchName}
        />
      {/* Lista de jugadores */}
      <FlatList
        ref={flatListRef}
        data={filteredJugadores.slice(0, visibleJugadores)}
        keyExtractor={(item) => item.jugador_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.clubContainer}>
            <Image
              source={getImagenPerfil(item)}
              style={styles.clubImage}
            />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>
                {item.nombre_persona} {item.apellido_persona}
              </Text>
              <Text style={styles.clubDescription}>C.I: {item.ci_persona}</Text>

            </View>
            <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleProfileClick(item.persona_id)}>
              <MaterialIcons name="remove-red-eye" size={24} color="#579FA6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditClick(item.persona_id)}>
              <MaterialIcons name="edit" size={24} color="#9DAC42" />
            </TouchableOpacity>
            </View>
            
          </View>
        )}
        ListFooterComponent={
          <>
            {visibleJugadores < filteredJugadores.length && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>Cargar más</Text>
              </TouchableOpacity>
            )}
            {visibleJugadores > 5 && (
              <TouchableOpacity style={styles.goToTopButton} onPress={scrollToTop}>
                <Icon style={styles.goToTopText} name={'keyboard-arrow-up'}/>
              </TouchableOpacity>
            )}
          </>
        }
      />

      {/* Modal para crear/editar jugadores */}
      <CrearJugadorModal
        isOpen={showCrearModal}
        onClose={handleCloseCrearModal}
        jugadorId={selectedJugadorId}
        onJugadorCreated={fetchJugadores}
        onJugadorUpdated={fetchJugadores}
      />
      <EditarJugadorModal
        isOpen={showEditarModal}
        onClose={handleCloseEditarModal}
        jugadorId={selectedJugadorId} // Pasar el ID del delegado a editar
        onJugadorUpdated={fetchJugadores} // Recargar la lista después de editar
      />
      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
        message="¿Seguro que quieres eliminar este jugador?"
      />

      <PerfilJugadorModal
        isOpen={perfilJugadorVisible}
        onClose={() => setPerfilJugadorVisible(false)}
        id={jugadorIdPerfil}
      />

    </View>
  );
};

export default ListaJugadores;