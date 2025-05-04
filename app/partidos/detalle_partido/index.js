import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  Button
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import estadosPartidoCampMapping from '../../../constants/estado_partido';
import rolMapping from '../../../constants/roles';
import { useSession } from '../../../context/SessionProvider';
import PerfilArbitroModal from '../../arbitro/perfil/[id]';
import styles from '../../../styles/partido_detalle';
import MapaDetalleModal from '../../../components/mapa_detalle';
import ConfirmModal from '../../../components/confirm_modal';
import ReprogramacionModal from '../../../components/reprogramacion_modal';
import PulseDot from '../../../components/PulseDot';
import Club_defecto from '../../../assets/img/Club_defecto.png';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const WEBSOCKET_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL;
const { width } = Dimensions.get('window');

const PartidoDetalle = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Extraer parámetros correctamente
  const partidoId = params.partidoId;
  const campeonatoId = params.campeonatoId;

  const [partido, setPartido] = useState(null);
  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);
  const [arbitros, setArbitros] = useState([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [simulacionReprogramacion, setSimulacionReprogramacion] = useState(null);
  const [isReprogramacionModalOpen, setIsReprogramacionModalOpen] = useState(false);
  const [resultadoPartido, setResultadoPartido] = useState(null);
  const [ganadorPartido, setGanadorPartido] = useState(null);
  const { user } = useSession();
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Función para obtener datos del partido
  const fetchPartido = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/partidos/get_partido_completo/${partidoId}`);
      setPartido(response.data);
    } catch (error) {
      Alert.alert("Error", "Error al obtener los detalles del partido");
      console.error("Error al obtener los detalles del partido:", error);
    }
  };

  // Función para obtener árbitros
  const fetchArbitros = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/partidos/get_arbitros/${partidoId}`);
      setArbitros(response.data);
    } catch (error) {
      Alert.alert("Error", "Error al obtener los árbitros del partido");
      console.error("Error al obtener los árbitros del partido:", error);
    }
  };

  // Función para obtener resultados
  const fetchResultados = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/partidos/resultados/${partidoId}`);
      setResultadoPartido(response.data);
    } catch (error) {
      Alert.alert("Error", "Error al obtener los resultados del partido");
      console.error("Error al obtener los resultados:", error);
    }
  };

  // Función para obtener ganador
  const fetchGanador = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/partidos/ganador/${partidoId}`);
      setGanadorPartido(response.data);
    } catch (error) {
      Alert.alert("Error", "Error al obtener el ganador del partido");
      console.error("Error al obtener el ganador:", error);
    }
  };

  // Efecto inicial para cargar datos
  useEffect(() => {
    if (!partidoId) {
      Alert.alert("Error", "No se ha proporcionado un ID de partido válido");
      return;
    }

    fetchPartido();
    fetchArbitros();
  }, [partidoId]);

  // Efecto para cargar jugadores cuando hay datos del partido
  useEffect(() => {
    if (partido) {
      const fetchJugadoresLocal = async (equipoId) => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/partidos/get_jugadores/${equipoId}/campeonato/${campeonatoId}`
          );
          setJugadoresLocal(response.data);
        } catch (error) {
          console.error("Error al obtener los jugadores del equipo local:", error);
        }
      };

      const fetchJugadoresVisitante = async (equipoId) => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/partidos/get_jugadores/${equipoId}/campeonato/${campeonatoId}`
          );
          setJugadoresVisitante(response.data);
        } catch (error) {
          console.error("Error al obtener los jugadores del equipo visitante:", error);
        }
      };

      fetchJugadoresLocal(partido.equipo_local_id);
      fetchJugadoresVisitante(partido.equipo_visitante_id);
    }
  }, [partido, campeonatoId]);

  // Efectos para cargar resultados y ganador cuando el partido está finalizado o en vivo
  useEffect(() => {
    if (partido && (partido.estado === estadosPartidoCampMapping.Finalizado || partido.estado === estadosPartidoCampMapping.Vivo)) {
      fetchResultados();
    }
  }, [partido]);

  useEffect(() => {
    if (partido && (partido.estado === estadosPartidoCampMapping.Finalizado || partido.estado === estadosPartidoCampMapping.Vivo)) {
      fetchGanador();
    }
  }, [partido]);

  useEffect(() => {
    if (!partidoId) return;
  
    const ws = new WebSocket(WEBSOCKET_URL);
  
    ws.onopen = () => {
      console.log('✅ WebSocket abierto para actualizaciones de partido');
    };
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'actualizacion_resultado') {
          console.log('📡 Actualización de partido recibida por WebSocket');
          fetchPartido();
          fetchResultados();
          fetchGanador();
        }
      } catch (error) {
        console.error('❌ Error procesando el mensaje WebSocket:', error);
      }
    };
  
    ws.onerror = (error) => {
      console.error('⚠️ Error en la conexión WebSocket:', error);
    };
  
    ws.onclose = () => {
      console.log('🔴 WebSocket cerrado para actualizaciones de partido');
    };
  
    // Cierra la conexión WebSocket cuando el componente se desmonta
    return () => {
      ws.close();
    };
  }, [partidoId]);
  

  // Validación de parámetros
  if (!partidoId || !campeonatoId ) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: Parámetros faltantes</Text>
        <Button 
          title="Volver" 
          onPress={() => router.back()} 
        />
      </View>
    );
  }

  // Funciones de formato
  const formatTime = (fecha) => {
    const partidoDate = new Date(fecha);
    return partidoDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (fecha) => {
    const partidoDate = new Date(fecha);
    return partidoDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Funciones para manejar acciones
  const handlePartidoClick = () => {
    router.navigate({
      pathname: '/partidos/registrar_resultado',
      params: { 
        partidoId,
        campeonatoId
      }
    });
  };

  const handleReprogramarClick = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/partidos/reprogramar-partido/${partidoId}`);
      setSimulacionReprogramacion(response.data);
      setIsReprogramacionModalOpen(true);
    } catch (error) {
      Alert.alert("Error", "Error al simular la reprogramación.");
      console.error("Error en la simulación de reprogramación:", error);
    }
  };
  const handleOpenConfirmModal = () => {
    setIsReprogramacionModalOpen(false);
    setIsConfirmModalOpen(true);
  };
  const handleFinalizarReprogramacion = async () => {
    try {
      await axios.post(`${API_BASE_URL}/partidos/confirmar-reprogramacion`, {
        partidoId,
        nuevaFechaHora: simulacionReprogramacion.nuevaFechaHora,
        nuevoLugar: simulacionReprogramacion.nuevoLugar,
        arbitrosAsignados: simulacionReprogramacion.arbitrosAsignados,
      });

      Alert.alert("Éxito", "Partido reprogramado exitosamente.");
      setIsConfirmModalOpen(false);
      setSimulacionReprogramacion(null);
      setPartido(prev => ({
        ...prev,
        fecha: simulacionReprogramacion.nuevaFechaHora,
        lugar_nombre: simulacionReprogramacion.nuevoLugar.nombre,
      }));
    } catch (error) {
      Alert.alert("Error", "Error al confirmar la reprogramación.");
      console.error("Error en la confirmación de reprogramación:", error);
    }
  };

  // Funciones de utilidad
  const getImagenPerfil = (arbitro) => {
    if (arbitro.persona_imagen) {
      return { uri: arbitro.persona_imagen };
    }
    return arbitro.arbitro_genero === "V" 
      ? require('../../../assets/img/Default_Imagen_Men.webp')
      : require('../../../assets/img/Default_Imagen_Women.webp');
  };

  const getTarjetasJugador = (jugadorId) => {
    if (!resultadoPartido || !resultadoPartido.tarjetas) return [];
    return resultadoPartido.tarjetas
      .filter(t => t.jugador_tarjeta_id === jugadorId)
      .map(t => t.tipo_tarjeta);
  };

  const hasRole = (...roles) => {
    return user && user.rol && roles.includes(user.rol.nombre);
  };

  const esArbitroAsignado = () => {
    if (!user || user.rol.nombre !== rolMapping.Arbitro) return false;
    return arbitros.some(arbitro => arbitro.arbitro_id === user.id);
  };
  const handleViewOnMap = () => {
   
    if (!partido?.lugar_latitud || !partido?.lugar_longitud) {
      console.log("Datos del partido:", partido);
      Alert.alert(
        "Ubicación no disponible",
        "Este partido no tiene coordenadas geográficas registradas"
      );
      return;
    }
    
    setSelectedLocation({
      latitude: parseFloat(partido.lugar_latitud),
      longitude: parseFloat(partido.lugar_longitud),
      title: partido.lugar_nombre,
      description: `Partido: ${partido.equipo_local_nombre} vs ${partido.equipo_visitante_nombre}`
    });
    setIsMapModalOpen(true);
  };
  // Renderizado condicional
  if (!partido) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando detalles del partido...</Text>
      </View>
    );
  }
 const getImagenClub = (imagen) => imagen ? { uri: imagen } : Club_defecto;
  return (
    <ScrollView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#143E42" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalles del Partido</Text>
      </View>

      {/* Información básica */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          <Text style={styles.boldText}>Fecha:</Text> {formatDate(partido.fecha)}, {formatTime(partido.fecha)}
        </Text>
        <View style={styles.locationContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Lugar del encuentro:</Text> {partido.lugar_nombre}
          </Text>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleViewOnMap}  // Eliminé el parámetro que no existía
          >
            <Icon name="location-on" size={20} color="#3D8FA4" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        {(hasRole(rolMapping.PresidenteAsociacion) ||
          (esArbitroAsignado() && partido.estado !== estadosPartidoCampMapping.Finalizado)) && (
          <TouchableOpacity
            style={styles.resultButton}
            onPress={handlePartidoClick}
          >
            <Text style={styles.buttonText}>
              {partido.estado === estadosPartidoCampMapping.Finalizado 
                ? "Actualizar Resultado" 
                : "Registrar Resultado"}
            </Text>
            <Icon name="assignment" size={20} color="white" />
          </TouchableOpacity>
        )}
        
        {hasRole(rolMapping.PresidenteAsociacion) &&
          partido.estado !== estadosPartidoCampMapping.Finalizado &&
          partido.estado !== estadosPartidoCampMapping.Vivo && (
            <>
              <TouchableOpacity
                style={styles.reprogramButton}
                onPress={handleReprogramarClick}
              >
                <Text style={styles.buttonText}>Reprogramar Partido</Text>
                <Icon name="calendar-month" size={20} color="white" />
              </TouchableOpacity>
            </>
        )}
      </View>

      {/* Estado del partido */}
      <View style={styles.matchContainer}>
        <Text style={[styles.statusText, 
          partido.estado === estadosPartidoCampMapping.Finalizado ? styles.finished : 
          partido.estado === estadosPartidoCampMapping.Vivo ? styles.live : styles.upcoming]}>
          {partido.estado === estadosPartidoCampMapping.Vivo ? (
            <>
              <PulseDot size={12} color="green" />
              <Text style={styles.liveTittle}>En curso</Text>
            </>
          ) : partido.estado === estadosPartidoCampMapping.Finalizado ? (
            "Finalizado"
          ) : (
            "Próximamente"
          )}
        </Text>

        {/* Equipos */}
        <View style={styles.teamsContainer}>
          <View style={styles.teamContainer}>
            <Image
              source={ getImagenClub(partido.equipo_local_imagen) }
              style={styles.teamLogo}
            />
            <Text style={styles.teamName}>{partido.equipo_local_nombre}</Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.teamContainer}>
            <Image
              source={getImagenClub(partido.equipo_visitante_imagen)}
              style={styles.teamLogo}
            />
            <Text style={styles.teamName}>{partido.equipo_visitante_nombre}</Text>
          </View>
        </View>

        {/* Resultados */}
        {(partido.estado === estadosPartidoCampMapping.Finalizado || partido.estado === estadosPartidoCampMapping.Vivo) &&
          ganadorPartido && (
            <View style={styles.resultContainer}>
              {ganadorPartido?.walkover ? (
                <Text style={styles.winnerText}>
                  {ganadorPartido.walkover === "both"
                    ? "Walkover de ambos equipos"
                    : `${ganadorPartido.walkover === "V" 
                        ? partido.equipo_local_nombre 
                        : partido.equipo_visitante_nombre} ganador por Walkover`}
                </Text>
              ) : resultadoPartido?.resultadoLocal &&
                resultadoPartido?.resultadoVisitante ? (
                <>
                  <Text style={styles.winnerText}>
                    {partido.estado === estadosPartidoCampMapping.Finalizado
                      ? `Ganador ${ganadorPartido?.ganador}`
                      : "Resultado actual"}
                  </Text>

                  <Text style={styles.scoreText}>{ganadorPartido?.marcador}</Text>
                  
                  <View style={styles.scoreTable}>
                    <View style={[styles.scoreColumn, { alignItems: 'flex-end', paddingRight: 20 }]}>
                      <Text style={[styles.teamTitle, { textAlign: 'right' }]}>{partido.equipo_local_nombre}</Text>
                      <Text style={{ textAlign: 'right' }}>Set 1: {resultadoPartido.resultadoLocal?.set1 ?? "-"}</Text>
                      <Text style={{ textAlign: 'right' }}>Set 2: {resultadoPartido.resultadoLocal?.set2 ?? "-"}</Text>
                      <Text style={{ textAlign: 'right' }}>Set 3: {resultadoPartido.resultadoLocal?.set3 ?? "-"}</Text>
                    </View>

                    <View style={[styles.scoreColumn, { alignItems: 'flex-start', paddingLeft: 20 }]}>
                      <Text style={[styles.teamTitle, { textAlign: 'left' }]}>{partido.equipo_visitante_nombre}</Text>
                      <Text style={{ textAlign: 'left' }}>Set 1: {resultadoPartido.resultadoVisitante?.set1 ?? "-"}</Text>
                      <Text style={{ textAlign: 'left' }}>Set 2: {resultadoPartido.resultadoVisitante?.set2 ?? "-"}</Text>
                      <Text style={{ textAlign: 'left' }}>Set 3: {resultadoPartido.resultadoVisitante?.set3 ?? "-"}</Text>
                    </View>
                  </View>


                </>
              ) : (
                <Text>No hay datos de resultados disponibles.</Text>
              )}
            </View>
          )}

        {/* Jugadores */}
        <Text style={styles.sectionTitle}>Jugadores</Text>
        <View style={[styles.playersContainer]}>
          <View style={styles.playersColumn}>
            {jugadoresLocal.length > 0 ? (
              jugadoresLocal.map(jugador => {
                const tarjetas = getTarjetasJugador(jugador.jugador_id);
                return (
                  <View key={jugador.jugador_id} style={styles.playerRow}>
                    <Text style={styles.playerName}>
                      {jugador.jugador_nombre} {jugador.jugador_apellido}
                    </Text>
                    {tarjetas.length > 0 && (
                      <View style={styles.cardsContainer}>
                        {tarjetas.includes("amarilla") && (
                          <View style={[styles.card, styles.yellowCard]} />
                        )}
                        {tarjetas.includes("roja") && (
                          <View style={[styles.card, styles.redCard]} />
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <Text>No hay jugadores registrados para este equipo.</Text>
            )}
          </View>

          <View style={[styles.playersColumn, { alignItems: 'flex-start', paddingLeft: 20 }]}>
            {jugadoresVisitante.length > 0 ? (
              jugadoresVisitante.map(jugador => {
                const tarjetas = getTarjetasJugador(jugador.jugador_id);
                return (
                  <View key={jugador.jugador_id} style={styles.playerRow}>
                    {tarjetas.length > 0 && (
                      <View style={styles.cardsContainer}>
                        {tarjetas.includes("amarilla") && (
                          <View style={[styles.card, styles.yellowCard]} />
                        )}
                        {tarjetas.includes("roja") && (
                          <View style={[styles.card, styles.redCard]} />
                        )}
                      </View>
                    )}
                    <Text style={styles.playerNameV}>
                      {jugador.jugador_nombre} {jugador.jugador_apellido}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text>No hay jugadores registrados para este equipo.</Text>
            )}
          </View>
        </View>
      </View>

      {/* Árbitros */}
      <Text style={styles.sectionTitle}>Árbitros</Text>
      <View style={styles.refereesContainer}>
        {arbitros.map(arbitro => (
          <TouchableOpacity
            key={arbitro.arbitro_id}
            style={styles.refereeItem}
            onPress={() => {
              setSelectedPersonaId(arbitro.arbitro_id);
              setShowPerfilModal(true);
            }}
          >
            <Image
              source={getImagenPerfil(arbitro)}
              style={styles.refereeImage}
            />
            <Text>
              {arbitro.arbitro_nombre} {arbitro.arbitro_apellido}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <MapaDetalleModal
        visible={isMapModalOpen}
        location={selectedLocation}
        onClose={() => setIsMapModalOpen(false)}
      />

     <ReprogramacionModal
        visible={isReprogramacionModalOpen}
        onClose={() => setIsReprogramacionModalOpen(false)}
        simulacion={simulacionReprogramacion}
        onConfirm={handleOpenConfirmModal}
        formatDate={formatDate}
        formatTime={formatTime}
      />
      

      <ConfirmModal
        visible={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalizarReprogramacion}
        message={`¿Estás seguro de reprogramar el partido para el ${formatDate(simulacionReprogramacion?.nuevaFechaHora)} a las ${formatTime(simulacionReprogramacion?.nuevaFechaHora)} en ${simulacionReprogramacion?.nuevoLugar?.nombre}?`}
      />

      <PerfilArbitroModal
        visible={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        arbitroId={selectedPersonaId}
      />
    </ScrollView>
  );
};

export default PartidoDetalle;