// src/slides.js
// Contenido del onboarding + URLs de las animaciones Lottie.
// Los .lottie están alojados en LottieFiles — no hace falta descargarlos.

export const LOTTIE_LOGIN =
  'https://lottie.host/73af008e-e381-4d5b-bce1-251d0e84a942/aF3gH6ckDN.lottie';

export const LOTTIE_SLIDES = [
  'https://lottie.host/6cf6603a-03fb-4ade-a193-e8b6946516cd/cX1DJYJMX5.lottie',
  'https://lottie.host/c655896b-5060-405e-af66-1584a3df3292/ThWLCoxGtA.lottie',
  'https://lottie.host/07de8c47-1d10-476e-a790-3bf6fb5b0a5e/assu9IM0Pf.lottie',
];

// Cada entry corresponde a un slide del onboarding.
export const SLIDES = [
  {
    title: 'Trackea con seguridad',
    body:  'Mendiola Logistics, ahora en tu bolsillo. Tu operación de entregas, monitoreada y conectada en tiempo real.',
    cta:   'Continuar',
  },
  {
    title: 'Tu ruta, sin papeleo',
    body:  'Visualiza tu próxima parada, gestiona los pedidos del día y registra entregas al instante desde tu teléfono.',
    cta:   'Siguiente',
  },
  {
    title: 'Tu equipo, sincronizado',
    body:  'Coordina repartidores, asigna rutas y revisa métricas en vivo. Comunícate por chat con anuncios y soporte 24/7.',
    cta:   'Iniciar Sesión',
  },
];
