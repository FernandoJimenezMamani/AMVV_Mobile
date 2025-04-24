import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import estadosPartidoCampMapping from '../../constants/estado_partido';
import styles from '../../styles/ventana_principal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const Home = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [nextPartidos, setNextPartidos] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState(estadosPartidoCampMapping.Confirmado);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [resultados, setResultados] = useState({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const animationHeight = useState(new Animated.Value(0))[0];
  const navigation = useRouter();

  // Animación para mostrar/ocultar filtros
  useEffect(() => {
    Animated.timing(animationHeight, {
      toValue: filtersVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [filtersVisible]);

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, campeonatosRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categoria/get_categoria`),
          axios.get(`${API_BASE_URL}/campeonatos/select`),
        ]);
        
        setCategorias(categoriasRes.data);
        setCampeonatos(campeonatosRes.data);
        
        if (categoriasRes.data.length > 0) {
          setSelectedCategoria(categoriasRes.data[0].id);
        }
        
        const campeonatoActivo = campeonatosRes.data.find(camp => camp.estado !== 3);
        setSelectedCampeonato(campeonatoActivo?.id || campeonatosRes.data[0]?.id);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Fetch partidos y resultados
  useEffect(() => {
    if (!selectedCategoria || !selectedCampeonato) return;
  
    const fetchPartidos = async () => {
      try {
        // Endpoint para partidos destacados (primeros 5)
        const destacadosEndpoint = selectedEstado === estadosPartidoCampMapping.Finalizado
          ? `${API_BASE_URL}/partidos/get_past_matches/${selectedCategoria}/${selectedCampeonato}?limit=5`
          : `${API_BASE_URL}/partidos/get_upcoming_matches/${selectedCategoria}/${selectedCampeonato}?limit=5`;
  
        // Endpoint para todos los partidos
        const todosEndpoint = selectedEstado === estadosPartidoCampMapping.Finalizado
          ? `${API_BASE_URL}/partidos/get_all_matchesPast/${selectedCategoria}/${selectedCampeonato}`
          : `${API_BASE_URL}/partidos/get_all_matchesUpcoming/${selectedCategoria}/${selectedCampeonato}`;
  
        const [destacadosRes, todosRes] = await Promise.all([
          axios.get(destacadosEndpoint),
          axios.get(todosEndpoint)
        ]);
  
        setPartidos(destacadosRes.data);
        setNextPartidos(todosRes.data);
        
        // Fetch resultados para partidos finalizados
        if (selectedEstado === estadosPartidoCampMapping.Finalizado) {
          const resultadosTemp = {};
          const allPartidos = [...destacadosRes.data, ...todosRes.data];
          
          for (const partido of allPartidos) {
            try {
              const res = await axios.get(`${API_BASE_URL}/partidos/ganador/${partido.id}`);
              resultadosTemp[partido.id] = res.data;
            } catch (error) {
              console.error(`Error fetching resultado para partido ${partido.id}:`, error);
            }
          }
          setResultados(resultadosTemp);
        }
      } catch (error) {
        console.error('Error fetching partidos:', error);
        Alert.alert("Error", "No se pudieron cargar los partidos. Por favor intenta nuevamente.");
      }
    };
  
    fetchPartidos();
  }, [selectedCategoria, selectedCampeonato, selectedEstado]);

  // Helpers
  const setGenderName = (gender) => gender === 'V' ? 'Varones' : 'Damas';
  
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

  const handlePartidoPress = (partidoId) => {
    navigation.navigate({
      pathname: 'partidos/detalle_partido',
      params: { 
        partidoId: partidoId.toString(),
        campeonatoId: selectedCampeonato.toString(),
        categoriaId: selectedCategoria.toString() 
      }
    });
  };

  const handleVerTabla = () => {
    navigation.navigate('TablaPosiciones', {
      categoriaId: selectedCategoria,
      campeonatoId: selectedCampeonato,
    });
  };

  // Render Items
  const renderPartidoPrincipal = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchCardLarge}
      onPress={() => handlePartidoPress(item.id)}
    >
      <View style={styles.matchHeader}>
        <Text style={styles.matchStatus}>
          {selectedEstado === estadosPartidoCampMapping.Confirmado ? 'PRÓXIMAMENTE' : 'FINALIZADO'}
        </Text>
      </View>
      
      <View style={styles.matchContent}>
        <View style={styles.teamContainer}>
          <Image source={{ uri: item.equipo_local_imagen }} style={styles.teamLogoLarge} />
          <Text style={styles.teamNameLarge}>{item.equipo_local_nombre}</Text>
        </View>
        
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={styles.teamContainer}>
          <Image source={{ uri: item.equipo_visitante_imagen }} style={styles.teamLogoLarge} />
          <Text style={styles.teamNameLarge}>{item.equipo_visitante_nombre}</Text>
        </View>
      </View>
      
      <View style={styles.matchFooter}>
        {item.estado === estadosPartidoCampMapping.Finalizado && resultados[item.id] && (
          <View style={styles.resultContainer}>
            {resultados[item.id].walkover ? (
              <Text style={styles.walkoverText}>
                Walkover {resultados[item.id].walkover === "L" ? item.equipo_local_nombre : item.equipo_visitante_nombre}
              </Text>
            ) : (
              <Text style={styles.scoreText}>
                Ganador {resultados[item.id].ganador} {resultados[item.id].marcador}
              </Text>
            )}
          </View>
        )}
        
        <Text style={styles.matchDate}>{formatDate(item.fecha)}</Text>
        {item.estado === estadosPartidoCampMapping.Confirmado && (
          <Text style={styles.matchTime}>{formatTime(item.fecha)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPartidoSecundario = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchCardSmall}
      onPress={() => handlePartidoPress(item.id)}
    >
      <View style={styles.smallMatchContent}>
        <View style={styles.smallTeamContainer}>
          <Image source={{ uri: item.equipo_local_imagen }} style={styles.teamLogoSmall} />
          <Text style={styles.teamNameSmall} numberOfLines={2}>{item.equipo_local_nombre}</Text>
        </View>
        
        <Text style={styles.vsTextSmall}>VS</Text>
        
        <View style={styles.smallTeamContainer}>
          <Image source={{ uri: item.equipo_visitante_imagen }} style={styles.teamLogoSmall} />
          <Text style={styles.teamNameSmall} numberOfLines={2}>{item.equipo_visitante_nombre}</Text>
        </View>
      </View>
      
      <View style={styles.smallMatchFooter}>
        <Text style={styles.smallMatchDate}>{formatDate(item.fecha)}</Text>
        {item.estado === estadosPartidoCampMapping.Confirmado && (
          <Text style={styles.smallMatchTime}>{formatTime(item.fecha)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Para el grid de partidos secundarios
  const dataWithPadding = nextPartidos.length % 2 !== 0 
    ? [...nextPartidos, { id: 'empty', isEmpty: true }] 
    : nextPartidos;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Botón para mostrar/ocultar filtros */}
        <TouchableOpacity 
          style={styles.filterToggleButton} 
          onPress={toggleFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.filterToggleText}>
            {filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Text>
          <Icon 
            name={filtersVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>

        {/* Filtros (con animación) */}
        <Animated.View 
          style={[
            styles.filtersContainer,
            {
              height: animationHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 280]
              }),
              opacity: animationHeight,
              overflow: 'hidden'
            }
          ]}
        >
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCampeonato}
              onValueChange={(value) => setSelectedCampeonato(value)}
              style={styles.picker}
            >
              {campeonatos.map((camp) => (
                <Picker.Item 
                  key={camp.id} 
                  label={`🏆 ${camp.nombre}`} 
                  value={camp.id} 
                />
              ))}
            </Picker>
          </View>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategoria}
              onValueChange={(value) => setSelectedCategoria(value)}
              style={styles.picker}
            >
              {categorias.map((cat) => (
                <Picker.Item 
                  key={cat.id} 
                  label={`${cat.nombre} - ${setGenderName(cat.genero)}`} 
                  value={cat.id} 
                />
              ))}
            </Picker>
          </View>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedEstado}
              onValueChange={(value) => setSelectedEstado(value)}
              style={styles.picker}
            >
              <Picker.Item label="📅 Partidos Próximos" value="C" />
              <Picker.Item label="✅ Partidos Finalizados" value="J" />
            </Picker>
          </View>
          
          <TouchableOpacity style={styles.tablaButton} onPress={handleVerTabla}>
            <Text style={styles.tablaButtonText}>Ver Tabla de Posiciones</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Partidos Destacados (Scroll Horizontal) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {selectedEstado === estadosPartidoCampMapping.Confirmado 
              ? 'Partidos Destacados' 
              : 'Últimos Resultados'}
          </Text>
          
          {partidos.length > 0 ? (
            <FlatList
              data={partidos}
              renderItem={renderPartidoPrincipal}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={styles.matchCardLarge.width}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: styles.horizontalList.paddingHorizontal }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="info-outline" size={50} color="#999" />
              <Text style={styles.emptyText}>
                {selectedEstado === estadosPartidoCampMapping.Confirmado
                  ? 'No hay partidos próximos'
                  : 'No hay resultados recientes'}
              </Text>
            </View>
          )}
        </View>

        {/* Todos los Partidos (Grid) */}
        <View style={styles.sectionContainer2}>
          <Text style={styles.sectionTitle}>
            {selectedEstado === estadosPartidoCampMapping.Confirmado
              ? 'Todos los Próximos Partidos'
              : 'Historial de Partidos'}
          </Text>
          
          {nextPartidos.length > 0 ? (
            <FlatList
              data={dataWithPadding}
              renderItem={({ item }) => item.isEmpty ? (
                <View style={{ width: '48%' }} />
              ) : (
                renderPartidoSecundario({ item })
              )}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContainer}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="info-outline" size={50} color="#999" />
              <Text style={styles.emptyText}>No hay partidos disponibles</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;