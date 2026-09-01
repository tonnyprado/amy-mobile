/**
 * Configuración de AWS S3 para upload de archivos
 *
 * IMPORTANTE: Este módulo está preparado para cuando se implemente S3.
 * Por ahora está DESHABILITADO y se usa base64 directamente.
 */

/**
 * Feature flag para habilitar/deshabilitar S3
 * S3 está configurado en el backend de Render
 */
export const S3_ENABLED = true;

/**
 * Configuración de S3
 * Estos valores se configurarán cuando se implemente S3
 */
export const S3_CONFIG = {
  // URL del endpoint del backend para upload
  uploadEndpoint: '/api/archivos/evidencias',

  // Bucket de S3 (configurar en backend)
  bucket: 'amy-delivery-evidencias',

  // Región de AWS (configurar en backend)
  region: 'us-east-1',

  // Prefijos para organizar archivos en S3
  prefixes: {
    fotos: 'evidencias/fotos/',
  },

  // Tamaños máximos permitidos
  maxSizes: {
    foto: 5 * 1024 * 1024,  // 5 MB
  },

  // Formatos permitidos
  allowedFormats: {
    foto: ['image/jpeg', 'image/jpg', 'image/png'],
  },
};

/**
 * Genera un nombre de archivo único para S3
 * @param {string} tipo - 'fotos'
 * @param {number} pedidoId - ID del pedido
 * @returns {string} Nombre de archivo único
 */
export function generarNombreArchivoS3(tipo, pedidoId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${S3_CONFIG.prefixes[tipo] || 'evidencias/'}pedido-${pedidoId}-${tipo}-${timestamp}-${random}.jpg`;
}

/**
 * Obtiene la URL completa de S3 a partir de la key
 * Esta función se usará cuando S3 esté implementado
 * @param {string} key - Key del archivo en S3
 * @returns {string} URL completa
 */
export function obtenerUrlS3(key) {
  const { bucket, region } = S3_CONFIG;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
