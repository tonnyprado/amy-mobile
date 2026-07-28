import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'amy_access_token';

/**
 * Almacena el token de acceso de forma segura usando el keychain/keystore del dispositivo.
 * En iOS usa Keychain y en Android usa el KeyStore.
 */
export async function saveToken(token) {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error al guardar token de forma segura:', error);
    throw error;
  }
}

/**
 * Recupera el token de acceso del almacenamiento seguro.
 */
export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al recuperar token seguro:', error);
    return null;
  }
}

/**
 * Elimina el token del almacenamiento seguro.
 */
export async function deleteToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al eliminar token seguro:', error);
  }
}

/**
 * Verifica si SecureStore está disponible en el dispositivo.
 */
export async function isSecureStoreAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}
