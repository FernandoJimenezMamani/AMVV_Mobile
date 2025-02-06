import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const { id: campeonatoId } = useLocalSearchParams(); // Cambia a useLocalSearchParams
  const router = useRouter();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categoria/get_categoria`);
        setCategorias(response.data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron obtener las categorías');
        console.error('Error al obtener las categorías:', error);
      }
    };

    fetchCategorias();
  }, []);

  const handleDivisionClick = (division) => {
    setSelectedDivision(selectedDivision === division ? null : division);
  };

  const filterCategorias = (division, genero) => {
    return categorias.filter(
      categoria => categoria.division === division && categoria.genero === genero
    );
  };

  const handleCategorySelect = (categoriaId) => {
    router.push(`/partidos/indice/${campeonatoId}/${categoriaId}`);
  };

  const renderCategoryItem = ({ item, genero }) => (
    <TouchableOpacity
      style={genero === 'M' ? styles.categoriaItemMan : styles.categoriaItemWomen}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={styles.categoriaText}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  const renderDivision = (division, genero) => (
    <View style={styles.categoriasColumn}>
      <Text style={styles.categoriasColumnTitle}>
        {genero === 'M' ? 'Varones' : 'Damas'}
      </Text>
      <FlatList
        data={filterCategorias(division, genero)}
        renderItem={({ item }) => renderCategoryItem({ item, genero })}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Categorías</Text>

      <TouchableOpacity
        style={styles.divisionButton}
        onPress={() => handleDivisionClick('MY')}
      >
        <Text style={styles.divisionButtonText}>Mayores</Text>
      </TouchableOpacity>

      {selectedDivision === 'MY' && (
        <View style={styles.divisionCategorias}>
          {renderDivision('MY', 'M')}
          {renderDivision('MY', 'F')}
        </View>
      )}

      <TouchableOpacity
        style={styles.divisionButton}
        onPress={() => handleDivisionClick('MN')}
      >
        <Text style={styles.divisionButtonText}>Menores</Text>
      </TouchableOpacity>

      {selectedDivision === 'MN' && (
        <View style={styles.divisionCategorias}>
          {renderDivision('MN', 'M')}
          {renderDivision('MN', 'F')}
        </View>
      )}
    </View>
  );
};

export default ListaCategorias;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#143E42',
    textAlign: 'center',
    marginBottom: 20,
  },
  divisionButton: {
    backgroundColor: '#507788',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divisionButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  divisionCategorias: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoriasColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  categoriasColumnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 10,
    textAlign: 'center',
  },
  categoriaItemMan: {
    backgroundColor: '#12475E',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  categoriaItemWomen: {
    backgroundColor: '#32936C',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  categoriaText: {
    color: '#fff',
    fontSize: 16,
  },
});
