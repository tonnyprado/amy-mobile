import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class ChatSoundService {
  constructor() {
    this.messageSound = null;
    this.announcementSound = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false, // No reproducir en modo silencio
        staysActiveInBackground: false,
      });

      // Solo usaremos vibración por ahora (los sonidos requieren archivos de audio)
      // Los sonidos se pueden agregar después con archivos .mp3/.wav en assets
      this.initialized = true;
      console.log('✅ Servicio de sonido inicializado (vibración habilitada)');
    } catch (error) {
      console.warn('⚠️ Error al inicializar servicio de sonido:', error);
      // No es crítico, la app puede funcionar sin sonidos
    }
  }

  async playMessageSound() {
    try {
      // Vibración suave para mensaje normal
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('📳 Vibración de mensaje reproducida');
    } catch (error) {
      console.warn('⚠️ No se pudo reproducir vibración de mensaje:', error);
    }
  }

  async playAnnouncementSound() {
    try {
      // Vibración fuerte para anuncio
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      console.log('📳 Vibración de anuncio reproducida (1)');

      // Vibración adicional después de 300ms para hacer patrón distintivo
      setTimeout(async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          console.log('📳 Vibración de anuncio reproducida (2)');
        } catch (error) {
          console.warn('⚠️ Error en segunda vibración:', error);
        }
      }, 300);
    } catch (error) {
      console.warn('⚠️ No se pudo reproducir vibración de anuncio:', error);
    }
  }

  async cleanup() {
    // Ya no hay nada que limpiar
    this.initialized = false;
  }
}

const chatSoundService = new ChatSoundService();
export default chatSoundService;
