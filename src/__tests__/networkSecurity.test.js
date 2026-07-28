/**
 * Tests para networkSecurity.js
 * Verifica la validación de seguridad de conexiones de red
 */

const { isAllowedHost, isSecureConnection, validateRequestUrl } = require('../utils/networkSecurity');

describe('networkSecurity', () => {
  describe('isAllowedHost', () => {
    describe('en desarrollo (__DEV__ = true)', () => {
      beforeAll(() => {
        global.__DEV__ = true;
      });

      it('debería permitir el host de producción', () => {
        const url = 'https://controlminutasapi-production.up.railway.app/api/test';
        expect(isAllowedHost(url)).toBe(true);
      });

      it('debería permitir localhost', () => {
        expect(isAllowedHost('http://localhost:8080/api')).toBe(true);
        expect(isAllowedHost('http://127.0.0.1:8080/api')).toBe(true);
      });

      it('debería permitir IPs de red local', () => {
        expect(isAllowedHost('http://192.168.0.14:8080/api')).toBe(true);
        expect(isAllowedHost('http://192.168.1.100:3000/api')).toBe(true);
        expect(isAllowedHost('http://10.0.0.1:8080/api')).toBe(true);
      });

      it('debería permitir el host del emulador Android', () => {
        expect(isAllowedHost('http://10.0.2.2:8080/api')).toBe(true);
      });

      it('debería rechazar hosts externos desconocidos', () => {
        expect(isAllowedHost('https://malicious-site.com/api')).toBe(false);
        expect(isAllowedHost('https://fake-api.herokuapp.com/api')).toBe(false);
      });

      it('debería manejar URLs inválidas', () => {
        expect(isAllowedHost('not-a-url')).toBe(false);
        expect(isAllowedHost('')).toBe(false);
        expect(isAllowedHost(null)).toBe(false);
      });
    });

    describe('en producción (__DEV__ = false)', () => {
      beforeAll(() => {
        global.__DEV__ = false;
      });

      afterAll(() => {
        global.__DEV__ = true;
      });

      it('debería permitir el host de producción', () => {
        const url = 'https://controlminutasapi-production.up.railway.app/api/test';
        expect(isAllowedHost(url)).toBe(true);
      });

      it('debería rechazar localhost en producción', () => {
        expect(isAllowedHost('http://localhost:8080/api')).toBe(false);
        expect(isAllowedHost('http://127.0.0.1:8080/api')).toBe(false);
      });

      it('debería rechazar IPs de red local en producción', () => {
        expect(isAllowedHost('http://192.168.0.14:8080/api')).toBe(false);
      });

      it('debería rechazar hosts desconocidos en producción', () => {
        expect(isAllowedHost('https://other-api.com/api')).toBe(false);
      });
    });
  });

  describe('isSecureConnection', () => {
    describe('en desarrollo', () => {
      beforeAll(() => {
        global.__DEV__ = true;
      });

      it('debería permitir HTTP en desarrollo', () => {
        expect(isSecureConnection('http://localhost:8080/api')).toBe(true);
      });

      it('debería permitir HTTPS en desarrollo', () => {
        expect(isSecureConnection('https://api.example.com/api')).toBe(true);
      });
    });

    describe('en producción', () => {
      beforeAll(() => {
        global.__DEV__ = false;
      });

      afterAll(() => {
        global.__DEV__ = true;
      });

      it('debería requerir HTTPS en producción', () => {
        expect(isSecureConnection('https://api.example.com/api')).toBe(true);
      });

      it('debería rechazar HTTP en producción', () => {
        expect(isSecureConnection('http://api.example.com/api')).toBe(false);
      });
    });
  });

  describe('validateRequestUrl', () => {
    beforeAll(() => {
      global.__DEV__ = true;
    });

    it('debería pasar para URL de producción válida', () => {
      const url = 'https://controlminutasapi-production.up.railway.app/api/test';
      expect(() => validateRequestUrl(url)).not.toThrow();
    });

    it('debería pasar para URL local válida en desarrollo', () => {
      const url = 'http://localhost:8080/api/test';
      expect(() => validateRequestUrl(url)).not.toThrow();
    });

    it('debería lanzar error para host no autorizado', () => {
      const url = 'https://malicious-site.com/api/steal-data';
      expect(() => validateRequestUrl(url)).toThrow('Conexión a host no autorizado');
    });

    it('debería lanzar error para conexión insegura en producción', () => {
      global.__DEV__ = false;
      const url = 'http://controlminutasapi-production.up.railway.app/api/test';
      expect(() => validateRequestUrl(url)).toThrow('Se requiere conexión segura (HTTPS)');
      global.__DEV__ = true;
    });
  });
});
