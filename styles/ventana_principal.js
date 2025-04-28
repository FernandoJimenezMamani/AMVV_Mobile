import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainScrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  horizontalList: {
    paddingHorizontal: width * 0.075,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    elevation: 3,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#3D8FA4',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  tablaButton: {
    backgroundColor: '#3D8FA4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  tablaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 15,
    textAlign: 'center', // 👈 Añadimos esto
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  matchCardLarge: {
    width: width * 0.85,
    backgroundColor: '#3D8FA4',
    borderRadius: 15,
    marginRight: 10,
    padding: 20,
    elevation: 5,
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  matchStatus: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  matchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    alignItems: 'center',
    width: '40%',
  },
  teamLogoLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: 10,
  },
  teamNameLarge: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  vsContainer: {
    width: '20%',
    alignItems: 'center',
  },
  vsText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  matchFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultContainer: {
    marginBottom: 10,
  },
  walkoverText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  matchDate: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  matchTime: {
    color: 'white',
    fontSize: 14,
  },
  matchCardSmall: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    marginBottom: 15,
    marginVertical: 8,
    marginHorizontal: '10%',
  },
  smallMatchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallMatchResult: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3D8FA4',
    textAlign: 'center',
    marginBottom: 5,
  }, 
  smallMatchPending: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f39c12',
    textAlign: 'center',
    marginBottom: 5,
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginRight: 5,
    animation: 'pulse 1.5s infinite',
  },
  liveText: {
    color: 'red',
    fontWeight: 'bold',
  },
  smallTeamContainer: {
    alignItems: 'center',
    width: '40%',
  },
  teamLogoSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  teamNameSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  vsTextSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3D8FA4',
  },
  smallMatchFooter: {
    alignItems: 'center',
  },
  smallMatchDate: {
    fontSize: 12,
    color: '#555',
  },
  smallMatchTime: {
    fontSize: 12,
    color: '#555',
  },
  gridContainer: {
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
    elevation: 2,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sectionContainer2: {
    marginTop: 10,
    paddingHorizontal: 10,
    flex: 1,
  },
  filterToggleButton: {
    backgroundColor: '#3D8FA4',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  filterToggleText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  loadMoreButton: {
    backgroundColor: '#3D8FA4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 50,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  goToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#6CB4C8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  
  goToTopText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  
});

export default styles;