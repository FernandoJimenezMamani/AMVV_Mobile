# AMVV Mobile (React Native + Expo)

## 🚨 Importante: Usar Build de Desarrollo
Para funcionalidades nativas (notificaciones, cámara, GPS) DEBES usar un build precompilado:

## Desarrollo Normal 
npm install
npx expo start --dev-client

# Crear build para desarrollo
npx eas build --profile development --platform android

# Instalar .apk en tu teléfono
# Luego ejecutar:
npx expo start --dev-client