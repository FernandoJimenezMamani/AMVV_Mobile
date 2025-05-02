import { StyleSheet } from 'react-native';

const colors = {
  primary: '#2c3e50',
  secondary: '#34495e',
  background: '#fff',
  lightBackground: '#f8f9fa',
  success: '#4CAF50',
  error: '#F44336',
  warning: 'orange',
  info: '#3D8FA4',
  border: '#ccc',
  divider: '#ddd',
};

const textStyles = {
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.primary,
  },
  regular: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.secondary,
  },
  bold: {
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 16,
    color: colors.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: colors.primary,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: textStyles.title,
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.lightBackground,
    padding: 12,
    borderRadius: 8,
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
  textContainer: {
    flex: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 12,
  },
  subtitle: textStyles.subtitle,
  text: textStyles.regular,
  bold: textStyles.bold,
  paragraph: textStyles.paragraph,
  sectionTitle: textStyles.sectionTitle,
  estadoContainer: {
    backgroundColor: colors.lightBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  estadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  estadoItemLast: {
    borderBottomWidth: 0,
  },
  estadoLabel: {
    ...textStyles.regular,
    flex: 1,
  },
  estadoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 14,
    marginLeft: 8,
  },
  estadoPENDIENTE: {
    color: colors.warning,
  },
  estadoAPROBADO: {
    color: colors.success,
  },
  estadoRECHAZADO: {
    color: colors.error,
  },
  pagoContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    flexWrap: 'wrap',
  },
  boton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  botonAceptar: {
    backgroundColor: colors.success,
  },
  botonRechazar: {
    backgroundColor: colors.error,
  },
  botonTexto: {
    color: colors.background,
    fontWeight: 'bold',
  },
  estadoIconoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: colors.info,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default styles;