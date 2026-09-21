/**
 * Configuración dinámica de Expo
 * Usa variables de entorno para proteger API keys y configurar diferentes entornos
 *
 * Variables de entorno (definir en .env o en EAS Secrets):
 * - GOOGLE_MAPS_API_KEY: API key de Google Maps
 * - API_BASE_URL: URL del backend (desarrollo/producción)
 * - APP_ENV: Entorno actual (development/staging/production)
 */

const IS_DEV = process.env.APP_ENV === 'development';
const IS_STAGING = process.env.APP_ENV === 'staging';
const IS_PROD = process.env.APP_ENV === 'production';

export default {
  expo: {
    name: 'AMY Delivery',
    slug: 'amy-delivery',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#2563eb'
    },

    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.amybusiness.delivery',
      deploymentTarget: '15.1',

      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'GOOGLE_MAPS_API_KEY_NOT_SET'
      },

      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'AMY Delivery necesita tu ubicación para rastrear entregas en tiempo real.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'AMY Delivery necesita tu ubicación en segundo plano para rastrear entregas.',
        NSCameraUsageDescription: 'AMY Delivery necesita acceso a la cámara para escanear etiquetas de cajas y tomar fotos de evidencia.',
        NSPhotoLibraryUsageDescription: 'Se requiere acceso a la galería para seleccionar fotos de evidencia.',
        NSMicrophoneUsageDescription: 'AMY Delivery necesita acceso al micrófono para reconocimiento de voz.',
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ['location']
      }
    },

    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || 'GOOGLE_MAPS_API_KEY_NOT_SET'
        }
      },

      package: 'com.amybusiness.delivery',
      versionCode: 1,

      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#2563eb'
      },

      permissions: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.RECORD_AUDIO',
        'android.permission.VIBRATE'
      ],

      edgeToEdgeEnabled: true
    },

    web: {
      favicon: './assets/favicon.png'
    },

    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'AMY Delivery necesita tu ubicación para rastrear entregas en tiempo real.',
          locationWhenInUsePermission: 'AMY Delivery necesita tu ubicación para rastrear entregas.',
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true
        }
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Permite a AMY Delivery usar la cámara para tomar fotos de evidencia.'
        }
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Permite a AMY Delivery acceder a tu galería para seleccionar fotos.'
        }
      ],
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#2563eb',
          sounds: ['./assets/sounds/notification.wav']
        }
      ]
    ],

    updates: {
      enabled: false,
      fallbackToCacheTimeout: 0
    },

    extra: {
      eas: {
        projectId: '1234d890-c5e0-45df-88fd-6040a1bb7129'
      },

      // Variables de entorno accesibles desde la app
      API_BASE_URL: process.env.API_BASE_URL ||
        (IS_PROD ? 'https://amy-backend-minutaapi.onrender.com' :
         IS_STAGING ? 'https://amy-backend-staging.onrender.com' :
         'http://192.168.0.14:8080'),

      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      APP_ENV: process.env.APP_ENV || 'development'
    },

    // Hooks para diferentes entornos
    hooks: {
      postPublish: []
    }
  }
};
