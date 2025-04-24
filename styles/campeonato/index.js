import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0f2f5',
      padding: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#143E42',
      marginBottom: 20,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    listContent: {
      paddingBottom: 20,
    },
    campeonatoCard: {
      backgroundColor: '#507788',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    estadoContainer: {
      position: 'absolute',
      top: 10,
      right: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
    },
    punto: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 5,
      backgroundColor: 'white',
    },
    estadoText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    estadoPreparacion: {
      backgroundColor: '#3061e9',
      borderColor: '#3061e9',
    },
    estadoEnCurso: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    },
    estadoEnEspera: {
      backgroundColor: '#848584',
      borderColor: '#848584',
    },
    estadoFinalizado: {
      backgroundColor: '#D9534F',
      borderColor: '#D9534F',
    },
    estadoDesconocido: {
      backgroundColor: '#333',
      borderColor: '#333',
    },
    campeonatoNombre: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 10,
      marginTop: 10,
    },
    campeonatoText: {
      fontSize: 14,
      color: 'white',
      marginBottom: 5,
      lineHeight: 20,
    },
    boldText: {
      fontWeight: 'bold',
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 15,
      gap: 10,
    },
    button: {
      padding: 10,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      width: 40,
      height: 40,
    },
    viewButton: {
      backgroundColor: '#3D8FA4',
    },
    deleteButton: {
      backgroundColor: '#D9534F',
    },
    fechasButton: {
      backgroundColor: '#57a664',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#143E42',
      marginBottom: 15,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#D9534F',
      borderRadius: 5,
      padding: 5,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    fechasScroll: {
      maxHeight: '80%',
    },
    fechaItem: {
      backgroundColor: '#eef2f7',
      borderRadius: 5,
      padding: 12,
      marginVertical: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fechaText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    pdfButton: {
      backgroundColor: '#D9534F',
      borderRadius: 5,
      padding: 5,
    },
    confirmModalContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      width: '80%',
    },
    confirmText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
    },
    confirmButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    confirmButton: {
      padding: 10,
      borderRadius: 5,
      width: '40%',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#6c757d',
    },
    deleteConfirmButton: {
      backgroundColor: '#D9534F',
    },
    confirmButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });
  
export default styles;