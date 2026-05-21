// src/data.js
// Datos mock. En producción reemplazar por llamadas al API.

export const STOPS = [
  { id: '1', code: 'C-9901', addr: '21 Ruiz Cortines',   status: 'done'    },
  { id: '2', code: 'B-7712', addr: '14 Av. Reforma',     status: 'done'    },
  { id: '3', code: 'A-4821', addr: '10 Calle Morelos',   status: 'current' },
  { id: '4', code: 'D-1102', addr: '7 Insurgentes Sur',  status: 'next'    },
  { id: '5', code: 'E-5530', addr: '32 Av. Universidad', status: 'next'    },
];

// Status: 'delivered' | 'enRoute' | 'pending'
export const ORDERS = [
  { id: 'C-9901', addr: '21 Ruiz Cortines',   col: 'Roma Norte',  name: 'Diego Hernández',
    status: 'delivered', time: '08:42',      weight: '1.2 kg', tone: 'c' },
  { id: 'B-7712', addr: '14 Av. Reforma',     col: 'Juárez',      name: 'Ivan Petrov',
    status: 'delivered', time: '09:18',      weight: '3.4 kg', tone: 'a' },
  { id: 'A-4821', addr: '10 Calle Morelos',   col: 'Centro',      name: 'Mariana López',
    status: 'enRoute',   time: 'ETA 4 min',  weight: '0.8 kg', tone: 'b' },
  { id: 'D-1102', addr: '7 Insurgentes Sur',  col: 'Del Valle',   name: 'Sofía Ramírez',
    status: 'pending',   time: '11:00',      weight: '2.1 kg', tone: 'd' },
  { id: 'E-5530', addr: '32 Av. Universidad', col: 'Coyoacán',    name: 'Luis Martín',
    status: 'pending',   time: '12:30',      weight: '5.6 kg', tone: 'a' },
];

export const STATS = {
  deliveriesToday: 18,
  assignedToday:   22,
  weekBars:        [3, 5, 4, 7, 6, 9, 18],
  weekDays:        ['L','M','M','J','V','S','D'],
  distance:        '124',
  rating:          '4.9',
  efficiency:      '94',
  income:          '2,840',
};

export const CONVERSATIONS = [
  { id: 'tony',  name: 'Tony Prado',    role: 'Administrador', last: 'Recuerda mandar reporte al llegar.',
    time: '4:57 p.m.', online: true,  tag: 'TP', color: '#FF7849' },
  { id: 'ops',   name: 'Centro de Ops', role: 'Soporte 24/7',  last: 'Nuevo paquete asignado: #E-5530',
    time: '3:21 p.m.', online: true,  tag: 'CO', color: '#3D6BFF' },
  { id: 'karla', name: 'Karla Méndez',  role: 'Supervisor',    last: 'Excelente trabajo hoy.',
    time: 'Ayer',     online: false, tag: 'KM', color: '#7C5CFF' },
];

// kind: 'system' | 'them' | 'me' | 'announcement'
export const MESSAGES_BY_CONV = {
  tony: [
    { kind: 'system',       text: 'Chat iniciado',  time: '3:23 p.m.' },
    { kind: 'them',         text: 'Hola, ¿cómo vas con la ruta?', time: '3:25 p.m.' },
    { kind: 'announcement', text: 'Necesito reporte de avance en carretera cada 2 horas.', time: '4:57 p.m.' },
    { kind: 'me',           text: 'Voy bien, 2 entregas hechas, sigo en Reforma.', time: '4:58 p.m.', read: true },
    { kind: 'them',         text: '¿ETA al siguiente punto?', time: '4:59 p.m.' },
    { kind: 'me',           text: 'Llego en 4 minutos.', time: '4:59 p.m.', read: true },
    { kind: 'them',         text: 'Perfecto, recuerda mandar reporte al llegar.', time: 'ahora' },
  ],
  ops: [
    { kind: 'system', text: 'Chat iniciado', time: '2:10 p.m.' },
    { kind: 'them',   text: 'Nuevo paquete asignado: #E-5530', time: '3:21 p.m.' },
    { kind: 'them',   text: 'Recolección en bodega Coyoacán.', time: '3:21 p.m.' },
  ],
  karla: [
    { kind: 'system', text: 'Chat iniciado', time: '08:00 a.m.' },
    { kind: 'them',   text: 'Excelente trabajo hoy.', time: 'Ayer 18:42' },
  ],
};
