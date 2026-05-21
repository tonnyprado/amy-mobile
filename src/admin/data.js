/**
 * Admin Data - Mock data
 * En producción, reemplazar por llamadas al API
 */

export const REPARTIDORES = [
  {
    id: 'r1',
    name: 'Alberto Cruz',
    tag: 'AL',
    phone: '+52 55 1234 5678',
    color: '#C5B4FF',
    routes: ['M108', 'M110', 'M112', 'M170', 'M172'],
    status: 'enRuta',
    online: true,
    progress: { total: 12, done: 7, route: 3, pct: 58 }
  },
  {
    id: 'r2',
    name: 'Alday Pérez',
    tag: 'AD',
    phone: '+52 55 2345 6789',
    color: '#FFCE3B',
    routes: ['M10', 'M03'],
    status: 'enRuta',
    online: true,
    progress: { total: 8, done: 5, route: 2, pct: 62 }
  },
  {
    id: 'r3',
    name: 'Alejandro Vidal',
    tag: 'AJ',
    phone: null,
    color: '#5BE0A2',
    routes: ['M37', 'PS1', 'PS3'],
    status: 'enRuta',
    online: false,
    progress: { total: 10, done: 4, route: 4, pct: 40 }
  },
  {
    id: 'r4',
    name: 'Alexis Romero',
    tag: 'AX',
    phone: null,
    color: '#FF7849',
    routes: [],
    status: 'libre',
    online: false,
    progress: { total: 0, done: 0, route: 0, pct: 0 }
  },
  {
    id: 'r5',
    name: 'Brayan Lugo',
    tag: 'BL',
    phone: '+52 55 3456 7890',
    color: '#3D6BFF',
    routes: ['M45', 'M46'],
    status: 'enRuta',
    online: true,
    progress: { total: 9, done: 6, route: 2, pct: 67 }
  },
  {
    id: 'r6',
    name: 'Carlos Méndez',
    tag: 'CM',
    phone: '+52 55 4567 8901',
    color: '#FF5A7E',
    routes: ['M88'],
    status: 'descanso',
    online: false,
    progress: { total: 5, done: 5, route: 0, pct: 100 }
  },
];

// kind: 'system' | 'them' | 'me' | 'announcement'
export const ADMIN_MESSAGES = {
  r1: [
    { kind: 'system', text: 'Chat iniciado', time: '3:23 p.m.' },
    {
      kind: 'announcement',
      text: 'Reporte de avance cada 2 horas mientras estés en carretera.',
      time: '4:57 p.m.'
    },
    {
      kind: 'them',
      text: 'Recibido, voy en Reforma. ETA 4 min al siguiente punto.',
      time: '4:58 p.m.'
    },
    {
      kind: 'me',
      text: '¡Perfecto, gracias Alberto!',
      time: '4:59 p.m.',
      read: true
    },
  ],
  r2: [
    { kind: 'system', text: 'Chat iniciado', time: '2:10 p.m.' },
    { kind: 'them', text: 'Buenas tardes jefe, ya entregué M10.', time: '3:21 p.m.' },
  ],
  r3: [
    { kind: 'system', text: 'Chat iniciado', time: '08:00 a.m.' },
    { kind: 'them', text: 'Sin teléfono, contactar por radio.', time: '08:02 a.m.' },
  ],
  r4: [{ kind: 'system', text: 'Chat iniciado', time: '08:00 a.m.' }],
  r5: [
    { kind: 'system', text: 'Chat iniciado', time: '9:00 a.m.' },
    { kind: 'me', text: '¿Cómo va la ruta M45?', time: '11:23 a.m.', read: true },
    { kind: 'them', text: 'Todo bien, 6 de 9 entregados.', time: '11:25 a.m.' },
  ],
  r6: [
    { kind: 'system', text: 'Chat iniciado', time: '7:00 a.m.' },
    { kind: 'them', text: 'Terminé mi ruta jefe.', time: '14:30' },
  ],
};

export const STATS = {
  successRate: 82,
  delivered: 118,
  assigned: 144,
  activeDrivers: 8,
  totalDrivers: 12,
  inRoute: 12,
  pending: 20,
  expectedPct: 75,
  alerts: { high: 2, mid: 3 },
  incidencias: [
    { key: 'cliente', label: 'Cliente no estaba', value: 8, icon: 'door-closed' },
    { key: 'datos', label: 'Datos incorrectos', value: 5, icon: 'map-pin-off' },
    { key: 'riesgo', label: 'Alto riesgo', value: 2, icon: 'alert-octagon' },
    { key: 'cambio', label: 'Cambio de domicilio', value: 3, icon: 'repeat-2' },
    { key: 'rechazo', label: 'Rechazo del cliente', value: 4, icon: 'circle-x' },
    { key: 'otros', label: 'Otros motivos', value: 1, icon: 'circle-help' },
  ],
  intentos: { uno: 92, dos: 21, tres: 5 },
  avisos: 7,
  topReps: [
    { name: 'Juan Pérez', pct: 95, delivered: 28 },
    { name: 'María López', pct: 92, delivered: 24 },
    { name: 'Carlos Ruiz', pct: 88, delivered: 22 },
  ],
  metricas: { total: 150, promedio: 16, ruta: 12, pendientes: 20 },
};

export default {
  REPARTIDORES,
  ADMIN_MESSAGES,
  STATS,
};
