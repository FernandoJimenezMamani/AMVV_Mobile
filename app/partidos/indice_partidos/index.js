import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Alert, Image } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import estadosPartidoCampMapping from '../../../constants/estado_partido';
import rolMapping from '../../../constants/roles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PartidosList = () => {
  const { campeonatoId, categoriaId } = useLocalSearchParams();
  const [partidos, setPartidos] = useState([]);
  const [agrupacion, setAgrupacion] = useState('todos');
  const [resultados, setResultados] = useState({});
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [fixtureCompleto, setFixtureCompleto] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        console.log(campeonatoId, categoriaId);
        const response = await axios.get(`${API_BASE_URL}/partidos/select/${categoriaId}/${campeonatoId}`);
        setPartidos(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron obtener los partidos');
        console.error('Error al obtener los partidos:', error);
      }
    };

    fetchPartidos();
  }, [categoriaId]);

  useEffect(() => {
    const fetchResultados = async () => {
      const partidosFinalizados = partidos.filter(partido => partido.estado === estadosPartidoCampMapping.Finalizado);
      const resultadosTemp = {};

      for (const partido of partidosFinalizados) {
        try {
          const response = await axios.get(`${API_BASE_URL}/partidos/ganador/${partido.id}`);
          resultadosTemp[partido.id] = response.data;
        } catch (error) {
          console.error(`Error al obtener resultado para partido ${partido.id}:`, error);
        }
      }

      setResultados(resultadosTemp);
    };

    if (partidos.length > 0) {
      fetchResultados();
    }
  }, [partidos]);

  useEffect(() => {
    const verificarFixture = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/partidos/verificar-fixture/${campeonatoId}/${categoriaId}`);
        setFixtureCompleto(response.data);
      } catch (error) {
        console.error("Error al verificar fixture:", error);
      }
    };
  
    verificarFixture();
  }, [campeonatoId, categoriaId]);

  const handleRegistrarPartido = () => {
    router.push(`/partidos/registrar/${campeonatoId}/${categoriaId}`);
  };

  const handleVerTabla = () => {
    router.push({
      pathname: "/tabla_posiciones",
      params: {
        campeonatoId: campeonatoId,
        categoriaId: categoriaId
      }
    });
  };
  const handlePartidoClick = (partidoId) => {
    router.push({
      pathname: `/partidos/partidoDetalle/${partidoId}`,
      params: { campeonatoId, categoriaId }
    });
  };

  const handleBack = () => {
    router.push(`/categoria/indice/${campeonatoId}`);
  };

  const formatDate = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const filtrarPartidosPorEstado = (partidos) => {
    if (estadoFiltro === estadosPartidoCampMapping.Confirmado) {
      return partidos.filter((partido) => partido.estado === estadosPartidoCampMapping.Confirmado);
    }
    if (estadoFiltro === estadosPartidoCampMapping.Finalizado) {
      return partidos.filter((partido) => partido.estado === estadosPartidoCampMapping.Finalizado);
    }
    return partidos;
  };

  const getEstadoPartidoIcono = (fecha, estado) => {
    const ahora = new Date();
    const fechaPartido = new Date(fecha);
  
    if (fechaPartido < ahora && estado === estadosPartidoCampMapping.Confirmado) {
      return { icono: <MaterialIcons name="error" size={20} color="orange" />, clase: 'alerta' };
    }
    if (fechaPartido >= ahora && estado === estadosPartidoCampMapping.Confirmado) {
      return { icono: <MaterialIcons name="pending" size={20} color="gray" />, clase: 'pendiente' };
    }
    if (estado === estadosPartidoCampMapping.Finalizado) {
      return { icono: <MaterialIcons name="check-circle" size={20} color="green" />, clase: 'finalizado' };
    }
    return null;
  };

  const agruparPartidos = () => {
    const partidosFiltrados = filtrarPartidosPorEstado(partidos);
    
    if (agrupacion === 'todos') {
      return { 'Todos los partidos': partidosFiltrados };
    }

    const agrupados = {};
    partidosFiltrados.forEach((partido) => {
      let clave = '';
      
      if (agrupacion === 'fecha') {
        clave = formatDate(partido.fecha);
      } else if (agrupacion === 'lugar') {
        clave = partido.lugar_nombre;
      } else if (agrupacion === 'fecha_lugar') {
        clave = `${formatDate(partido.fecha)} - ${partido.lugar_nombre}`;
      }

      if (!agrupados[clave]) {
        agrupados[clave] = [];
      }
      
      agrupados[clave].push(partido);
    });

    return agrupados;
  };

  const renderPartidosAgrupados = () => {
    const partidosAgrupados = agruparPartidos();
    
    return Object.entries(partidosAgrupados).map(([grupo, partidosGrupo]) => (
      <View key={grupo} style={styles.groupContainer}>
        <Text style={styles.groupTitle}>{grupo}</Text>
        <FlatList
          data={partidosGrupo}
          renderItem={renderPartidoCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    ));
  };

  const renderPartidoCard = ({ item: partido }) => {
    const estadoPartido = getEstadoPartidoIcono(partido.fecha, partido.estado);
    const resultado = resultados[partido.id];

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handlePartidoClick(partido.id)}
      >
        {partido.estado === estadosPartidoCampMapping.Vivo && (
          <View style={styles.liveIndicator} />
        )}

        {estadoPartido && (
          <View style={[styles.estadoIcon, styles[estadoPartido.clase]]}>
            {estadoPartido.icono}
          </View>
        )}

        <View style={styles.teamContainer}>
          <View style={styles.team}>
            <Image 
              source={{ uri: partido.equipo_local_imagen }} 
              style={styles.teamLogo} 
              defaultSource={require('../../../assets/img/Default_Imagen_Club.webp')}
            />
            <Text style={styles.teamName} numberOfLines={1}>{partido.equipo_local_nombre}</Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.team}>
            <Image 
              source={{ uri: partido.equipo_visitante_imagen }} 
              style={styles.teamLogo} 
              defaultSource={require('../../../assets/img/Default_Imagen_Club.webp')}
            />
            <Text style={styles.teamName} numberOfLines={1}>{partido.equipo_visitante_nombre}</Text>
          </View>
        </View>

        {partido.estado === estadosPartidoCampMapping.Finalizado && resultado && (
          <View style={styles.resultContainer}>
            {resultado.walkover ? (
              <Text style={styles.walkoverText}>
                Walkover {resultado.walkover === "L" ? partido.equipo_local_nombre :
                resultado.walkover === "V" ? partido.equipo_visitante_nombre :
                "ambos equipos"}
              </Text>
            ) : (
              <Text style={styles.scoreText}>
                {resultado.ganador} ganó {resultado.marcador}
              </Text>
            )}
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{formatDate(partido.fecha)}</Text>
          {(partido.estado === estadosPartidoCampMapping.Confirmado || 
            partido.estado === estadosPartidoCampMapping.Vivo) && (
            <>
              <Text style={styles.infoText}>Hora: {formatTime(partido.fecha)}</Text>
              <Text style={styles.infoText}>Lugar: {partido.lugar_nombre}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#143E42" />
        </TouchableOpacity>
        <Text style={styles.title}>Partidos</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            fixtureCompleto && { opacity: 0.5 }
          ]}
          onPress={handleRegistrarPartido}
          disabled={fixtureCompleto}
        >
          <Text style={styles.buttonText}>+1 Partido</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleVerTabla}
        >
          <Text style={styles.buttonText}>Ver tabla</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.filterLabel}>Agrupar por:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={agrupacion}
              onValueChange={(itemValue) => setAgrupacion(itemValue)}
              style={styles.picker}
              dropdownIconColor="#143E42"
              mode="dropdown"
            >
              <Picker.Item label="No agrupar" value="todos" style={styles.pickerItem} />
              <Picker.Item label="Fecha" value="fecha" style={styles.pickerItem} />
              <Picker.Item label="Lugar" value="lugar" style={styles.pickerItem} />
              <Picker.Item label="Fecha y Lugar" value="fecha_lugar" style={styles.pickerItem} />
            </Picker>
          </View>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.filterLabel}>Filtrar por:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={estadoFiltro}
              onValueChange={(itemValue) => setEstadoFiltro(itemValue)}
              style={styles.picker}
              dropdownIconColor="#143E42"
              mode="dropdown"
            >
              <Picker.Item label="Todos" value="todos" style={styles.pickerItem} />
              <Picker.Item label="Pendientes" value={estadosPartidoCampMapping.Confirmado} style={styles.pickerItem} />
              <Picker.Item label="Jugados" value={estadosPartidoCampMapping.Finalizado} style={styles.pickerItem} />
            </Picker>
          </View>
        </View>
      </View>

      <ScrollView style={styles.listContainer}>
        {agrupacion === 'todos' ? (
          <FlatList
            data={filtrarPartidosPorEstado(partidos)}
            renderItem={renderPartidoCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay partidos disponibles</Text>
            }
          />
        ) : (
          renderPartidosAgrupados()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 15,
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
    flex: 1,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f2f5',
  },
  actionButton: {
    backgroundColor: '#3D8FA4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerWrapper: {
    width: '48%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#143E42',
  },
  pickerItem: {
    fontSize: 14,
    color: '#143E42',
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3D8FA4',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  liveIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00e676',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  estadoIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  pendiente: {
    color: 'gray',
  },
  alerta: {
    color: 'orange',
  },
  finalizado: {
    color: 'green',
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  team: {
    alignItems: 'center',
    width: '40%',
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
    backgroundColor: '#ddd',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  resultContainer: {
    marginVertical: 5,
    padding: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  walkoverText: {
    fontSize: 14,
    color: '#d9534f',
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default PartidosList;