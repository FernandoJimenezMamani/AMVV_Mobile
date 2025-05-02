import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('MY');
  const { id: campeonatoId } = useLocalSearchParams();
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
      console.log(campeonatoId, categoriaId);
    router.push({
      pathname: "/partidos/indice_partidos",
      params: { 
        campeonatoId: campeonatoId,
        categoriaId: categoriaId 
      }
    });
  };

  const handleBack = () => {
    router.push('/campeonato');
  };

  const renderGenderIcon = (genero) => {
    return genero === 'V' ? (
      <FontAwesome5 name="male" size={20} color="white" />
    ) : (
      <FontAwesome5 name="female" size={20} color="white" />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#143E42" />
        </TouchableOpacity>
        <Text style={styles.title}>Seleccione una Categoría</Text>
      </View>

      <TouchableOpacity
        style={styles.divisionButton}
        onPress={() => handleDivisionClick('MY')}
      >
        <Text style={styles.divisionButtonText}>Mayores</Text>
      </TouchableOpacity>

      {selectedDivision === 'MY' && (
        <View style={styles.divisionContainer}>
          <View style={styles.genderColumn}>
            <View style={styles.genderHeader}>
              <Text style={styles.genderTitle}>Varones</Text>
              <FontAwesome5 name="male" size={20} color="#143E42" />
            </View>
            {filterCategorias('MY', 'V').map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={styles.categoriaItemMan}
                onPress={() => handleCategorySelect(categoria.id)}
              >
                <Text style={styles.categoriaText}>{categoria.nombre}</Text>
                <MaterialIcons name="sports-volleyball" size={20} color="white" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.genderColumn}>
            <View style={styles.genderHeader}>
              <Text style={styles.genderTitle}>Damas</Text>
              <FontAwesome5 name="female" size={20} color="#143E42" />
            </View>
            {filterCategorias('MY', 'D').map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={styles.categoriaItemWomen}
                onPress={() => handleCategorySelect(categoria.id)}
              >
                <Text style={styles.categoriaText}>{categoria.nombre}</Text>
                <MaterialIcons name="sports-volleyball" size={20} color="white" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.divisionButton}
        onPress={() => handleDivisionClick('MN')}
      >
        <Text style={styles.divisionButtonText}>Menores</Text>
      </TouchableOpacity>

      {selectedDivision === 'MN' && (
        <View style={styles.divisionContainer}>
          <View style={styles.genderColumn}>
            <View style={styles.genderHeader}>
              <Text style={styles.genderTitle}>Varones</Text>
              <FontAwesome5 name="male" size={20} color="#143E42" />
            </View>
            {filterCategorias('MN', 'V').map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={styles.categoriaItemMan}
                onPress={() => handleCategorySelect(categoria.id)}
              >
                <Text style={styles.categoriaText}>{categoria.nombre}</Text>
                <MaterialIcons name="sports-volleyball" size={20} color="white" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.genderColumn}>
            <View style={styles.genderHeader}>
              <Text style={styles.genderTitle}>Damas</Text>
              <FontAwesome5 name="female" size={20} color="#143E42" />
            </View>
            {filterCategorias('MN', 'D').map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={styles.categoriaItemWomen}
                onPress={() => handleCategorySelect(categoria.id)}
              >
                <Text style={styles.categoriaText}>{categoria.nombre}</Text>
                <MaterialIcons name="sports-volleyball" size={20} color="white" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
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
    padding: 15,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#143E42',
    flex: 1,
    textAlign: 'center',
  },
  divisionButton: {
    backgroundColor: '#507788',
    padding: 15,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  divisionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divisionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  genderColumn: {
    width: '48%',
  },
  genderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  genderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143E42',
    marginRight: 5,
  },
  categoriaItemMan: {
    backgroundColor: '#12475E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  categoriaItemWomen: {
    backgroundColor: '#32936C',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  categoriaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ListaCategorias;