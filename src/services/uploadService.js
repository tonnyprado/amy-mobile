/**
 * Servicio de upload de archivos a S3
 *
 * Este servicio maneja el upload de fotos a S3.
 * Incluye un fallback a base64 cuando S3 está deshabilitado.
 */

import { apiClient } from '../config/api';
import { S3_ENABLED, S3_CONFIG, generarNombreArchivoS3 } from '../config/s3Config';
import {
  dataURItoBlob,
  validarTamanoArchivo,
  validarFormatoArchivo,
  formatearTamano,
} from '../utils/fileHelpers';

/**
 * Sube una foto de evidencia
 *
 * @param {Object} params
 * @param {string} params.dataURI - Imagen en base64
 * @param {number} params.pedidoId - ID del pedido
 * @returns {Promise<string>} URL de la foto (S3 o base64)
 */
export async function subirFotoEvidencia({ dataURI, pedidoId }) {
  // Si S3 está deshabilitado, retornar base64 directamente
  if (!S3_ENABLED) {
    console.log('[UPLOAD] S3 deshabilitado, usando base64 para foto');
    return dataURI;
  }

  try {
    // Validar archivo
    const { blob, mimeType, size } = dataURItoBlob(dataURI);

    if (!validarFormatoArchivo(mimeType, S3_CONFIG.allowedFormats.foto)) {
      throw new Error(`Formato no permitido. Usa: ${S3_CONFIG.allowedFormats.foto.join(', ')}`);
    }

    if (!validarTamanoArchivo(size, S3_CONFIG.maxSizes.foto)) {
      throw new Error(
        `Archivo muy grande (${formatearTamano(size)}). Máximo: ${formatearTamano(S3_CONFIG.maxSizes.foto)}`
      );
    }

    // Generar nombre único
    const fileName = generarNombreArchivoS3('fotos', pedidoId);

    // Crear FormData para el upload
    const formData = new FormData();
    formData.append('file', {
      uri: dataURI,
      type: mimeType,
      name: fileName,
    });
    formData.append('pedidoId', pedidoId.toString());
    formData.append('tipo', 'foto');

    // Subir a S3 a través del backend
    const response = await apiClient.post(S3_CONFIG.uploadEndpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Error al subir foto a S3');
    }

    const data = await response.json();

    // El backend debe retornar { url: "https://s3..." }
    if (!data.url) {
      throw new Error('Backend no retornó URL de S3');
    }

    console.log('[UPLOAD] Foto subida a S3:', data.url);
    return data.url;
  } catch (error) {
    console.error('[UPLOAD] Error al subir foto a S3:', error);
    // Fallback a base64 si hay error
    console.warn('[UPLOAD] Usando base64 como fallback');
    return dataURI;
  }
}

/**
 * Sube múltiples fotos de evidencia
 *
 * @param {Object} params
 * @param {Array<Object>} params.fotos - Array de objetos { uri: string, id: string }
 * @param {number} params.pedidoId - ID del pedido
 * @returns {Promise<Array<Object>>} Array de objetos con URLs
 */
export async function subirMultiplesFotos({ fotos, pedidoId }) {
  const resultados = [];

  for (const foto of fotos) {
    try {
      const url = await subirFotoEvidencia({
        dataURI: foto.uri,
        pedidoId,
      });

      resultados.push({
        id: foto.id,
        url,
        name: foto.name || `foto_${foto.id}`,
      });
    } catch (error) {
      console.error(`[UPLOAD] Error al subir foto ${foto.id}:`, error);
      // Agregar con base64 si falla
      resultados.push({
        id: foto.id,
        url: foto.uri,
        name: foto.name || `foto_${foto.id}`,
        error: error.message,
      });
    }
  }

  return resultados;
}

export default {
  subirFotoEvidencia,
  subirMultiplesFotos,
};
