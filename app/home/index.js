import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
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
  const navigation = useRouter();

  // Fetch data (similar a tu useEffect original)
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

  // Fetch partidos y resultados (adaptado)
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
        setNextPartidos(todosRes.data); // Excluimos los primeros 5 que ya están en destacados
        
        console.log('Partidos destacados:', destacadosRes.data);
        console.log('Todos los partidos:', todosRes.data);
        console.log('Próximos partidos:', todosRes.data.slice(5));
  
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
        // Opcional: Mostrar mensaje al usuario
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
    navigation.navigate('PartidoDetalle', {
      partidoId,
      campeonatoId: selectedCampeonato,
      categoriaId: selectedCategoria,
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
  const dataWithPadding = nextPartidos.length % 2 !== 0 
  ? [...nextPartidos, { id: 'empty', isEmpty: true }] 
  : nextPartidos;
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filtros</Text>
        
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
      </View>

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
         snapToInterval={styles.matchCardLarge.width} // Usamos el width definido en los estilos
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
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <View style={styles.emptyContainer}>
      <Icon name="info-outline" size={50} color="#999" />
      <Text style={styles.emptyText}>No hay partidos disponibles</Text>
    </View>
  )}
</View>
    </SafeAreaView>
  );
};

export default Home;