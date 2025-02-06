import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, ScrollView, Button } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const SubmitResultados = () => {
    const params = useLocalSearchParams();
    const { partidoId, campeonatoId, categoriaId } = params;
  const [walkover, setWalkover] = useState('null');
  const [localSets, setLocalSets] = useState({ set1: '', set2: '', set3: '' });
  const [visitanteSets, setVisitanteSets] = useState({ set1: '', set2: '', set3: '' });
  const [equipoLocal, setEquipoLocal] = useState(null);
  const [equipoVisitante, setEquipoVisitante] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [tipoTarjeta, setTipoTarjeta] = useState('');
  const [tarjetas, setTarjetas] = useState([]);
  const [showSet3, setShowSet3] = useState(false);
  const [imagenPlanilla, setImagenPlanilla] = useState(null);
  const [resultadoLocal, setResultadoLocal] = useState('P');
  const [resultadoVisitante, setResultadoVisitante] = useState('P');
  const router = useRouter();
  


  useEffect(() => {
    const fetchEquiposYJugadores = async () => {
      try {
        const equiposResponse = await axios.get(`${API_BASE_URL}/equipo/get_equipoByPartido/${partidoId}`);
        const equipos = equiposResponse.data;

        if (equipos.length === 2) {
          setEquipoLocal(equipos[0]);
          setEquipoVisitante(equipos[1]);
          const equipoIdSeleccionado = equipoSeleccionado || equipos[0].equipo_id;
          setEquipoSeleccionado(equipoIdSeleccionado);

          const jugadoresResponse = await axios.get(`${API_BASE_URL}/jugador/getJugadoresByEquipo/${equipoIdSeleccionado}`);
          setJugadores(jugadoresResponse.data);
        }
      } catch (error) {
        console.error('Error al obtener los equipos y jugadores:', error);
      }
    };

    fetchEquiposYJugadores();
  }, [partidoId, equipoSeleccionado]);

  const handleWalkoverChange = (value) => {
    setWalkover(value);
    
    if (value === 'L') {
      // Equipo local pierde, equipo visitante gana
      setResultadoLocal('P');
      setResultadoVisitante('G');
      setLocalSets({ set1: 0, set2: 0, set3: 0 });
      setVisitanteSets({ set1: 25, set2: 25, set3: 0 });
    } else if (value === 'V') {
      // Equipo visitante pierde, equipo local gana
      setResultadoLocal('G');
      setResultadoVisitante('P');
      setLocalSets({ set1: 25, set2: 25, set3: 0 });
      setVisitanteSets({ set1: 0, set2: 0, set3: 0 });
    } else if (value === 'both') {
      // Ambos equipos pierden
      setResultadoLocal('P');
      setResultadoVisitante('P');
      setLocalSets({ set1: 0, set2: 0, set3: 0 });
      setVisitanteSets({ set1: 0, set2: 0, set3: 0 });
    } else {
      setLocalSets({ set1: '', set2: '', set3: '' });
      setVisitanteSets({ set1: '', set2: '', set3: '' });
      setShowSet3(true);
    }
  };
  

  const handleInputChange = (value, setFunction, setName) => {
    if (value === '') {
      setFunction((prev) => ({ ...prev, [setName]: '' }));
      return;
    }

    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setFunction((prev) => ({ ...prev, [setName]: parsedValue }));
    }
  };

  const handleInputBlur = (setName) => {
    validateSetResultOnBlur();
  };

  const validateAllSets = () => {
    return (
      validateSetResult('set1') &&
      validateSetResult('set2') &&
      (showSet3 ? validateSetResult('set3') : true)
    );
  };

  const validateSetResult = (setName) => {
    const localScore = localSets[setName];
    const visitanteScore = visitanteSets[setName];
    const isThirdSet = setName === 'set3';
    const winningScore = isThirdSet ? 15 : 25;

    if (localScore >= winningScore || visitanteScore >= winningScore) {
      const difference = Math.abs(localScore - visitanteScore);
      if (difference < 2) {
        Alert.alert(
          'Advertencia',
          `La diferencia de puntos debe ser de al menos 2 cuando uno de los equipos tiene ${winningScore} puntos o más en el ${isThirdSet ? 'tercer set' : 'set'}.`
        );
        return false;
      }
    } else {
      if (Math.min(localScore, visitanteScore) < (isThirdSet ? 14 : 24)) {
        Alert.alert(
          'Advertencia',
          `Uno de los equipos debe tener al menos ${winningScore} puntos para ganar el ${isThirdSet ? 'tercer set' : 'set'}.`
        );
        return false;
      }
    }

    return true;
  };

  const validateSetResultOnBlur = () => {
    const localScores = [localSets.set1, localSets.set2, localSets.set3].map(Number);
    const visitanteScores = [visitanteSets.set1, visitanteSets.set2, visitanteSets.set3].map(Number);
  
    let localWins = 0;
    let visitanteWins = 0;
  
    // Calcular los sets ganados por cada equipo
    for (let i = 0; i < 3; i++) {
      if (localScores[i] > visitanteScores[i]) {
        localWins++;
      } else if (visitanteScores[i] > localScores[i]) {
        visitanteWins++;
      }
    }
  
    // Determinar el ganador y el perdedor
    if (localWins > visitanteWins) {
      setResultadoLocal('G');
      setResultadoVisitante('P');
    } else if (visitanteWins > localWins) {
      setResultadoLocal('P');
      setResultadoVisitante('G');
    }
  };
  

  const handleImageChange = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Esto habilita la opción de recorte
        aspect: [4, 3], // Aspecto de recorte, ajusta según tus necesidades
        quality: 1,
      });
  
      // Verifica si el usuario seleccionó una imagen y no canceló la acción
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagenPlanilla(result.assets[0].uri); // Guarda la URI de la imagen seleccionada
      } else {
        console.log('Selección de imagen cancelada o sin resultados.');
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      Alert.alert('Error', 'Hubo un problema al seleccionar la imagen.');
    }
  };
  

  const handleAgregarTarjeta = () => {
    const jugador = jugadores.find((j) => j.jugador_id === parseInt(jugadorSeleccionado));
    const equipo = [equipoLocal, equipoVisitante].find((e) => e.equipo_id === parseInt(equipoSeleccionado));
  
    if (!jugador || !equipo) {
      Alert.alert('Error', 'Seleccione un equipo y un jugador');
      return;
    }
  
    const nuevaTarjeta = {
      equipoId: equipoSeleccionado,
      equipoNombre: equipo.equipo_nombre,
      jugadorId: jugadorSeleccionado,
      jugadorNombre: `${jugador.nombre_persona} ${jugador.apellido_persona}`,
      tipoTarjeta,
    };
  
    setTarjetas([...tarjetas, nuevaTarjeta]);
    setEquipoSeleccionado(null);
    setJugadorSeleccionado(null);
    setTipoTarjeta('');
    setShowModal(false);
  };
  

  const handleSubmit = async () => {
    // Determinar resultados en función del walkover.
    if (walkover === 'L') {
      setResultadoLocal('P');
      setResultadoVisitante('G');
      setLocalSets({ set1: 0, set2: 0, set3: 0 });
      setVisitanteSets({ set1: 25, set2: 25, set3: '' });
    } else if (walkover === 'V') {
      setResultadoLocal('G');
      setResultadoVisitante('P');
      setLocalSets({ set1: 25, set2: 25, set3: '' });
      setVisitanteSets({ set1: 0, set2: 0, set3: 0 });
    } else if (walkover === 'both') {
      // Ambos equipos pierden.
      setResultadoLocal('P');
      setResultadoVisitante('P');
      setLocalSets({ set1: 0, set2: 0, set3: 0 });
      setVisitanteSets({ set1: 0, set2: 0, set3: 0 });
    }
  
    if (!validateAllSets()) {
      Alert.alert('Error', 'Verifica los resultados antes de enviar');
      return;
    }
  
    const formData = new FormData();
    formData.append('partido_id', partidoId);
    formData.append('walkover', walkover === 'null' ? '' : walkover);
    formData.append('resultadoLocal', JSON.stringify({
      ...localSets,
      resultado: resultadoLocal,
    }));
    formData.append('resultadoVisitante', JSON.stringify({
      ...visitanteSets,
      resultado: resultadoVisitante,
    }));
    formData.append('tarjetas', JSON.stringify(tarjetas));
  
    if (imagenPlanilla) {
      formData.append('imagenPlanilla', {
        uri: imagenPlanilla,
        name: 'planilla.jpg',
        type: 'image/jpeg',
      });
    }
  
    try {
      const response = await axios.post(`${API_BASE_URL}/partidos/submitResultados`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 201) {
        Alert.alert('Éxito', 'Registrado con éxito');
        router.push(`/partidos/indice/${campeonatoId}/${categoriaId}`);
      } else {
        Alert.alert('Error', `Error durante el registro: ${response.status} - ${response.data?.message || 'Sin mensaje de error'}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.statusText || error.message;
      Alert.alert('Error', `Error al enviar los resultados: ${errorMessage}`);
      console.error('Detalles completos del error:', error);
    }
  };
  
  
  
  
  

  const renderTeamInfo = (team, isLocal) => (
    <View style={styles.teamContainer}>
     
      <Text style={styles.teamName}>{team.equipo_nombre}</Text>
      {renderSetInput('set1', isLocal ? setLocalSets : setVisitanteSets, isLocal ? localSets.set1 : visitanteSets.set1)}
      {renderSetInput('set2', isLocal ? setLocalSets : setVisitanteSets, isLocal ? localSets.set2 : visitanteSets.set2)}
      {showSet3 && renderSetInput('set3', isLocal ? setLocalSets : setVisitanteSets, isLocal ? localSets.set3 : visitanteSets.set3)}
    </View>
  );

  const renderSetInput = (setName, setFunction, value) => (
    <TextInput
      style={styles.input}
      placeholder={`Set ${setName}`}
      keyboardType="number-pad"
      value={value !== null && value !== undefined ? value.toString() : ''}
      onChangeText={(text) => handleInputChange(text, setFunction, setName)}
      onBlur={() => handleInputBlur(setName)}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Resultados del Partido</Text>
      <View style={styles.radioGroup}>
        {['L', 'V', 'both', 'null'].map((value) => (
          <TouchableOpacity key={value} style={styles.radioButton} onPress={() => handleWalkoverChange(value)}>
            <Text style={styles.radioButtonText}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {equipoLocal && renderTeamInfo(equipoLocal, true)}
      {equipoVisitante && renderTeamInfo(equipoVisitante, false)}
      <Button title="Subir Imagen de la Planilla" onPress={handleImageChange} />
      {imagenPlanilla && (
        <Image source={{ uri: imagenPlanilla }} style={styles.imagePreview} />
        )}
      <TouchableOpacity style={styles.openModalButton} onPress={() => setShowModal(true)}>
        <Text style={styles.openModalButtonText}>Registrar Tarjetas</Text>
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Registrar Tarjeta</Text>
            <Picker
              selectedValue={equipoSeleccionado}
              onValueChange={(itemValue) => setEquipoSeleccionado(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un equipo" value="" />
              {equipoLocal && <Picker.Item label={equipoLocal.equipo_nombre} value={equipoLocal.equipo_id} />}
              {equipoVisitante && <Picker.Item label={equipoVisitante.equipo_nombre} value={equipoVisitante.equipo_id} />}
            </Picker>
            {equipoSeleccionado && (
              <Picker
                selectedValue={jugadorSeleccionado}
                onValueChange={(itemValue) => setJugadorSeleccionado(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione un jugador" value="" />
                {jugadores.map((jugador) => (
                  <Picker.Item
                    key={jugador.jugador_id}
                    label={`${jugador.nombre_persona} ${jugador.apellido_persona}`}
                    value={jugador.jugador_id}
                  />
                ))}
              </Picker>
            )}
            {jugadorSeleccionado && (
              <Picker
                selectedValue={tipoTarjeta}
                onValueChange={(itemValue) => setTipoTarjeta(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione el tipo de tarjeta" value="" />
                <Picker.Item label="Roja" value="roja" />
                <Picker.Item label="Amarilla" value="amarilla" />
              </Picker>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAgregarTarjeta}
              disabled={!equipoSeleccionado || !jugadorSeleccionado || !tipoTarjeta}
            >
              <Text style={styles.modalButtonText}>Agregar Tarjeta</Text>
            </TouchableOpacity>
            <Button title="Cerrar" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
      {tarjetas.length > 0 && (
        <View style={styles.tarjetasContainer}>
          <Text style={styles.tarjetasTitle}>Tarjetas Registradas</Text>
          {tarjetas.map((tarjeta, index) => (
            <Text key={index} style={styles.tarjetaItem}>
              {tarjeta.equipoNombre} - {tarjeta.jugadorNombre} - {tarjeta.tipoTarjeta}
            </Text>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Enviar Resultados</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SubmitResultados;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 20,
    textAlign: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioButton: {
    backgroundColor: '#507788',
    padding: 10,
    borderRadius: 5,
  },
  radioButtonText: {
    color: '#fff',
  },
  teamContainer: {
    marginBottom: 20,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginTop: 10,
  },
  openModalButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  openModalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  tarjetasContainer: {
    marginTop: 20,
  },
  tarjetasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tarjetaItem: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f9f9f9', // Fondo claro para asegurarse de que el texto sea visible
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
    marginVertical: 10,
  },
});

