/**
 * Logger condicional que solo imprime en desarrollo.
 * En producción, los logs se suprimen para evitar exponer información sensible.
 */

const __DEV__ = process.env.NODE_ENV !== 'production';

const logger = {
  log: (...args) => {
    if (__DEV__) {
      console.log(...args);
    }
  },

  warn: (...args) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    // Los errores siempre se muestran (pero sin datos sensibles)
    console.error(...args);
  },

  debug: (...args) => {
    if (__DEV__) {
      console.debug(...args);
    }
  },

  // Para información muy sensible que NUNCA debe aparecer en producción
  sensitive: (...args) => {
    if (__DEV__) {
      console.log('[SENSITIVE]', ...args);
    }
  }
};

export default logger;
