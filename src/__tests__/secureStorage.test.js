/**
 * Tests para secureStorage.js
 * Verifica el almacenamiento seguro de tokens
 */

const SecureStore = require('expo-secure-store');
const { saveToken, getToken, deleteToken, isSecureStoreAvailable } = require('../utils/secureStorage');

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToken', () => {
    it('debería guardar el token usando SecureStore', async () => {
      const token = 'test-jwt-token-123';

      await saveToken(token);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('amy_access_token', token);
    });

    it('no debería guardar si el token es null', async () => {
      await saveToken(null);

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('no debería guardar si el token es undefined', async () => {
      await saveToken(undefined);

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('debería recuperar el token de SecureStore', async () => {
      const expectedToken = 'stored-token-456';
      SecureStore.getItemAsync.mockResolvedValueOnce(expectedToken);

      const result = await getToken();

      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('amy_access_token');
      expect(result).toBe(expectedToken);
    });

    it('debería retornar null si no hay token almacenado', async () => {
      SecureStore.getItemAsync.mockResolvedValueOnce(null);

      const result = await getToken();

      expect(result).toBeNull();
    });

    it('debería retornar null en caso de error', async () => {
      SecureStore.getItemAsync.mockRejectedValueOnce(new Error('Storage error'));

      const result = await getToken();

      expect(result).toBeNull();
    });
  });

  describe('deleteToken', () => {
    it('debería eliminar el token de SecureStore', async () => {
      await deleteToken();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('amy_access_token');
    });
  });

  describe('isSecureStoreAvailable', () => {
    it('debería retornar true cuando SecureStore está disponible', async () => {
      SecureStore.isAvailableAsync.mockResolvedValueOnce(true);

      const result = await isSecureStoreAvailable();

      expect(result).toBe(true);
    });

    it('debería retornar false cuando SecureStore no está disponible', async () => {
      SecureStore.isAvailableAsync.mockResolvedValueOnce(false);

      const result = await isSecureStoreAvailable();

      expect(result).toBe(false);
    });
  });
});
