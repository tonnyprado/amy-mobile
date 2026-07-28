/**
 * Tests for API Client configuration
 */

import { apiClient, API_BASE_URL } from '../config/api';

// Mock dependencies
jest.mock('../utils/secureStorage', () => ({
  getToken: jest.fn(),
}));

jest.mock('../utils/networkSecurity', () => ({
  validateRequestUrl: jest.fn(),
}));

import { getToken } from '../utils/secureStorage';
import { validateRequestUrl } from '../utils/networkSecurity';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('API_BASE_URL', () => {
    it('should be defined', () => {
      expect(API_BASE_URL).toBeDefined();
      expect(typeof API_BASE_URL).toBe('string');
    });

    it('should contain a valid URL format', () => {
      expect(API_BASE_URL).toMatch(/^https?:\/\//);
    });
  });

  describe('apiClient.fetch', () => {
    it('should call fetch with full URL', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.fetch('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/test`,
        expect.any(Object)
      );
    });

    it('should validate URL security', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.fetch('/api/test');

      expect(validateRequestUrl).toHaveBeenCalledWith(`${API_BASE_URL}/api/test`);
    });

    it('should add Authorization header when token exists', async () => {
      getToken.mockResolvedValue('mock-jwt-token');
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.fetch('/api/protected');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-jwt-token',
          }),
        })
      );
    });

    it('should not add Authorization header when no token', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.fetch('/api/public');

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBeUndefined();
    });

    it('should add Accept-Encoding header for compression', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.fetch('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept-Encoding': 'gzip, deflate',
          }),
        })
      );
    });

    it('should timeout after configured duration', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);

      // Mock fetch to delay longer than timeout
      global.fetch.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 10000))
      );

      // The apiClient uses Promise.race with timeout, so this should reject
      await expect(apiClient.fetch('/api/slow')).rejects.toThrow('Request timeout');
    }, 10000); // Increase test timeout

    it('should handle getToken errors gracefully', async () => {
      getToken.mockRejectedValue(new Error('SecureStore not available'));
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      // Should not throw
      await expect(apiClient.fetch('/api/test')).resolves.toBeDefined();
    });
  });

  describe('apiClient.get', () => {
    it('should make GET request', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.get('/api/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should pass custom headers', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.get('/api/users', {
        headers: { 'X-Custom': 'value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        })
      );
    });
  });

  describe('apiClient.post', () => {
    it('should make POST request with JSON body', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      const body = { name: 'Test', email: 'test@example.com' };
      await apiClient.post('/api/users', body);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(body),
        })
      );
    });

    it('should handle FormData without Content-Type header', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      const formData = new FormData();
      formData.append('file', 'test');

      await apiClient.post('/api/upload', formData);

      const fetchCall = global.fetch.mock.calls[0];
      // Content-Type should NOT be set for FormData (browser sets it with boundary)
      expect(fetchCall[1].headers['Content-Type']).toBeUndefined();
      expect(fetchCall[1].body).toBe(formData);
    });
  });

  describe('apiClient.put', () => {
    it('should make PUT request with JSON body', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      const body = { id: 1, name: 'Updated' };
      await apiClient.put('/api/users/1', body);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(body),
        })
      );
    });

    it('should handle FormData for file updates', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      const formData = new FormData();
      formData.append('avatar', 'image-data');

      await apiClient.put('/api/users/1/avatar', formData);

      const fetchCall = global.fetch.mock.calls[0];
      expect(fetchCall[1].headers['Content-Type']).toBeUndefined();
      expect(fetchCall[1].body).toBe(formData);
    });
  });

  describe('apiClient.delete', () => {
    it('should make DELETE request', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.delete('/api/users/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should include Authorization header', async () => {
      getToken.mockResolvedValue('admin-token');
      validateRequestUrl.mockReturnValue(true);
      global.fetch.mockResolvedValue({ ok: true });

      await apiClient.delete('/api/users/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer admin-token',
          }),
        })
      );
    });
  });

  describe('Auth endpoints', () => {
    it('should use longer timeout for login endpoint', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);

      // Mock a delay that's longer than normal timeout (3s) but shorter than auth timeout (10s)
      global.fetch.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 5000))
      );

      // Login endpoint should succeed because it uses 10s timeout
      const response = await apiClient.fetch('/api/usuarios/login', {
        method: 'POST',
        body: JSON.stringify({ usuario: 'test', password: 'pass' }),
      });

      expect(response.ok).toBe(true);
    }, 15000); // Increase test timeout

    it('should timeout on non-auth endpoints with shorter timeout', async () => {
      getToken.mockResolvedValue(null);
      validateRequestUrl.mockReturnValue(true);

      // Mock a delay longer than normal timeout (3s)
      global.fetch.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 5000))
      );

      // Non-auth endpoint should timeout at 3s
      await expect(apiClient.fetch('/api/users')).rejects.toThrow('Request timeout');
    }, 10000);
  });
});
