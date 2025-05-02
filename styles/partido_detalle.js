import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#143E42',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  resultButton: {
    backgroundColor: '#3D8FA4',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    textAlign: 'center',
    justifyContent: 'center',
  },
  reprogramButton: {
    backgroundColor: '#9DAC42',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    textAlign: 'center',
    justifyContent: 'center',
    marginTop:20,
  },
  editButton: {
    backgroundColor: '#3D8FA4',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    marginRight: 5,
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoText: {
    marginBottom: 8,
    color: '#555',
  },
  boldText: {
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButton: {
    marginLeft: 10,
  },
  matchContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    padding: 8,
    borderRadius: 5,
  },
  finished: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  live: {
    backgroundColor: '#d4edda',
    color: '#155724',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcoming: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#28a745',
    marginRight: 8,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  teamName: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D8FA4',
    marginHorizontal: 10,
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8FA4',
    textAlign: 'center',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  scoreColumn: {
    flex: 1,
  },
  teamTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    flex: 1,
  },
  teamTitleV: {
    fontWeight: 'bold',
    marginBottom: 5,
    flex: 1,
    textAlign: 'right',
    
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 10,
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  playersColumn: {
    flex: 1,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    padding: 5,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  playerName: {
    flex: 1,
  },
  playerNameV:{
    flex: 1,
    textAlign: 'right'
  },
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: 5,
  },
  card: {
    width: 14,
    height: 22,
    borderRadius: 3,
    transform: [{ rotate: '-10deg' }],
    marginHorizontal: 3,
  },
  yellowCard: {
    backgroundColor: '#FFD700',
  },
  redCard: {
    backgroundColor: '#FF0000',
  },
  refereesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  refereeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '45%',
  },
  refereeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#143E42',
  },
  map: {
    width: '100%',
    height: '80%',
  },
  modalContent: {
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#3D8FA4',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  confirmModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  confirmModalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  liveTittle:{
    marginVertical: 120,
  },
});

export default styles;