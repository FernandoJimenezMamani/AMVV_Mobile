import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Alert, Image } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import estadosPartidoCampMapping from '../../../constants/estado_partido';
import rolMapping from '../../../constants/roles';
import styles from '../../../styles/partidos/index_partido';

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
    router.navigate({
      pathname: 'partidos/detalle_partido',
      params: { 
        partidoId,
        campeonatoId,
        categoriaId
      }
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
export default PartidosList;