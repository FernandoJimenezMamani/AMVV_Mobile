import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import estadosPartidoCampMapping from '../../../constants/estado_partido';
import Club_defecto from '../../../assets/img/Club_defecto.png';
import ErrorIcon from 'react-native-vector-icons/MaterialIcons';
import PendingIcon from 'react-native-vector-icons/MaterialIcons';
import CheckCircleIcon from 'react-native-vector-icons/MaterialIcons';
import { useSession } from '../../../context/SessionProvider';
import { Picker } from '@react-native-picker/picker';
import styles from '../../../styles/partidos/index_partido';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PartidosJugadorList = () => {
  const [partidos, setPartidos] = useState([]);
  const [agrupacion, setAgrupacion] = useState('todos');
  const [resultados, setResultados] = useState({});
  const [campeonatoId, setCampeonatoId] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const navigation = useRouter();
  const { user } = useSession();

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/campeonatos/select`);
        const activo = response.data.find(c => c.estado !== 3);
        setCampeonatoId(activo ? activo.id : response.data[0]?.id);
      } catch (error) {
        console.log('Error al obtener campeonatos:', error);
      }
    };
    fetchCampeonatos();
  }, []);

  useEffect(() => {
    const fetchPartidos = async () => {
      if (!user?.id || !campeonatoId) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/jugador/partidos/jugador/${user.id}/${campeonatoId}`);
        setPartidos(response.data);
        setLoading(false);
      } catch (error) {
        console.log('Error al obtener los partidos:', error);
        setLoading(false);
      }
    };
    fetchPartidos();
  }, [user, campeonatoId]);

  useEffect(() => {
    const fetchResultados = async () => {
      const partidosFinalizados = partidos.filter(p => p.estado === estadosPartidoCampMapping.Finalizado);
      const resultadosTemp = {};
      for (const partido of partidosFinalizados) {
        try {
          const response = await axios.get(`${API_BASE_URL}/partidos/ganador/${partido.id}`);
          resultadosTemp[partido.id] = response.data;
        } catch (error) {
          console.log(`Error al obtener resultado para partido ${partido.id}:`, error);
        }
      }
      setResultados(resultadosTemp);
    };
    if (partidos.length > 0) {
      fetchResultados();
    }
  }, [partidos]);

  const formatDate = (fecha) => new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (fecha) => new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

  const getEstadoPartidoIcono = (fecha, estado) => {
    const ahora = new Date();
    const fechaPartido = new Date(fecha);
    if (fechaPartido < ahora && estado === estadosPartidoCampMapping.Confirmado)
      return { icono: <ErrorIcon name="error" size={20} />, clase: 'alerta' };
    if (fechaPartido >= ahora && estado === estadosPartidoCampMapping.Confirmado)
      return { icono: <PendingIcon name="pending" size={20} />, clase: 'pendiente' };
    if (estado === estadosPartidoCampMapping.Finalizado)
      return { icono: <CheckCircleIcon name="check-circle" size={20} />, clase: 'finalizado' };
    return null;
  };

  const filtrarPartidosPorEstado = (partidos) => {
    if (estadoFiltro === estadosPartidoCampMapping.Confirmado)
      return partidos.filter(p => p.estado === estadosPartidoCampMapping.Confirmado);
    if (estadoFiltro === estadosPartidoCampMapping.Finalizado)
      return partidos.filter(p => p.estado === estadosPartidoCampMapping.Finalizado);
    return partidos;
  };

  const handlePartidoClick = (partidoId) => {
    navigation.navigate({
      pathname: 'partidos/detalle_partido',
      params: { partidoId, campeonatoId }
    });
  };

  const agruparPartidos = () => {
    if (agrupacion === 'todos') return partidos;
    const agrupados = {};
    partidos.forEach((p) => {
      let clave = agrupacion === 'fecha' ? formatDate(p.fecha) :
                  agrupacion === 'lugar' ? p.lugar_nombre :
                  `${formatDate(p.fecha)} - ${p.lugar_nombre}`;
      if (!agrupados[clave]) agrupados[clave] = [];
      agrupados[clave].push(p);
    });
    return agrupados;
  };

  const getImagenClub = (uri) => uri ? { uri } : Club_defecto;

  const renderPartidoCard = (partido) => {
    const estadoPartido = getEstadoPartidoIcono(partido.fecha, partido.estado);
    const resultado = resultados[partido.id];
    return (
      <TouchableOpacity
        key={partido.id}
        style={styles.card}
        onPress={() => handlePartidoClick(partido.id)}
      >
        {estadoPartido && (
          <View style={[styles.estadoIcon, styles[estadoPartido.clase]]}>
            {estadoPartido.icono}
          </View>
        )}
        <View style={styles.teamContainer}>
          <View style={styles.team}>
            <Image source={getImagenClub(partido.equipo_local_imagen)} style={styles.teamLogo} />
            <Text style={styles.teamName}>{partido.equipo_local_nombre}</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.team}>
            <Image source={getImagenClub(partido.equipo_visitante_imagen)} style={styles.teamLogo} />
            <Text style={styles.teamName}>{partido.equipo_visitante_nombre}</Text>
          </View>
        </View>
        {partido.estado === estadosPartidoCampMapping.Finalizado && resultado && (
          <View style={styles.resultContainer}>
            {resultado.walkover ? (
              <Text style={styles.walkoverText}>
                Walkover {resultado.walkover === 'L' ? partido.equipo_local_nombre : resultado.walkover === 'V' ? partido.equipo_visitante_nombre : 'ambos equipos'}
              </Text>
            ) : (
              <Text style={styles.scoreText}>{resultado.ganador} ganó {resultado.marcador}</Text>
            )}
          </View>
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{formatDate(partido.fecha)}</Text>
          {(partido.estado === estadosPartidoCampMapping.Confirmado || partido.estado === estadosPartidoCampMapping.Vivo) && (
            <>
              <Text style={styles.infoText}>Hora: {formatTime(partido.fecha)}</Text>
              <Text style={styles.infoText}>Lugar: {partido.lugar_nombre}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#3D8FA4" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Partidos</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.filterLabel}>Agrupar por:</Text>
          <Picker
            selectedValue={agrupacion}
            style={styles.picker}
            onValueChange={(value) => setAgrupacion(value)}
          >
            <Picker.Item label="No agrupar" value="todos" />
            <Picker.Item label="Fecha" value="fecha" />
            <Picker.Item label="Lugar" value="lugar" />
            <Picker.Item label="Fecha y Lugar" value="fecha_lugar" />
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Text style={styles.filterLabel}>Filtrar por estado:</Text>
          <Picker
            selectedValue={estadoFiltro}
            style={styles.picker}
            onValueChange={(value) => setEstadoFiltro(value)}
          >
            <Picker.Item label="Todos" value="todos" />
            <Picker.Item label="Pendientes" value={estadosPartidoCampMapping.Confirmado} />
            <Picker.Item label="Jugados" value={estadosPartidoCampMapping.Finalizado} />
          </Picker>
        </View>
      </View>

      {agrupacion === 'todos' ? (
        filtrarPartidosPorEstado(partidos).map(partido => renderPartidoCard(partido))
      ) : (
        Object.entries(agruparPartidos(filtrarPartidosPorEstado(partidos))).map(([clave, partidosGrupo]) => (
          <View key={clave} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{clave}</Text>
            {partidosGrupo.map(partido => renderPartidoCard(partido))}
          </View>
        ))
      )}

      {partidos.length === 0 && (
        <Text style={styles.emptyText}>No hay partidos asignados</Text>
      )}
    </ScrollView>
  );
};

export default PartidosJugadorList;
