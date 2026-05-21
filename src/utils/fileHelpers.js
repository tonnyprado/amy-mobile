/**
 * Utilidades para manejo de archivos, conversiones y uploads
 */

import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Convierte una cadena base64 data URI a un objeto Blob
 * @param {string} dataURI - Data URI en formato base64 (ej: "data:image/png;base64,iVBORw0KG...")
 * @returns {Object} Objeto con blob y metadata
 */
export function dataURItoBlob(dataURI) {
  // Separar el metadata del base64
  const parts = dataURI.split(',');
  if (parts.length !== 2) {
    throw new Error('Data URI inválido');
  }

  const [metadata, base64Data] = parts;

  // Extraer el tipo MIME
  const mimeMatch = metadata.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

  // Convertir base64 a binario
  const byteString = atob(base64Data);

  // Crear array de bytes
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  // Crear blob
  const blob = new Blob([uint8Array], { type: mimeType });

  return {
    blob,
    mimeType,
    size: blob.size,
  };
}

/**
 * Convierte base64 a un objeto File compatible con FormData
 * @param {string} dataURI - Data URI en formato base64
 * @param {string} fileName - Nombre del archivo
 * @returns {File} Objeto File
 */
export function dataURItoFile(dataURI, fileName) {
  const { blob, mimeType } = dataURItoBlob(dataURI);

  // En React Native usamos un objeto compatible con FormData
  return {
    uri: dataURI,
    type: mimeType,
    name: fileName,
  };
}

/**
 * Valida el tamaño de un archivo
 * @param {number} size - Tamaño en bytes
 * @param {number} maxSize - Tamaño máximo permitido en bytes
 * @returns {boolean} true si es válido
 */
export function validarTamanoArchivo(size, maxSize) {
  return size <= maxSize;
}

/**
 * Valida el formato de un archivo
 * @param {string} mimeType - Tipo MIME del archivo
 * @param {Array<string>} allowedFormats - Formatos permitidos
 * @returns {boolean} true si es válido
 */
export function validarFormatoArchivo(mimeType, allowedFormats) {
  return allowedFormats.includes(mimeType);
}

/**
 * Formatea bytes a formato legible (KB, MB)
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Comprime una imagen base64 (reduce calidad y tamaño)
 * Usa expo-image-manipulator para optimizar imágenes antes de enviarlas
 *
 * @param {string} dataURI - Data URI base64
 * @param {number} quality - Calidad de compresión (0.0 - 1.0), default 0.6
 * @param {number} maxWidth - Ancho máximo en píxeles, default 1200
 * @returns {Promise<string>} Data URI comprimido
 */
export async function comprimirImagenBase64(dataURI, quality = 0.6, maxWidth = 1200) {
  try {
    // Validar que sea una URI válida
    if (!dataURI || !dataURI.startsWith('data:image')) {
      console.warn('URI inválida para comprimir:', dataURI?.substring(0, 50));
      return dataURI;
    }

    // Manipular imagen: reducir tamaño y comprimir
    const manipResult = await ImageManipulator.manipulateAsync(
      dataURI,
      [{ resize: { width: maxWidth } }], // Redimensionar manteniendo aspect ratio
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG, // JPEG es más eficiente que PNG
        base64: true // Retornar en base64
      }
    );

    // Construir data URI
    const compressedDataURI = `data:image/jpeg;base64,${manipResult.base64}`;

    // Log para ver reducción de tamaño
    const originalSize = Math.round(dataURI.length / 1024);
    const compressedSize = Math.round(compressedDataURI.length / 1024);
    const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);

    console.log(`📦 Imagen comprimida: ${originalSize}KB → ${compressedSize}KB (${reduction}% reducción)`);

    return compressedDataURI;
  } catch (error) {
    console.error('❌ Error al comprimir imagen:', error);
    // En caso de error, retornar la imagen original
    return dataURI;
  }
}

/**
 * Optimiza una imagen local (file://) para reducir tamaño antes de subirla o guardarla
 *
 * @param {string} uri - URI local de la imagen
 * @param {Object} options
 * @param {number} options.quality - Calidad JPEG
 * @param {number} options.maxWidth - Ancho máximo
 * @returns {Promise<Object>} Resultado de ImageManipulator
 */
export async function optimizarImagenLocal(uri, options = {}) {
  const {
    quality = 0.6,
    maxWidth = 1280,
  } = options;

  try {
    if (!uri || typeof uri !== 'string') {
      throw new Error('URI de imagen inválida');
    }

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    );

    return manipResult;
  } catch (error) {
    console.error('❌ Error optimizando imagen local:', error);
    return { uri };
  }
}
