import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { enviarUbicacion } from '../services/repartidorApi';

/**
 * Hook para rastrear la ubicación del repartidor en tiempo real
 * y enviarla periódicamente al backend
 *
 * @param {Object} options
 * @param {string} options.repartidorId - ID del repartidor
 * @param {boolean} options.enabled - Activar/desactivar tracking
 * @param {string} options.estadoActividad - EN_ALMACEN, EN_RUTA, EN_PAUSA, FINALIZADO
 * @param {number} options.intervalo - Intervalo de envío en ms (default: 15000 = 15 seg)
 * @returns {Object}
 */
export function useGeolocation(options = {}) {
  const {
    repartidorId,
    enabled = false,
    estadoActividad = 'EN_ALMACEN',
    intervalo = 15000 // 15 segundos
  } = options;

  const [ubicacion, setUbicacion] = useState(null);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [ultimoEnvio, setUltimoEnvio] = useState(null);
  const [permisosConcedidos, setPermisosConcedidos] = useState(false);

  const subscriptionRef = useRef(null);
  const intervalIdRef = useRef(null);
  const ubicacionActualRef = useRef(null);

  /**
   * Solicita permisos de ubicación al usuario
   */
  const solicitarPermisos = useCallback(async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        setError('Permisos de ubicación denegados. Por favor actívalos en configuración.');
        return false;
      }

      // Para tracking en background (opcional, solo si es necesario)
      // const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      setPermisosConcedidos(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error al solicitar permisos:', err);
      setError('Error al solicitar permisos de ubicación');
      return false;
    }
  }, []);

  /**
   * Obtiene el nivel de batería del dispositivo
   */
  const obtenerNivelBateria = async () => {
    try {
      const level = await Battery.getBatteryLevelAsync();
      return Math.round(level * 100);
    } catch (err) {
      console.warn('No se pudo obtener nivel de batería:', err);
      return null;
    }
  };

  /**
   * Envía la ubicación actual al backend
   */
  const enviarUbicacionAlBackend = useCallback(async (location) => {
    if (!repartidorId) {
      console.warn('No se puede enviar ubicación: falta repartidorId');
      return;
    }

    try {
      const bateria = await obtenerNivelBateria();

      const datos = {
        repartidorId,
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
        altitud: location.coords.altitude,
        precision: location.coords.accuracy,
        velocidad: location.coords.speed ? location.coords.speed * 3.6 : null, // m/s a km/h
        estadoActividad,
        bateria,
        proveedorUbicacion: 'GPS'
      };

      await enviarUbicacion(datos);
      setUltimoEnvio(new Date());
      console.log('📍 Ubicación enviada:', {
        lat: datos.latitud.toFixed(6),
        lng: datos.longitud.toFixed(6),
        estado: estadoActividad
      });
    } catch (err) {
      console.error('Error al enviar ubicación:', err);
      setError(err.message);
    }
  }, [repartidorId, estadoActividad]);

  /**
   * Inicia el tracking de ubicación
   */
  const startTracking = useCallback(async () => {
    if (tracking) {
      console.log('Tracking ya está activo');
      return;
    }

    // Verificar permisos primero
    const hasPermission = permisosConcedidos || await solicitarPermisos();
    if (!hasPermission) {
      return;
    }

    console.log('🚀 Iniciando tracking de ubicación...');

    try {
      // Iniciar watchPosition con expo-location
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Actualizar cada 5 segundos
          distanceInterval: 10, // O cada 10 metros
        },
        (location) => {
          const nuevaUbicacion = {
            latitud: location.coords.latitude,
            longitud: location.coords.longitude,
            altitud: location.coords.altitude,
            precision: location.coords.accuracy,
            velocidad: location.coords.speed ? location.coords.speed * 3.6 : null,
            timestamp: new Date(location.timestamp)
          };

          setUbicacion(nuevaUbicacion);
          ubicacionActualRef.current = location;
          setError(null);
        }
      );

      // Configurar envío periódico al backend
      intervalIdRef.current = setInterval(() => {
        if (ubicacionActualRef.current) {
          enviarUbicacionAlBackend(ubicacionActualRef.current);
        }
      }, intervalo);

      setTracking(true);
    } catch (err) {
      console.error('Error al iniciar tracking:', err);
      setError('Error al iniciar tracking de ubicación');
    }
  }, [tracking, intervalo, permisosConcedidos, solicitarPermisos, enviarUbicacionAlBackend]);

  /**
   * Detiene el tracking de ubicación
   */
  const stopTracking = useCallback(() => {
    console.log('🛑 Deteniendo tracking de ubicación...');

    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    setTracking(false);
  }, []);

  /**
   * Obtiene la ubicación una sola vez (sin tracking continuo)
   */
  const obtenerUbicacionUnaVez = useCallback(async () => {
    try {
      const hasPermission = permisosConcedidos || await solicitarPermisos();
      if (!hasPermission) {
        throw new Error('Permisos de ubicación denegados');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const nuevaUbicacion = {
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
        altitud: location.coords.altitude,
        precision: location.coords.accuracy,
        velocidad: location.coords.speed ? location.coords.speed * 3.6 : null,
        timestamp: new Date(location.timestamp)
      };

      setUbicacion(nuevaUbicacion);
      setError(null);
      return location;
    } catch (err) {
      console.error('Error al obtener ubicación:', err);
      setError('No se pudo obtener la ubicación');
      throw err;
    }
  }, [permisosConcedidos, solicitarPermisos]);

  /**
   * Effect para controlar el tracking según el estado enabled
   */
  useEffect(() => {
    if (enabled && repartidorId) {
      startTracking();
    } else {
      stopTracking();
    }

    // Cleanup al desmontar
    return () => {
      stopTracking();
    };
  }, [enabled, repartidorId]); // No incluir startTracking/stopTracking para evitar loops

  return {
    ubicacion,                  // Ubicación actual
    error,                      // Error de geolocalización
    tracking,                   // Estado del tracking
    ultimoEnvio,                // Timestamp del último envío al backend
    permisosConcedidos,         // Si se concedieron permisos
    startTracking,              // Función para iniciar tracking
    stopTracking,               // Función para detener tracking
    obtenerUbicacionUnaVez,     // Obtener ubicación una sola vez
    solicitarPermisos           // Solicitar permisos manualmente
  };
}

export default useGeolocation;
