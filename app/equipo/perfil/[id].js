import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Modal,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

// Importa tus imágenes por defecto
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';
import Club_defecto from '../../../assets/img/Default_Imagen_Club.webp';

// Importa tus constantes
import estadosPartidoCampMapping from '../../../constants/estado_partido';
import estadosMapping from '../../../constants/campeonato_estados';
import rolMapping from '../../../constants/roles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PerfilEquipo = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [equipo, setEquipo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [activeTab, setActiveTab] = useState("informacion");
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJugadorId, setSelectedJugadorId] = useState(null);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [loading, setLoading] = useState(true);

  // Funciones de navegación
  const handleVolver = () => {
    router.back();
  };

  const navigateToJugadorRegistro = () => {
    router.push({
      pathname: "/jugador/indice_jugador_equipo",
      params: {
        clubId: equipo.club_id,
        categoriaId: equipo.categoria_id,
        equipoId: id
      }
    });
  };

  const navigateToPartidoDetalle = (partido) => {
    router.navigate({
      pathname: `/partidos/detalle_partido`,
      params: {
        partidoId: partido.partido_id,
        campeonatoId: partido.campeonato_id,
        categoriaId: partido.categoria_id
      }
    });
  };

  const navigateToTablaPosiciones = () => {
    router.push({
      pathname: "/tabla_posiciones",
      params: {
        campeonatoId: selectedCampeonato,
        categoriaId: equipo.categoria_id
      }
    });
  };
  // Obtener datos del equipo y jugadores
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener campeonatos primero
        const campeonatosRes = await axios.get(`${API_BASE_URL}/campeonatos/select`);
        setCampeonatos(campeonatosRes.data);
        
        // Seleccionar campeonato activo o el primero
        const activo = campeonatosRes.data.find(c => c.estado !== 3);
        const campeonatoId = activo ? activo.id : campeonatosRes.data[0]?.id;
        setSelectedCampeonato(campeonatoId);
        
        // Obtener equipo
        const equipoRes = await axios.get(`${API_BASE_URL}/equipo/get_equipo/${id}`);
        setEquipo(equipoRes.data);
        
        
        // Obtener categoría del equipo
        if (equipoRes.data?.equipo_id && campeonatoId) {
          const categoriaRes = await axios.get(`${API_BASE_URL}/equipo/categoria/${equipoRes.data.equipo_id}/${campeonatoId}`);
          setEquipo(prev => ({
            ...prev,
            categoria_id: categoriaRes.data.categoria_id,
            categoria_nombre: categoriaRes.data.categoria_nombre,
            genero: categoriaRes.data.genero,
            division: categoriaRes.data.division,
          }));
        }
        
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudieron cargar los datos del equipo',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchJugadores = async () => {
      if (!selectedCampeonato || !id) return;
      try {
        const jugadoresRes = await axios.get(`${API_BASE_URL}/jugador/get_jugadores_equipo/${id}/${selectedCampeonato}`);
        setJugadores(jugadoresRes.data);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudieron cargar los jugadores',
        });
      }
    };
  
    fetchJugadores();
  }, [selectedCampeonato, id]);
  

  // Obtener partidos cuando cambia la pestaña o el campeonato
  useEffect(() => {
    const fetchPartidos = async () => {
      if (!selectedCampeonato || activeTab !== "partidos") return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/partidos/selectPartidosById/${id}/${selectedCampeonato}`);
        setPartidos(response.data);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudieron cargar los partidos',
        });
      }
    };
    
    fetchPartidos();
  }, [id, activeTab, selectedCampeonato]);

  // Obtener participación en campeonato
  useEffect(() => {
    const fetchParticipacion = async () => {
      if (!selectedCampeonato || !equipo?.equipo_id) return;
      
      try {
        const posicionResponse = await axios.post(`${API_BASE_URL}/campeonatos/obtenerEquipoPosicion`, {
          campeonatoId: selectedCampeonato,
          equipoId: equipo.equipo_id,
        });
        
        if (posicionResponse.data) {
          setParticipaciones([{
            nombre: campeonatos.find(c => c.id === selectedCampeonato)?.nombre || "Campeonato",
            estado_campeonato: campeonatos.find(c => c.id === selectedCampeonato)?.estado || "",
            posicion: posicionResponse.data.posicion,
            estado_equipo_campeonato: posicionResponse.data.estado_equipo_campeonato
          }]);
        }
      } catch (error) {
        console.warn("Este equipo no participó en el campeonato seleccionado.");
      }
    };
    
    fetchParticipacion();
  }, [selectedCampeonato, equipo?.equipo_id]);

  // Funciones auxiliares
  const obtenerGeneroTexto = (genero) => {
    if (genero === 'V') return 'Varones';
    if (genero === 'D') return 'Damas';
    if (genero === 'M') return 'Mixto';
    return 'Desconocido';
  };

  const obtenerDivisionTexto = (division) => {
    if (division === 'MY') return 'Mayores';
    if (division === 'MN') return 'Menores';
    return 'Desconocido';
  };

  const getImagenPerfil = (jugador) => {
    if (jugador.imagen_persona) {
      return { uri: jugador.imagen_persona };
    }
    return jugador.genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
  };

  const getImagenClubLocal = (partido) => {
    if (partido.equipo_local_imagen) {
      return { uri: partido.equipo_local_imagen };
    }
    return Club_defecto;
  };

  const getImagenClubVisitante = (partido) => {
    if (partido.equipo_visitante_imagen) {
      return { uri: partido.equipo_visitante_imagen };
    }
    return Club_defecto;
  };

  const formatDate = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getEstadoPartidoIcono = (fecha, estado) => {
    const ahora = new Date();
    const fechaPartido = new Date(fecha);
  
    if (fechaPartido < ahora && estado === estadosPartidoCampMapping.Confirmado) {
      return { icono: <Icon name="error" size={20} color="#ff5252" />, clase: 'alerta', tooltip: 'Partido vencido, resultados no registrados' };
    }
    if (fechaPartido >= ahora && estado === estadosPartidoCampMapping.Confirmado) {
      return { icono: <Icon name="pending" size={20} color="#ffc107" />, clase: 'pendiente', tooltip: 'Partido confirmado, en espera' };
    }
    if (estado === estadosPartidoCampMapping.Finalizado) {
      return { icono: <Icon name="check-circle" size={20} color="#4caf50" />, clase: 'finalizado', tooltip: 'Partido finalizado' };
    }
    if (estado === estadosPartidoCampMapping.Vivo) {
      return { icono: null, clase: 'vivo', tooltip: 'Partido en vivo' };
    }
    return null;
  };

  const getMedalIcon = (posicion) => {
    if (posicion === 1) return "🏆";
    if (posicion === 2) return "🥈";
    if (posicion === 3) return "🥉";
    return null;
  };

  const formatPosition = (posicion) => {
    if (posicion === 1) return "1er lugar";
    if (posicion === 2) return "2do lugar";
    if (posicion === 3) return "3er lugar";
    return `${posicion}° lugar`;
  };

  const hasRole = (...roles) => {
    // Implementa tu lógica de roles aquí
    return true; // Cambia esto según tu sistema de autenticación
  };

  const toggleEliminar = () => {
    setMostrarEliminar(!mostrarEliminar);
  };

  const confirmDeleteJugador = (jugadorId) => {
    setSelectedJugadorId(jugadorId);
    setShowConfirmModal(true);
  };

  const handleDeleteJugador = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/jugador/delete_jugador_equipo/${selectedJugadorId}/${id}`);
      Toast.show({
        type: 'success',
        text1: 'Éxito',
        text2: 'Jugador eliminado correctamente',
      });
      setJugadores(jugadores.filter(j => j.jugador_id !== selectedJugadorId));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo eliminar el jugador',
      });
    } finally {
      setShowConfirmModal(false);
      setSelectedJugadorId(null);
    }
  };

  const handleProfileClick = (personaId) => {
    setSelectedPersonaId(personaId);
    setShowPerfilModal(true);
  };

  const handleClosePerfilModal = () => {
    setShowPerfilModal(false);
    setSelectedPersonaId(null);
  };

  // Renderizado de jugadores
  const renderJugador = ({ item }) => (
    <TouchableOpacity 
      style={styles.jugadorCard}
      onPress={() => handleProfileClick(item.persona_id)}
    >
      <Image
        source={getImagenPerfil(item)}
        style={styles.jugadorImagen}
      />
      <View style={styles.jugadorInfo}>
        <Text style={styles.jugadorNombre}>
          {item.nombre_persona} {item.apellido_persona}
        </Text>
        <Text style={styles.jugadorEdad}>Edad: {item.edad_jugador} años</Text>
      </View>
      
      {mostrarEliminar && (
        <TouchableOpacity 
          style={styles.jugadorEliminar}
          onPress={(e) => {
            e.stopPropagation();
            confirmDeleteJugador(item.jugador_id);
          }}
        >
          <Icon name="remove-circle-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // Renderizado de partidos
  const renderPartido = ({ item }) => {
    const estadoPartido = getEstadoPartidoIcono(item.fecha, item.estado);
    
    return (
      <TouchableOpacity 
        style={styles.partidoCard}
        onPress={() => navigateToPartidoDetalle(item)}
      >
        {item.estado === estadosPartidoCampMapping.Vivo && (
          <View style={styles.estadoVivoAnimado} />
        )}
        
        {estadoPartido && (
          <View style={[styles.estadoIcon, styles[estadoPartido.clase]]}>
            {estadoPartido.icono}
          </View>
        )}

        <View style={styles.partidoEquipos}>
          <View style={styles.partidoEquipo}>
            <Image 
              source={getImagenClubLocal(item)} 
              style={styles.partidoLogo} 
            />
            <Text style={styles.partidoNombre}>{item.equipo_local_nombre}</Text>
          </View>
          
          <Text style={styles.partidoVS}>VS</Text>
          
          <View style={styles.partidoEquipo}>
            <Image 
              source={getImagenClubVisitante(item)} 
              style={styles.partidoLogo} 
            />
            <Text style={styles.partidoNombre}>{item.equipo_visitante_nombre}</Text>
          </View>
        </View>

        <View style={styles.partidoInfo}>
          <Text style={styles.partidoFecha}>{formatDate(item.fecha)}</Text>
          <Text style={styles.partidoHora}>Hora: {formatTime(item.fecha)}</Text>
          <Text style={styles.partidoLugar}>Lugar: {item.lugar_nombre}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D8FA4" />
      </View>
    );
  }

  if (!equipo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información del equipo</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#143E42" />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil de Equipo</Text>
      </View>

      {/* Logo y nombre del equipo */}
      <View style={styles.equipoHeader}>
        <Image
          source={equipo.club_imagen ? { uri: equipo.club_imagen } : Club_defecto}
          style={styles.equipoLogo}
        />
        <Text style={styles.equipoNombre}>{equipo.equipo_nombre}</Text>
        
        {/* Selector de campeonato */}
        <View style={styles.campeonatoSelector}>
          <Picker
            selectedValue={selectedCampeonato}
            onValueChange={(value) => setSelectedCampeonato(value)}
            style={styles.picker}
          >
            {campeonatos.map((campeonato) => (
              <Picker.Item 
                key={campeonato.id} 
                label={campeonato.nombre} 
                value={campeonato.id} 
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "informacion" && styles.activeTab]}
          onPress={() => setActiveTab("informacion")}
        >
          <Text style={[styles.tabText, activeTab === "informacion" && styles.activeTabText]}>
            Información
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === "jugadores" && styles.activeTab]}
          onPress={() => setActiveTab("jugadores")}
        >
          <Text style={[styles.tabText, activeTab === "jugadores" && styles.activeTabText]}>
            Jugadores
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === "partidos" && styles.activeTab]}
          onPress={() => setActiveTab("partidos")}
        >
          <Text style={[styles.tabText, activeTab === "partidos" && styles.activeTabText]}>
            Partidos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de las tabs */}
      <ScrollView style={styles.content}>
        {/* Información del equipo */}
        {activeTab === "informacion" && (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Club:</Text>
              <Text style={styles.infoValue}>{equipo.club_nombre}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Categoría:</Text>
              <Text style={styles.infoValue}>{equipo.categoria_nombre}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Género:</Text>
              <Text style={styles.infoValue}>{obtenerGeneroTexto(equipo.genero)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>División:</Text>
              <Text style={styles.infoValue}>{obtenerDivisionTexto(equipo.division)}</Text>
            </View>

            {/* Participaciones en campeonatos */}
            <Text style={styles.sectionTitle}>Posición</Text>
            
            {participaciones.length > 0 ? (
              <TouchableOpacity 
                style={styles.participacionCard}
                onPress={navigateToTablaPosiciones}
              >
                <Text style={styles.participacionNombre}>
                  {participaciones[0].nombre}
                  {participaciones[0].estado_campeonato !== estadosMapping.campeonatoFinalizado && (
                    <View style={styles.campeonatoEnCurso} />
                  )}
                </Text>
                
                {participaciones[0].estado_equipo_campeonato === "Inscrito" ? (
                  <>
                    {getMedalIcon(participaciones[0].posicion) && (
                      <Text style={styles.medalla}>
                        {getMedalIcon(participaciones[0].posicion)}
                      </Text>
                    )}
                    <Text style={styles.participacionPosicion}>
                      {participaciones[0].estado_campeonato !== estadosMapping.campeonatoFinalizado
                        ? "Posición actual"
                        : "Posición"}
                      : <Text style={styles.posicionDestacada}>{formatPosition(participaciones[0].posicion)}</Text>
                    </Text>
                  </>
                ) : (
                  <Text style={styles.noParticipa}>No participó</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={styles.noParticipacion}>Este equipo no ha participado en este campeonato.</Text>
            )}
          </View>
        )}

        {/* Jugadores del equipo */}
        {activeTab === "jugadores" && (
          <View style={styles.jugadoresContainer}>
            {/* Botones de acción */}
            {hasRole(rolMapping.PresidenteAsociacion, rolMapping.PresidenteClub, rolMapping.DelegadoClub) && 
              campeonatos.find(c => c.id === selectedCampeonato)?.estado === estadosMapping.transaccionProceso && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.registrarButton}
                    onPress={navigateToJugadorRegistro}
                  >
                    <Text style={styles.buttonText}>+1 Jugador</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.eliminarButton}
                    onPress={toggleEliminar}
                  >
                    <Text style={styles.buttonText}>
                      {mostrarEliminar ? "Cancelar" : "Eliminar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {/* Lista de jugadores */}
            {jugadores.length > 0 ? (
              <FlatList
                data={jugadores}
                renderItem={renderJugador}
                keyExtractor={(item) => item.jugador_id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.jugadoresGrid}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noJugadores}>No hay jugadores registrados en este equipo.</Text>
            )}
          </View>
        )}

        {/* Partidos del equipo */}
        {activeTab === "partidos" && (
          <View style={styles.partidosContainer}>
            {partidos.length > 0 ? (
              <FlatList
                data={partidos}
                renderItem={renderPartido}
                keyExtractor={(item) => item.partido_id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noPartidos}>No hay partidos registrados para este equipo.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmación para eliminar jugador */}
      <Modal
        visible={showConfirmModal}
        transparent={true}

      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¿Estás seguro de que deseas eliminar a este jugador del equipo?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteJugador}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de perfil de jugador (simplificado) */}
      <Modal
        visible={showPerfilModal}
        animationType="slide"
        onRequestClose={handleClosePerfilModal}
      >
        <View style={styles.modalProfileContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClosePerfilModal}
          >
            <Icon name="close" size={24} color="#143E42" />
          </TouchableOpacity>
          <Text style={styles.modalProfileTitle}>Perfil del Jugador</Text>
          <Text style={styles.modalProfileText}>ID: {selectedPersonaId}</Text>
          {/* Aquí deberías cargar y mostrar más detalles del jugador */}
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#143E42',
  },
  equipoHeader: {
    alignItems: 'center',
    padding: 20,
  },
  equipoLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#143E42',
  },
  equipoNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#143E42',
    marginTop: 10,
    textAlign: 'center',
  },
  campeonatoSelector: {
    width: '90%',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3D8FA4',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3D8FA4',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#143E42',
    width: 100,
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143E42',
    marginTop: 15,
    marginBottom: 10,
  },
  participacionCard: {
    backgroundColor: '#e8f6f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  participacionNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participacionPosicion: {
    fontSize: 16,
    color: '#666',
  },
  posicionDestacada: {
    fontWeight: 'bold',
    color: '#143E42',
  },
  noParticipa: {
    fontWeight: 'bold',
    color: '#666',
  },
  noParticipacion: {
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  campeonatoEnCurso: {
    width: 10,
    height: 10,
    backgroundColor: '#0f960f',
    borderRadius: 5,
    marginLeft: 8,
  },
  medalla: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 5,
  },
  jugadoresContainer: {
    marginVertical: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  registrarButton: {
    backgroundColor: '#3D8FA4',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  eliminarButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  jugadoresGrid: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  jugadorCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  jugadorImagen: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#143E42',
    marginBottom: 10,
  },
  jugadorInfo: {
    alignItems: 'center',
  },
  jugadorNombre: {
    fontWeight: 'bold',
    color: '#143E42',
    textAlign: 'center',
  },
  jugadorEdad: {
    color: '#666',
    fontSize: 12,
  },
  jugadorEliminar: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noJugadores: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  partidosContainer: {
    marginVertical: 10,
  },
  partidoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  estadoVivoAnimado: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff0000',
  },
  estadoIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  alerta: {
    color: '#ff5252',
  },
  pendiente: {
    color: '#ffc107',
  },
  finalizado: {
    color: '#4caf50',
  },
  partidoEquipos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  partidoEquipo: {
    alignItems: 'center',
    flex: 1,
  },
  partidoLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  partidoNombre: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  partidoVS: {
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 10,
  },
  partidoInfo: {
    marginTop: 10,
  },
  partidoFecha: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  partidoHora: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  partidoLugar: {
    fontSize: 14,
    color: '#666',
  },
  noPartidos: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#dc3545',
  },
  modalProfileContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  modalProfileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalProfileText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});

export default PerfilEquipo;