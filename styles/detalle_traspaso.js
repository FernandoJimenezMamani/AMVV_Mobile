import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: '#2c3e50',
    },
    clubInfo: {
      backgroundColor: '#ecf0f1',
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#2c3e50',
    },
    bold: {
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    text: {
      fontSize: 16,
      color: '#34495e',
      marginBottom: 10,
      lineHeight: 24,
    },
    estadoSolicitud: {
      marginTop: 20,
    },
    botones: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
    },
    botonAceptar: {
      backgroundColor: '#3D8FA4',
      padding: 10,
      borderRadius: 5,
    },
    botonRechazar: {
      backgroundColor: '#D9392F',
      padding: 10,
      borderRadius: 5,
    },
    botonTexto: {
      color: '#fff',
      fontSize: 16,
    },
    iconoEstado: {
      alignItems: 'center',
    },
  });