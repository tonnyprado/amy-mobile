// Jest setup file for AMY Mobile
// Tests unitarios para utilidades y lógica de negocio

// Mock de expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock de expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        APP_ENV: 'test',
        API_BASE_URL: 'http://localhost:8080',
      },
    },
  },
}));

// Mock de fetch global
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock de __DEV__
global.__DEV__ = true;

// Mock de secureStorage
jest.mock('./src/utils/secureStorage', () => ({
  getToken: jest.fn(() => Promise.resolve('mock-token')),
  setToken: jest.fn(() => Promise.resolve()),
  deleteToken: jest.fn(() => Promise.resolve()),
}));

// Mock de networkSecurity
jest.mock('./src/utils/networkSecurity', () => ({
  validateRequestUrl: jest.fn(() => true),
}));
