import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import estadosMapping from '../../constants/campeonato_estados';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const WEBSOCKET_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL;

const TablaPosiciones = () => {
  const [equipos, setEquipos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [estadoCampeonato, setEstadoCampeonato] = useState(null);
  const [categoriaAscenso, setCategoriaAscenso] = useState(null);
  const [marcadoresVivos, setMarcadoresVivos] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  const navigation = useRouter();
  const { categoriaId, campeonatoId } = useLocalSearchParams();

  const fetchTitulo = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/campeonatos/get_campeonato_categoria/${campeonatoId}/${categoriaId}`);
      setTitulo(`${response.data.campeonato_nombre} - ${response.data.categoria_nombre}`);
      setEstadoCampeonato(response.data.estado);

      const categoriasRes = await axios.get(`${API_BASE_URL}/categoria/get_categoria`);
      const categoriaActual = categoriasRes.data.find(cat => cat.id === parseInt(categoriaId));
      if (categoriaActual && categoriaActual.es_ascenso === 'S') {
        setCategoriaAscenso(true);
      }
    } catch (error) {
      console.error('Error al obtener el título:', error);
    }
  }, [campeonatoId, categoriaId]);

  const fetchEquipos = useCallback(async () => {
    try {
      const incluir = categoriaAscenso ? 'true' : 'false';
      const response = await axios.get(`${API_BASE_URL}/campeonatos/get_campeonato_posiciones/${campeonatoId}/${categoriaId}/${incluir}`);
      setEquipos(response.data);
      await fetchMarcadoresVivos();
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los equipos:', error);
      setLoading(false);
    }
  }, [campeonatoId, categoriaId, categoriaAscenso]);

  const fetchMarcadoresVivos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/partidos/marcadores-vivos/${campeonatoId}/${categoriaId}`);
      const formateado = {};
      res.data.forEach(item => {
        formateado[item.equipo_id] = {
          marcador: item.marcador,
          estado: item.estado
        };
      });
      setMarcadoresVivos(formateado);
    } catch (error) {
      console.error("Error al obtener marcadores vivos:", error);
    }
  }, [campeonatoId, categoriaId]);

  useEffect(() => { fetchTitulo(); }, [fetchTitulo]);
  useEffect(() => { if (categoriaAscenso !== null) fetchEquipos(); }, [fetchEquipos, categoriaAscenso]);

  useEffect(() => {
    if (!campeonatoId || !categoriaId) return;
    const ws = new WebSocket(`${WEBSOCKET_URL}/tablaposiciones/${campeonatoId}/${categoriaId}`);
    ws.onopen = () => console.log('✅ Conexión WebSocket establecida');
    ws.onmessage = (event) => {
      try {
        const mensaje = JSON.parse(event.data);
        if (mensaje.type === "actualizacion_estados") {
          fetchEquipos();
        }
      } catch (error) {
        console.error('❌ Error al procesar mensaje WebSocket:', error);
      }
    };
    ws.onerror = (error) => console.error('⚠️ Error WebSocket:', error);
    ws.onclose = () => console.log('🔴 WebSocket cerrado');
    return () => ws.close();
  }, [campeonatoId, categoriaId, fetchEquipos]);

  const handleTeamClick = (equipoId) => navigation.navigate('PerfilEquipo', { equipoId });
  const toggleLegend = () => setShowLegend(!showLegend);

  const renderFilaEquipo = (equipo, index) => {
    const marcadorVivo = marcadoresVivos[equipo.equipo_id];
    return (
      <View key={equipo.equipo_id} style={[styles.fila, equipo.estado === 'Deuda' && styles.filaDeuda]}>
        <View style={styles.columnaFija}>
          <Text style={styles.celda}>{index + 1}</Text>
          <TouchableOpacity style={styles.celdaEquipo} onPress={() => handleTeamClick(equipo.equipo_id)}>
            <Image source={{ uri: equipo.escudo }} style={[styles.logoEquipo, equipo.estado === 'Deuda' && styles.logoDeuda]} />
            <Text style={styles.nombreEquipo} numberOfLines={1}>{equipo.equipo_nombre}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.contenidoScroll}>
            <View style={styles.grupoDatos}>
              <Text style={styles.celda}>{equipo.partidos_jugados}</Text>
              <Text style={styles.celda}>{equipo.partidos_ganados}</Text>
              <Text style={styles.celda}>{equipo.partidos_perdidos}</Text>
              <Text style={[styles.celda, styles.celdaDestacada]}>{equipo.pts}</Text>
            </View>
            <View style={styles.grupoDatos}>
              <Text style={styles.celda}>{equipo.sets_a_favor}</Text>
              <Text style={styles.celda}>{equipo.sets_en_contra}</Text>
              <Text style={styles.celda}>{equipo.diferencia_sets}</Text>
              <Text style={styles.celda}>{equipo.puntos_a_favor}</Text>
              <Text style={styles.celda}>{equipo.puntos_en_contra}</Text>
              <Text style={styles.celda}>{equipo.diferencia_puntos}</Text>
            </View>
          </View>
        </ScrollView>
        {marcadorVivo && (
          <View style={[styles.marcadorVivo, styles[`marcador${marcadorVivo.estado.charAt(0).toUpperCase() + marcadorVivo.estado.slice(1)}`]]}>
            <Text style={styles.textoMarcador}>{marcadorVivo.marcador}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D8FA4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#143E42" />
        </TouchableOpacity>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>

      {estadoCampeonato === 2 && (
        <View style={styles.estadoCampeonato}>
          <View style={styles.indicadorActivo} />
          <Text style={styles.textoEstado}>En curso</Text>
        </View>
      )}

      {/* Scroll compartido para encabezados + datos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.encabezadosContainer}>
            <View style={styles.encabezadosFijos}>
              <Text style={styles.encabezado}></Text>
              <Text style={[styles.encabezado, styles.encabezadoEquipo]}>Equipo</Text>
            </View>
            <View style={styles.grupoEncabezados}>
              <Text style={styles.encabezado}>PJ</Text>
              <Text style={styles.encabezado}>PG</Text>
              <Text style={styles.encabezado}>PP</Text>
              <Text style={[styles.encabezado, styles.encabezadoDestacado]}>PTS</Text>
              <Text style={styles.encabezado}>SF</Text>
              <Text style={styles.encabezado}>SC</Text>
              <Text style={styles.encabezado}>DS</Text>
              <Text style={styles.encabezado}>PF</Text>
              <Text style={styles.encabezado}>PC</Text>
              <Text style={styles.encabezado}>DP</Text>
            </View>
          </View>

          <ScrollView style={styles.listaEquiposContainer}>
            {equipos.map((equipo, index) => renderFilaEquipo(equipo, index))}
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.legendButton} onPress={toggleLegend}>
        <Text style={styles.legendButtonText}>{showLegend ? 'Ocultar' : 'Mostrar'} significado de abreviaturas</Text>
      </TouchableOpacity>

      {showLegend && (
        <View style={styles.legendContainer}>
          <View style={styles.legendColumn}>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>PJ</Text> - Partidos Jugados</Text>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>PG</Text> - Partidos Ganados</Text>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>PP</Text> - Partidos Perdidos</Text>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>PTS</Text> - Puntos</Text>
          </View>
          <View style={styles.legendColumn}>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>SF</Text> - Sets a Favor</Text>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>SC</Text> - Sets en Contra</Text>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>DS</Text> - Diferencia de Sets</Text>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>PF</Text> - Puntos a Favor</Text>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>PC</Text> - Puntos en Contra</Text>
            <Text style={styles.legendItem}><Text style={styles.legendAbbr}>DP</Text> - Diferencia de Puntos</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#143E42',
    flexShrink: 1,
  },
  estadoCampeonato: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  indicadorActivo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0f960f',
    marginRight: 8,
  },
  textoEstado: {
    color: '#0f960f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  encabezadosContainer: {
    flexDirection: 'row',
    backgroundColor: '#3D8FA4',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 5,
  },
  encabezadosFijos: {
    flexDirection: 'row',
    width: 190,
  },
  encabezado: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    width: 30,
    marginHorizontal: 2,
  },
  encabezadoEquipo: {
    width: 80,
    textAlign: 'left',
    marginLeft: 5,
  },
  encabezadoDestacado: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  scrollEncabezados: {
    flexDirection: 'row',
  },
  grupoEncabezados: {
    flexDirection: 'row',
    marginRight: 15,
  },
  listaEquiposContainer: {
    flex: 1,
  },
  fila: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filaDeuda: {
    opacity: 0.6,
  },
  columnaFija: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 190,
  },
  celda: {
    textAlign: 'center',
    width: 30,
    marginHorizontal: 2,
    fontSize: 14,
  },
  celdaDestacada: {
    fontWeight: 'bold',
    color: '#3D8FA4',
  },
  celdaEquipo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    marginLeft: 5,
  },
  logoEquipo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  logoDeuda: {
    opacity: 0.4,
  },
  nombreEquipo: {
    flex: 1,
    fontSize: 14,
  },
  contenidoScroll: {
    flexDirection: 'row',
  },
  grupoDatos: {
    flexDirection: 'row',
    marginRight: 15,
  },
  marcadorVivo: {
    position: 'absolute',
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  marcadorGanando: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  marcadorPerdiendo: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  marcadorEmpate: {
    backgroundColor: '#e2e3e5',
    borderColor: '#d6d8db',
    borderWidth: 1,
  },
  textoMarcador: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  legendButton: {
    backgroundColor: '#3D8FA4',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  legendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f2f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  legendColumn: {
    flex: 1,
  },
  legendItem: {
    marginBottom: 5,
    fontSize: 14,
  },
  legendAbbr: {
    fontWeight: 'bold',
    color: '#143E42',
  },
});

export default TablaPosiciones;