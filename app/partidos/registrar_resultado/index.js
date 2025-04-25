import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import estadosPartidoCampMapping from '../../../constants/estado_partido';
import Club_defecto from '../../../assets/img/Default_Imagen_Club.webp';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const SubmitResultados = () => {
  const route = useRouter();
  const { partidoId, campeonatoId, categoriaId } = useLocalSearchParams();
  const navigation = useRouter();
  const cameraRef = useRef(null);
  
  // Estados principales
  const [walkover, setWalkover] = useState("null");
  const [localSets, setLocalSets] = useState({ set1: "", set2: "", set3: "" });
  const [visitanteSets, setVisitanteSets] = useState({ set1: "", set2: "", set3: "" });
  const [equipoLocal, setEquipoLocal] = useState(null);
  const [equipoVisitante, setEquipoVisitante] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [tipoTarjeta, setTipoTarjeta] = useState("");
  const [tarjetas, setTarjetas] = useState([]);
  const [imagenPlanilla, setImagenPlanilla] = useState(null);
  const [imagenPlanillaURL, setImagenPlanillaURL] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [partido, setPartido] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para la cámara
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraType, setCameraType] = useState(null);
  const [flashMode, setFlashMode] = useState(null);

  const [cameraVisible, setCameraVisible] = useState(false);
