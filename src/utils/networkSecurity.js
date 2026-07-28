/**
 * Utilidades de seguridad de red para AMY Mobile
 *
 * NOTA: Certificate pinning completo requiere un Expo Development Build
 * con código nativo. Esta implementación proporciona validaciones
 * a nivel de aplicación para el workflow managed.
 */

// Dominios de producción permitidos
const ALLOWED_PRODUCTION_HOSTS = [
  'controlminutasapi-production.up.railway.app',
];

// En desarrollo, permitir conexiones locales
const ALLOWED_DEV_HOSTS = [
  'localhost',
  '127.0.0.1',
  '10.0.2.2', // Android emulator
];

/**
 * Valida que la URL sea de un host permitido.
 * Previene conexiones a servidores no autorizados.
 */
export function isAllowedHost(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // En desarrollo, permitir hosts locales y de producción
    if (__DEV__) {
      const isLocalHost = ALLOWED_DEV_HOSTS.some(host =>
        hostname === host || hostname.startsWith('192.168.') || hostname.startsWith('10.')
      );
      return isLocalHost || ALLOWED_PRODUCTION_HOSTS.includes(hostname);
    }

    // En producción, solo permitir hosts autorizados
    return ALLOWED_PRODUCTION_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

/**
 * Valida que la conexión use HTTPS en producción.
 */
export function isSecureConnection(url) {
  try {
    const urlObj = new URL(url);

    // En desarrollo, permitir HTTP para pruebas locales
    if (__DEV__) {
      return true;
    }

    // En producción, requerir HTTPS
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Valida una URL antes de hacer una petición.
 * Lanza error si la URL no es segura.
 */
export function validateRequestUrl(url) {
  if (!isAllowedHost(url)) {
    throw new Error('Conexión a host no autorizado');
  }

  if (!isSecureConnection(url)) {
    throw new Error('Se requiere conexión segura (HTTPS)');
  }

  return true;
}

/**
 * Wrapper de fetch con validaciones de seguridad.
 */
export async function secureFetch(url, options = {}) {
  validateRequestUrl(url);
  return fetch(url, options);
}

/**
 * Configuración para Certificate Pinning nativo (requiere Development Build)
 *
 * Para implementar pinning completo:
 *
 * 1. Crear un Expo Development Build:
 *    npx expo install expo-dev-client
 *    eas build --profile development --platform ios
 *    eas build --profile development --platform android
 *
 * 2. Instalar react-native-ssl-pinning:
 *    npx expo install react-native-ssl-pinning
 *
 * 3. Agregar los certificados en:
 *    - iOS: ios/YourApp/certificates/
 *    - Android: android/app/src/main/assets/
 *
 * 4. Usar el fetch de ssl-pinning en lugar del fetch nativo
 *
 * Pins SHA256 del certificado de Railway (ejemplo):
 * Obtener con: openssl s_client -connect controlminutasapi-production.up.railway.app:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
 */
export const CERTIFICATE_PINS = {
  // Actualizar con los pins reales del certificado de producción
  'controlminutasapi-production.up.railway.app': [
    // Pin del certificado leaf
    // Pin del certificado intermediate (backup)
  ],
};
