import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    width: '80%',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#143E42',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  loginButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleSelectionContainer: {
    alignItems: 'center',
  },
  roleSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143E42',
    marginBottom: 10,
  },
  roleSelect: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  homeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#143E42',
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
});
  export default styles;