const [facing, setFacing] = useState<CameraType>('back');
const [permission, requestPermission] = useCameraPermissions() ?? {};


  // Obtener datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener equipos
        const equiposRes = await fetch(`${API_BASE_URL}/equipo/get_equipoByPartido/${partidoId}`);
        const equipos = await equiposRes.json();
        
        if (equipos.length === 2) {
          setEquipoLocal(equipos[0]);
          setEquipoVisitante(equipos[1]);
          setEquipoSeleccionado(equipos[0].equipo_id);
        }

        // Obtener partido
        const partidoRes = await fetch(`${API_BASE_URL}/partidos/get_partido_completo/${partidoId}`);
        const partidoData = await partidoRes.json();
        setPartido(partidoData);

        // Obtener resultados previos
        const resultadosRes = await fetch(`${API_BASE_URL}/partidos/resultados/${partidoId}`);
        const resultadosData = await resultadosRes.json();
        
        if (resultadosData.resultadoLocal?.walkover) {
          setWalkover(resultadosData.resultadoLocal.walkover);
        } else if (resultadosData.resultadoVisitante?.walkover) {
          setWalkover(resultadosData.resultadoVisitante.walkover);
        }

        if (resultadosData.resultadoLocal) {
          setLocalSets({
            set1: resultadosData.resultadoLocal.set1 ?? "",
            set2: resultadosData.resultadoLocal.set2 ?? "",
            set3: resultadosData.resultadoLocal.set3 ?? "",
          });
        }

        if (resultadosData.resultadoVisitante) {
          setVisitanteSets({
            set1: resultadosData.resultadoVisitante.set1 ?? "",
            set2: resultadosData.resultadoVisitante.set2 ?? "",
            set3: resultadosData.resultadoVisitante.set3 ?? "",
          });
        }

        if (Array.isArray(resultadosData.tarjetas)) {
          setTarjetas(resultadosData.tarjetas.map(t => ({
            equipoNombre: t.equipo,
            jugadorNombre: t.jugador,
            jugadorId: t.jugador_tarjeta_id,
            tipoTarjeta: t.tipo_tarjeta,
            equipoId: t.equipoId,
          })));
        }

        if (resultadosData.imagenPlanilla) {
          setImagenPlanillaURL(resultadosData.imagenPlanilla);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
        Alert.alert("Error", "No se pudieron cargar los datos del partido");
      }
    };

    fetchData();
  }, [partidoId]);

  // Obtener jugadores cuando cambia el equipo seleccionado
  useEffect(() => {
    const fetchJugadores = async () => {
      if (!equipoSeleccionado || !campeonatoId) return;
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/partidos/get_jugadores/${equipoSeleccionado}/campeonato/${campeonatoId}`
        );
        const data = await response.json();
        setJugadores(data);
      } catch (error) {
        console.error("Error al obtener jugadores:", error);
      }
    };

    fetchJugadores();
  }, [equipoSeleccionado, campeonatoId]);

  // Manejar cambios en walkover
  useEffect(() => {
    if (walkover === "L") {
      setLocalSets({ set1: 0, set2: 0, set3: 0 });
      setVisitanteSets({ set1: 25, set2: 25, set3: 0 });
    } else if (walkover === "V") {
      setLocalSets({ set1: 25, set2: 25, set3: 0 });
      setVisitanteSets({ set1: 0, set2: 0, set3: 0 });
    } else if (walkover === "both") {
      setLocalSets({ set1: 0, set2: 0, set3: 0 });
      setVisitanteSets({ set1: 0, set2: 0, set3: 0 });
    } else {
      setLocalSets({ set1: "", set2: "", set3: "" });
      setVisitanteSets({ set1: "", set2: "", set3: "" });
    }
  }, [walkover]);

  // Funciones para manejar imágenes
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
          skipProcessing: true,
        });

        // Recortar la imagen
        const croppedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ crop: { originX: 0, originY: 0, width: photo.width, height: photo.height } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        setImagenPlanilla({
          uri: croppedImage.uri,
          name: 'planilla.jpg',
          type: 'image/jpeg',
        });
        setImagenPlanillaURL(croppedImage.uri);
        setShowCamera(false);
      } catch (error) {
        console.error("Error al tomar foto:", error);
        Alert.alert("Error", "No se pudo tomar la foto");
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.cancelled) {
        // Recortar la imagen
        const croppedImage = await ImageManipulator.manipulateAsync(
          result.uri,
          [{ crop: { originX: 0, originY: 0, width: result.width, height: result.height } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        setImagenPlanilla({
          uri: croppedImage.uri,
          name: 'planilla.jpg',
          type: 'image/jpeg',
        });
        setImagenPlanillaURL(croppedImage.uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Seleccionar imagen",
      "¿Cómo deseas obtener la imagen de la planilla?",
      [
        {
          text: "Tomar foto",
          onPress: () => setCameraVisible(true),
        },
        {
          text: "Elegir de galería",
          onPress: pickImage,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  // Validación de sets
  const validarOrdenSets = () => {
    const s1L = localSets.set1;
    const s2L = localSets.set2;
    const s3L = localSets.set3;
    const s1V = visitanteSets.set1;
    const s2V = visitanteSets.set2;
    const s3V = visitanteSets.set3;
  
    const vacio = (val) => val === '' || val === null || val === undefined;
  
    const set1Vacio = vacio(s1L) || vacio(s1V);
    const set2Llenado = !vacio(s2L) || !vacio(s2V);
    const set2Vacio = vacio(s2L) || vacio(s2V);
    const set3Llenado = !vacio(s3L) || !vacio(s3V);
  
    if (set1Vacio && (set2Llenado || set3Llenado)) {
      Alert.alert("Advertencia", "Debes registrar el Set 1 antes que el Set 2 o Set 3");
      return false;
    }
  
    if (set2Vacio && set3Llenado) {
      Alert.alert("Advertencia", "Debes registrar el Set 2 antes que el Set 3");
      return false;
    }
  
    return true;
  };

  // Manejar envío de resultados
  const handleSubmit = async () => {
    if (!validarOrdenSets()) return;

    if (!imagenPlanilla && !imagenPlanillaURL) {
      Alert.alert("Error", "Debes subir una imagen de la planilla antes de enviar");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("partido_id", partidoId);
    formData.append("walkover", walkover === "null" ? "" : walkover);
    formData.append("resultadoLocal", JSON.stringify({
      set1: localSets.set1,
      set2: localSets.set2,
      set3: localSets.set3,
      resultado: walkover === "V" ? "G" : "P",
    }));
    formData.append("resultadoVisitante", JSON.stringify({
      set1: visitanteSets.set1,
      set2: visitanteSets.set2,
      set3: visitanteSets.set3,
      resultado: walkover === "L" ? "G" : "P",
    }));
    formData.append("tarjetas", JSON.stringify(tarjetas));

    if (imagenPlanilla) {
      formData.append("imagenPlanilla", {
        uri: imagenPlanilla.uri,
        name: 'planilla.jpg',
        type: 'image/jpeg',
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/partidos/submitResultados`, {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        Alert.alert("Éxito", "Resultados registrados correctamente");
        navigation.goBack();
      } else {
        Alert.alert("Error", result.message || "Error al registrar los resultados");
      }
    } catch (error) {
      console.error("Error al enviar los resultados:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar actualización parcial
  const handleActualizarParciales = async () => {
    if (!validarOrdenSets()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/partidos/updateParcialResultados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partido_id: partidoId,
          walkover: walkover === "null" ? "" : walkover,
          resultadoLocal: {
            set1: localSets.set1,
            set2: localSets.set2,
            set3: localSets.set3,
          },
          resultadoVisitante: {
            set1: visitanteSets.set1,
            set2: visitanteSets.set2,
            set3: visitanteSets.set3,
          },
          tarjetas,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Resultados parciales actualizados");
      } else {
        Alert.alert("Error", result.message || "Error al actualizar");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar tarjeta
  const handleAgregarTarjeta = () => {
    const jugador = jugadores.find(j => j.jugador_id === parseInt(jugadorSeleccionado));
    const equipo = [equipoLocal, equipoVisitante].find(e => e.equipo_id === parseInt(equipoSeleccionado));

    const yaExiste = tarjetas.some(t => 
      t.jugadorId === parseInt(jugadorSeleccionado) && 
      t.tipoTarjeta === tipoTarjeta
    );

    if (yaExiste) {
      Alert.alert("Advertencia", "Este jugador ya tiene registrada esa tarjeta");
      return;
    }

    const nuevaTarjeta = {
      equipoId: equipoSeleccionado,
      equipoNombre: equipo.equipo_nombre,
      jugadorId: jugadorSeleccionado,
      jugadorNombre: `${jugador.jugador_nombre} ${jugador.jugador_apellido}`,
      tipoTarjeta,
    };

    setTarjetas([...tarjetas, nuevaTarjeta]);
    setShowModal(false);
    setEquipoSeleccionado(null);
    setJugadorSeleccionado(null);
    setTipoTarjeta("");
  };

  // Eliminar tarjeta
  const handleEliminarTarjeta = (index) => {
    setTarjetas(tarjetas.filter((_, i) => i !== index));
  };

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No se tiene acceso a la cámara</Text>;
  }

  if (!equipoLocal || !equipoVisitante || !partido) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D8FA4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vista de la cámara */}
      {showCamera && cameraType !== null && flashMode !== null ? (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={cameraType}
            flashMode={flashMode}
            ref={cameraRef}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => {
                  if (Camera?.Constants) {
                    setCameraType(
                      cameraType === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back
                    );
                  }
                }}
              >
                <MaterialCommunityIcons name="camera-flip" size={30} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <MaterialCommunityIcons name="camera" size={40} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => {
                  if (Camera?.Constants) {
                    setFlashMode(
                      flashMode === Camera.Constants.FlashMode.off
                        ? Camera.Constants.FlashMode.on
                        : Camera.Constants.FlashMode.off
                    );
                  }
                }}
              >
                <MaterialCommunityIcons 
                  name={flashMode === Camera.Constants?.FlashMode?.off ? "flash-off" : "flash"} 
                  size={30} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.closeCameraButton}
              onPress={() => setShowCamera(false)}
            >
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
          </Camera>
        </View>
      ) : (
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#143E42" />
            </TouchableOpacity>
            <Text style={styles.title}>Registrar Resultados</Text>
          </View>

          {/* Walkover */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Walkover</Text>
            <View style={styles.radioGroup}>
              {[
                { value: "L", label: "Local" },
                { value: "V", label: "Visitante" },
                { value: "both", label: "Ambos" },
                { value: "null", label: "Ninguno" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radioOption,
                    walkover === option.value && styles.radioOptionSelected,
                  ]}
                  onPress={() => setWalkover(option.value)}
                >
                  <Text style={walkover === option.value ? styles.radioTextSelected : styles.radioText}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Equipos y sets */}
          <View style={styles.teamsContainer}>
            {/* Equipo local */}
            <View style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Image 
                  source={equipoLocal.club_imagen ? { uri: equipoLocal.club_imagen } : Club_defecto} 
                  style={styles.teamLogo} 
                />
                <Text style={styles.teamName}>{equipoLocal.equipo_nombre}</Text>
              </View>

              <View style={styles.setsContainer}>
                <TextInput
                  style={styles.setInput}
                  placeholder="Set 1"
                  value={localSets.set1.toString()}
                  onChangeText={(text) => setLocalSets({...localSets, set1: text})}
                  keyboardType="numeric"
                  editable={walkover === "null"}
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="Set 2"
                  value={localSets.set2.toString()}
                  onChangeText={(text) => setLocalSets({...localSets, set2: text})}
                  keyboardType="numeric"
                  editable={walkover === "null"}
                />
                {walkover !== "L" && walkover !== "V" && (
                  <TextInput
                    style={styles.setInput}
                    placeholder="Set 3"
                    value={localSets.set3.toString()}
                    onChangeText={(text) => setLocalSets({...localSets, set3: text})}
                    keyboardType="numeric"
                    editable={walkover === "null"}
                  />
                )}
              </View>
            </View>

            {/* Equipo visitante */}
            <View style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Image 
                  source={equipoVisitante.club_imagen ? { uri: equipoVisitante.club_imagen } : Club_defecto} 
                  style={styles.teamLogo} 
                />
                <Text style={styles.teamName}>{equipoVisitante.equipo_nombre}</Text>
              </View>

              <View style={styles.setsContainer}>
                <TextInput
                  style={styles.setInput}
                  placeholder="Set 1"
                  value={visitanteSets.set1.toString()}
                  onChangeText={(text) => setVisitanteSets({...visitanteSets, set1: text})}
                  keyboardType="numeric"
                  editable={walkover === "null"}
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="Set 2"
                  value={visitanteSets.set2.toString()}
                  onChangeText={(text) => setVisitanteSets({...visitanteSets, set2: text})}
                  keyboardType="numeric"
                  editable={walkover === "null"}
                />
                {walkover !== "L" && walkover !== "V" && (
                  <TextInput
                    style={styles.setInput}
                    placeholder="Set 3"
                    value={visitanteSets.set3.toString()}
                    onChangeText={(text) => setVisitanteSets({...visitanteSets, set3: text})}
                    keyboardType="numeric"
                    editable={walkover === "null"}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Acciones */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowModal(true)}
            >
              <MaterialCommunityIcons name="cards" size={20} color="white" />
              <Text style={styles.actionButtonText}>Registrar Tarjetas</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={showImageOptions}
            >
              <MaterialCommunityIcons name="file-image" size={20} color="white" />
              <Text style={styles.actionButtonText}>Subir Planilla</Text>
            </TouchableOpacity>

            {imagenPlanillaURL && (
              <TouchableOpacity 
                style={styles.imagePreviewButton}
                onPress={() => setShowImageModal(true)}
              >
                <MaterialCommunityIcons name="eye" size={20} color="#3D8FA4" />
                <Text style={styles.imagePreviewText}>Ver Imagen</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tarjetas registradas */}
          {tarjetas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tarjetas Registradas</Text>
              {tarjetas.map((tarjeta, index) => (
                <View key={index} style={styles.tarjetaItem}>
                  <View style={styles.tarjetaInfo}>
                    <Text style={styles.tarjetaEquipo}>{tarjeta.equipoNombre}</Text>
                    <Text style={styles.tarjetaJugador}>{tarjeta.jugadorNombre}</Text>
                    <View style={[
                      styles.tarjetaTipo, 
                      tarjeta.tipoTarjeta === 'roja' ? styles.tarjetaRoja : styles.tarjetaAmarilla
                    ]} />
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteTarjetaButton}
                    onPress={() => handleEliminarTarjeta(index)}
                  >
                    <Icon name="close" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Botones de acción */}
          <View style={styles.submitButtons}>
            {partido.estado !== estadosPartidoCampMapping.Finalizado && (
              <TouchableOpacity 
                style={[styles.submitButton, styles.updateButton]}
                onPress={handleActualizarParciales}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Actualizar Parciales</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, styles.submitButtonPrimary]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {partido.estado === estadosPartidoCampMapping.Finalizado ? "Actualizar" : "Finalizar Partido"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Modal para agregar tarjetas */}
          <Modal
            visible={showModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Agregar Tarjeta</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Icon name="close" size={24} color="#dc3545" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Equipo</Text>
                    <Picker
                      selectedValue={equipoSeleccionado}
                      onValueChange={(itemValue) => setEquipoSeleccionado(itemValue)}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Seleccione un equipo" value={null} />
                      <Picker.Item 
                        label={equipoLocal.equipo_nombre} 
                        value={equipoLocal.equipo_id} 
                      />
                      <Picker.Item 
                        label={equipoVisitante.equipo_nombre} 
                        value={equipoVisitante.equipo_id} 
                      />
                    </Picker>
                  </View>

                  {equipoSeleccionado && (
                    <View style={styles.modalField}>
                      <Text style={styles.modalLabel}>Jugador</Text>
                      <Picker
                        selectedValue={jugadorSeleccionado}
                        onValueChange={(itemValue) => setJugadorSeleccionado(itemValue)}
                        style={styles.modalPicker}
                      >
                        <Picker.Item label="Seleccione un jugador" value={null} />
                        {jugadores.map((jugador) => (
                          <Picker.Item
                            key={jugador.jugador_id}
                            label={`${jugador.jugador_nombre} ${jugador.jugador_apellido}`}
                            value={jugador.jugador_id}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}

                  {jugadorSeleccionado && (
                    <View style={styles.modalField}>
                      <Text style={styles.modalLabel}>Tipo de Tarjeta</Text>
                      <Picker
                        selectedValue={tipoTarjeta}
                        onValueChange={(itemValue) => setTipoTarjeta(itemValue)}
                        style={styles.modalPicker}
                      >
                        <Picker.Item label="Seleccione tipo" value="" />
                        <Picker.Item label="Amarilla" value="amarilla" />
                        <Picker.Item label="Roja" value="roja" />
                      </Picker>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.modalAddButton,
                      (!equipoSeleccionado || !jugadorSeleccionado || !tipoTarjeta) && styles.modalAddButtonDisabled
                    ]}
                    onPress={handleAgregarTarjeta}
                    disabled={!equipoSeleccionado || !jugadorSeleccionado || !tipoTarjeta}
                  >
                    <Text style={styles.modalAddButtonText}>Agregar Tarjeta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para ver imagen */}
          <Modal
            visible={showImageModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowImageModal(false)}
          >
            <View style={styles.imageModalOverlay}>
              <View style={styles.imageModalContainer}>
                <TouchableOpacity 
                  style={styles.imageModalCloseButton}
                  onPress={() => setShowImageModal(false)}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
                <Image 
                  source={{ uri: imagenPlanillaURL }} 
                  style={styles.imageModalContent}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  radioOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    marginBottom: 10,
    minWidth: '48%',
    alignItems: 'center',
  },
  radioOptionSelected: {
    backgroundColor: '#3D8FA4',
  },
  radioText: {
    color: '#333',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  teamsContainer: {
    marginHorizontal: 10,
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  setsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setInput: {
    width: '30%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D8FA4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '48%',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  imagePreviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#3D8FA4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '48%',
    justifyContent: 'center',
  },
  imagePreviewText: {
    color: '#3D8FA4',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tarjetaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  tarjetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tarjetaEquipo: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  tarjetaJugador: {
    marginRight: 8,
  },
  tarjetaTipo: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  tarjetaRoja: {
    backgroundColor: '#dc3545',
  },
  tarjetaAmarilla: {
    backgroundColor: '#ffc107',
  },
  deleteTarjetaButton: {
    padding: 5,
  },
  submitButtons: {
    margin: 10,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  submitButtonPrimary: {
    backgroundColor: '#57a664',
  },
  updateButton: {
    backgroundColor: '#3D8FA4',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    padding: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143E42',
  },
  modalContent: {
    marginBottom: 15,
  },
  modalField: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  modalPicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  modalAddButton: {
    backgroundColor: '#3D8FA4',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  modalAddButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalAddButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    width: '90%',
    height: '80%',
    position: 'relative',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  imageModalContent: {
    width: '100%',
    height: '100%',
  },
});

export default SubmitResultados;