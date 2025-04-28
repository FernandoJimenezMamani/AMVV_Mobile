import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import estadosPartidoCampMapping from '../../constants/estado_partido';
import styles from '../../styles/ventana_principal';
import Club_defecto from '../../assets/img/Club_defecto.png';
import PulseDot from '../../components/PulseDot';
import { useRef } from 'react';
import KeyboardArrowUpIcon from 'react-native-vector-icons/MaterialIcons';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const Home = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [nextPartidos, setNextPartidos] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState(estadosPartidoCampMapping.Confirmado);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [resultados, setResultados] = useState({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const animationHeight = useState(new Animated.Value(0))[0];
  const navigation = useRouter();
  const [visiblePartidos, setVisiblePartidos] = useState(5);
  const scrollViewRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    Animated.timing(animationHeight, {
      toValue: filtersVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [filtersVisible]);

  const toggleFilters = () => setFiltersVisible(!filtersVisible);

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

  useEffect(() => {
    if (!selectedCategoria || !selectedCampeonato || !selectedEstado) return;

    const fetchMatches = async () => {
      try {
        let endpoint = `${API_BASE_URL}/partidos/get_all_matchesUpcoming/${selectedCategoria}/${selectedCampeonato}`;
        if (selectedEstado === estadosPartidoCampMapping.Finalizado) {
          endpoint = `${API_BASE_URL}/partidos/get_all_matchesPast/${selectedCategoria}/${selectedCampeonato}`;
        } else if (selectedEstado === estadosPartidoCampMapping.Vivo) {
          endpoint = `${API_BASE_URL}/partidos/get_live_matches/${selectedCategoria}/${selectedCampeonato}`;
        }

        const response = await axios.get(endpoint);
        setNextPartidos(response.data);

        if (selectedEstado === estadosPartidoCampMapping.Finalizado) {
          const resultadosTemp = {};
          for (const partido of response.data) {
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
        Alert.alert('Error', 'No se pudieron cargar los partidos. Intenta nuevamente.');
      }
    };

    fetchMatches();
  }, [selectedCategoria, selectedCampeonato, selectedEstado]);

  const setGenderName = (gender) => (gender === 'V' ? 'Varones' : 'Damas');

  const formatDate = (fecha) => new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const formatTime = (fecha) => new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  const handlePartidoPress = (partidoId) => {
    navigation.navigate({
      pathname: 'partidos/detalle_partido',
      params: {
        partidoId: partidoId.toString(),
        campeonatoId: selectedCampeonato.toString(),
        categoriaId: selectedCategoria.toString(),
      }
    });
  };
  
  const handleLoadMore = () => {
    setVisiblePartidos(prev => prev + 5);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 300) {
      setShowScrollToTop(true);   // si baja más de 300px mostramos el botón
    } else {
      setShowScrollToTop(false);  // si sube, ocultamos el botón
    }
  };
  

  const handleVerTabla = () => {
    navigation.navigate('TablaPosiciones', {
      categoriaId: selectedCategoria,
      campeonatoId: selectedCampeonato,
    });
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const getImagenClub = (imagen) => imagen ? { uri: imagen } : Club_defecto;

  const renderPartido = ({ item }) => {
    const resultado = resultados[item.id];
    return (
      <TouchableOpacity
        style={styles.matchCardSmall}
        onPress={() => handlePartidoPress(item.id)}
      >
        <View style={styles.smallMatchContent}>
          <View style={styles.smallTeamContainer}>
            <Image source={getImagenClub(item.equipo_local_imagen)} style={styles.teamLogoSmall} />
            <Text style={styles.teamNameSmall} numberOfLines={2}>{item.equipo_local_nombre}</Text>
          </View>
  
          <Text style={styles.vsTextSmall}>VS</Text>
  
          <View style={styles.smallTeamContainer}>
            <Image source={getImagenClub(item.equipo_visitante_imagen)} style={styles.teamLogoSmall} />
            <Text style={styles.teamNameSmall} numberOfLines={2}>{item.equipo_visitante_nombre}</Text>
          </View>
        </View>
  
        <View style={styles.smallMatchFooter}>
          {item.estado === estadosPartidoCampMapping.Finalizado ? (
            resultados[item.id] ? (
              resultados[item.id].walkover ? (
                <Text style={styles.smallMatchResult}>
                  Walkover {resultados[item.id].walkover === "L" ? item.equipo_local_nombre : resultados[item.id].walkover === "V" ? item.equipo_visitante_nombre : "ambos equipos"}
                </Text>
              ) : (
                <Text style={styles.smallMatchResult}>
                  Ganador {resultados[item.id].ganador} {resultados[item.id].marcador}
                </Text>
              )
            ) : (
              <Text style={styles.smallMatchPending}>Resultado en espera</Text>
            )
          ) : item.estado === estadosPartidoCampMapping.Vivo ? (
            <View style={styles.liveIndicatorContainer}>
              <PulseDot size={12} color="red" />
              <Text style={styles.liveText}>En Vivo</Text>
            </View>
          ) : null}

          {/* Fecha siempre se muestra */}
          <Text style={styles.smallMatchDate}>{formatDate(item.fecha)}</Text>

          {/* Si es confirmado y ya pasó la hora */}
          {item.estado === estadosPartidoCampMapping.Confirmado && new Date(item.fecha) < new Date() && (
            <Text style={styles.smallMatchPending}>Resultado en espera</Text>
          )}

          {/* Si es confirmado y aún falta jugar */}
          {item.estado === estadosPartidoCampMapping.Confirmado && new Date(item.fecha) > new Date() && (
            <Text style={styles.smallMatchTime}>{formatTime(item.fecha)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer} ref={scrollViewRef} onScroll={handleScroll} scrollEventThrottle={16}>
        <TouchableOpacity style={styles.filterToggleButton} onPress={toggleFilters}>
          <Text style={styles.filterToggleText}>{filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}</Text>
          <Icon name={filtersVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#fff" />
        </TouchableOpacity>

        {showScrollToTop && (
          <TouchableOpacity style={styles.goToTopButton} onPress={scrollToTop}>
            <Icon style={styles.goToTopText} name={'keyboard-arrow-up'}/>
          </TouchableOpacity>
        )}

        <Animated.View
          style={[
            styles.filtersContainer,
            {
              height: animationHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 280] }),
              opacity: animationHeight,
              overflow: 'hidden',
            }
          ]}
        >
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedCampeonato} onValueChange={setSelectedCampeonato} style={styles.picker}>
              {campeonatos.map(camp => <Picker.Item key={camp.id} label={`🏆 ${camp.nombre}`} value={camp.id} />)}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedCategoria} onValueChange={setSelectedCategoria} style={styles.picker}>
              {categorias.map(cat => <Picker.Item key={cat.id} label={`${cat.nombre} - ${setGenderName(cat.genero)}`} value={cat.id} />)}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedEstado} onValueChange={setSelectedEstado} style={styles.picker}>
              <Picker.Item label="📅 Partidos Próximos" value="C" />
              <Picker.Item label="🔴 Partidos En Vivo" value="V" />
              <Picker.Item label="✅ Partidos Finalizados" value="J" />
            </Picker>
          </View>
          <TouchableOpacity style={styles.tablaButton} onPress={handleVerTabla}>
            <Text style={styles.tablaButtonText}>Ver Tabla de Posiciones</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {nextPartidos.length > 0
              ? selectedEstado === estadosPartidoCampMapping.Confirmado
                ? 'Próximos Partidos'
                : selectedEstado === estadosPartidoCampMapping.Vivo
                ? 'Partidos en Vivo'
                : 'Partidos Finalizados'
              : 'No hay partidos disponibles'}
          </Text>

          {nextPartidos.length > 0 ? (
            <FlatList
              data={nextPartidos.slice(0, visiblePartidos)}
              renderItem={renderPartido}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="info-outline" size={50} color="#999" />
              <Text style={styles.emptyText}>No hay partidos disponibles</Text>
            </View>
          )}
          {visiblePartidos < nextPartidos.length && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
              <Text style={styles.loadMoreText}>Cargar más</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
