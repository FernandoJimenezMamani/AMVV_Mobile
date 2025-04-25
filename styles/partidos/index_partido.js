import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0f2f5',
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
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
      backgroundColor: '#f0f2f5',
    },
    actionButton: {
      backgroundColor: '#3D8FA4',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      width: '45%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    pickerWrapper: {
      width: '48%',
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#f8f8f8',
    },
    picker: {
      height: 48,
      width: '100%',
      color: '#143E42',
    },
    pickerItem: {
      fontSize: 14,
      color: '#143E42',
    },
    filterLabel: {
      fontSize: 12,
      color: '#666',
      marginBottom: 5,
      fontWeight: 'bold',
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 10,
    },
    groupContainer: {
      marginBottom: 20,
    },
    groupTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#143E42',
      marginBottom: 10,
      paddingLeft: 10,
      borderLeftWidth: 3,
      borderLeftColor: '#3D8FA4',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    liveIndicator: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: '#00e676',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    estadoIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    pendiente: {
      color: 'gray',
    },
    alerta: {
      color: 'orange',
    },
    finalizado: {
      color: 'green',
    },
    teamContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    team: {
      alignItems: 'center',
      width: '40%',
    },
    teamLogo: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginBottom: 5,
      backgroundColor: '#ddd',
    },
    teamName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
    },
    vsText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#666',
    },
    resultContainer: {
      marginVertical: 5,
      padding: 5,
      backgroundColor: '#f8f8f8',
      borderRadius: 5,
    },
    walkoverText: {
      fontSize: 14,
      color: '#d9534f',
      textAlign: 'center',
    },
    scoreText: {
      fontSize: 14,
      color: '#333',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    infoContainer: {
      marginTop: 5,
    },
    infoText: {
      fontSize: 12,
      color: '#666',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#666',
    },
  });
  
export default styles;