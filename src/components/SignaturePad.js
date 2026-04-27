import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import * as ScreenOrientation from 'expo-screen-orientation';
import AnimatedIcon, { ANIMATED_ICONS } from './AnimatedIcon';

/**
 * Componente de firma digital con modal de pantalla completa
 *
 * IMPORTANTE: Para usar este componente necesitas instalar:
 * npx expo install react-native-signature-canvas react-native-webview expo-screen-orientation lottie-react-native
 *
 * @param {Object} props
 * @param {string} props.value - Firma en base64
 * @param {function} props.onChange - Callback cuando cambia la firma
 */
export default function SignaturePad({ value, onChange }) {
  const ref = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSignature, setTempSignature] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);

  const openModal = async () => {
    setModalVisible(true);
    setHasDrawn(false);
    setTempSignature('');

    // Forzar orientación horizontal con un pequeño delay para que el canvas se renderice bien
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      // Delay para que el webview se ajuste a la nueva orientación
      setTimeout(() => {
        // El canvas debería estar listo ahora
      }, 300);
    } catch (error) {
      console.log('Error al cambiar orientación:', error);
    }
  };

  const closeModal = async () => {
    setModalVisible(false);
    setTempSignature('');
    setHasDrawn(false);
    // Volver a orientación portrait
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (error) {
      console.log('Error al restaurar orientación:', error);
    }
  };

  const handleEnd = () => {
    // Se llama cada vez que el usuario termina un trazo
    setHasDrawn(true);
    // Leer la firma del canvas
    ref.current?.readSignature();
  };

  const handleOK = (signature) => {
    // Se llama cuando readSignature() obtiene la firma
    setTempSignature(signature);
  };

  const handleEmpty = () => {
    // Se llama cuando el canvas está vacío
    setHasDrawn(false);
    setTempSignature('');
  };

  const handleConfirm = async () => {
    if (tempSignature && hasDrawn) {
      onChange(tempSignature);
      await closeModal();
    }
  };

  const handleClear = () => {
    ref.current?.clearSignature();
    setTempSignature('');
    setHasDrawn(false);
  };

  const handleCancel = async () => {
    await closeModal();
  };

  // Configuración del canvas para modal en horizontal
  const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
    }
    .m-signature-pad--body {
      border: none;
      background-color: #ffffff;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body {
      margin: 0;
      padding: 0;
    }
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Firma del cliente</Text>

      {/* Botón para abrir modal de firma */}
      <TouchableOpacity
        style={styles.signatureButton}
        onPress={openModal}
        activeOpacity={0.7}
      >
        {value ? (
          <View style={styles.signaturePreview}>
            <Image
              source={{ uri: value }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
            <Text style={styles.signatureButtonText}>✓ Firma capturada - Toca para modificar</Text>
          </View>
        ) : (
          <View style={styles.signatureEmpty}>
            <AnimatedIcon
              source={{ uri: ANIMATED_ICONS.signature }}
              size={80}
              autoPlay={true}
              loop={true}
            />
            <Text style={styles.signatureButtonText}>Toca aquí para firmar</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal de pantalla completa */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          {/* Canvas de firma */}
          <View style={styles.canvasContainer}>
            <SignatureCanvas
              ref={ref}
              onOK={handleOK}
              onEnd={handleEnd}
              onEmpty={handleEmpty}
              descriptionText=""
              webStyle={webStyle}
              minWidth={1}
              maxWidth={3}
              penColor="#0f172a"
              backgroundColor="#ffffff"
              autoClear={false}
              trimWhitespace={true}
            />
          </View>

          {/* Barra de botones */}
          <View style={styles.buttonBar}>
            {/* Botón X - Cancelar */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Botón Borrar */}
            <TouchableOpacity
              style={styles.clearButtonModal}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonModalText}>🗑️ Borrar firma</Text>
            </TouchableOpacity>

            {/* Botón Confirmar */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !hasDrawn && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={!hasDrawn}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>✓ Confirmar firma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  signatureButton: {
    minHeight: 120,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  signatureEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  signatureButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
  },
  signaturePreview: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureImage: {
    width: '100%',
    height: 80,
    marginBottom: 8,
  },
  // Estilos del modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  buttonBar: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  clearButtonModal: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonModalText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
