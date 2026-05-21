// src/App.jsx
// Raíz de la app. Compone las pantallas con scroll vertical, el chat-drawer,
// el FAB y el toast. Maneja:
//   - paleta de tema
//   - estado de scroll / sección activa (IntersectionObserver)
//   - estado del drawer + swipe horizontal
//   - estado del chat: openConvId, reveal, unreadByConv, toast
//
// En Expo:
//   - Reemplaza el scroll-snap vertical por <PagerView> o un FlatList paginado.
//   - El drawer + swipe lo manejas con react-native-gesture-handler.
//   - El toast con react-native-reanimated (translateY + opacity).
//   - El "circle reveal" con clip-path NO existe en RN; recrea con
//     Animated.View circular + scale (de 0 a ~40), absolutamente posicionado.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import MapScreen     from './screens/MapScreen';
import OrdersScreen  from './screens/OrdersScreen';
import StatsScreen   from './screens/StatsScreen';
import ChatScreen    from './screens/chat/ChatScreen';
import ChatFab       from './components/ChatFab';
import ChatDrawer    from './components/ChatDrawer';
import SideRail      from './components/SideRail';
import NotificationToast from './components/NotificationToast';
import StatusBar     from './components/StatusBar';
import { PALETTES, DEFAULT_PALETTE } from './theme';

const DEVICE_WIDTH = 390;  // sólo para el cálculo del swipe

export default function App() {
  const theme = PALETTES[DEFAULT_PALETTE];

  // ── Scroll-snap entre pantallas ─────────────────────────────
  const scrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState(0);
  const screens = [
    { id: 'mapa',  Comp: MapScreen,    label: 'Mapa' },
    { id: 'hoy',   Comp: OrdersScreen, label: 'Pedidos' },
    { id: 'stats', Comp: StatsScreen,  label: 'Estadísticas' },
  ];

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const els = root.querySelectorAll('section[data-screen-label]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0.55) {
          setActiveSection([...els].indexOf(e.target));
        }
      });
    }, { root, threshold: [0.55, 0.7] });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const goTo = (i) => {
    const root = scrollRef.current;
    if (!root) return;
    const els = root.querySelectorAll('section[data-screen-label]');
    els[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(i);
  };

  // ── Chat state ──────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [openConvId, setOpenConvId] = useState(null);
  const [reveal, setReveal] = useState(null);          // { color, x, y, ts }
  const [unreadByConv, setUnreadByConv] = useState({ tony: 2 });
  const [toast, setToast] = useState(null);            // { name, tag, color, message, convId, shown }
  const toastTimerRef = useRef(null);

  const unreadCount = Object.values(unreadByConv).reduce((a,b) => a+b, 0);

  const dismissToast = () => {
    setToast(null);
    if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null; }
  };

  // Demo: simula un mensaje entrante al cabo de 4.5s
  useEffect(() => {
    const id = setTimeout(() => {
      if (chatOpen) return;
      const payload = {
        convId: 'tony', name: 'Tony Prado', tag: 'TP', color: theme.accent,
        message: 'Recuerda mandar reporte al llegar.',
      };
      setUnreadByConv(s => ({ ...s, [payload.convId]: (s[payload.convId] || 0) + 1 }));
      setToast({ ...payload, shown: false });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setToast(t => t ? { ...t, shown: true } : null);
      }));
      toastTimerRef.current = setTimeout(() => {
        setToast(t => t ? { ...t, shown: false } : null);
        setTimeout(() => setToast(null), 400);
      }, 5000);
    }, 4500);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, []);

  // Al abrir una conversación, marcar como leído
  useEffect(() => {
    if (chatOpen && openConvId) {
      setUnreadByConv(s => ({ ...s, [openConvId]: 0 }));
    }
  }, [chatOpen, openConvId]);

  // ── Drawer + swipe horizontal ───────────────────────────────
  const drawerRef = useRef(null);
  const [dragX, setDragX] = useState(null);
  const dragStart = useRef(null);

  const onPointerDown = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x, y, openAtStart: chatOpen, decided: false, horizontal: false };
  };
  const onPointerMove = (e) => {
    if (!dragStart.current) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;
    if (!dragStart.current.decided) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      dragStart.current.decided = true;
      dragStart.current.horizontal = Math.abs(dx) > Math.abs(dy) * 1.1;
    }
    if (!dragStart.current.horizontal) return;
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (!dragStart.current) return;
    const dx = dragX || 0;
    const openAtStart = dragStart.current.openAtStart;
    if (!openAtStart && dx < -60) setChatOpen(true);
    else if (openAtStart && dx > 80) setChatOpen(false);
    dragStart.current = null;
    setDragX(null);
  };

  const drawerTransform = useMemo(() => {
    if (dragX === null) return chatOpen ? 'translateX(0%)' : 'translateX(100%)';
    const w = DEVICE_WIDTH;
    if (chatOpen) {
      const x = Math.max(0, Math.min(w, dragX));
      return `translateX(${x}px)`;
    } else {
      const x = Math.max(-w, Math.min(0, dragX));
      return `translateX(${w + x}px)`;
    }
  }, [dragX, chatOpen]);

  const scrimOpacity = useMemo(() => {
    if (dragX === null) return chatOpen ? 1 : 0;
    const w = DEVICE_WIDTH;
    if (chatOpen) {
      const x = Math.max(0, Math.min(w, dragX));
      return 1 - x / w;
    } else {
      const x = Math.max(-w, Math.min(0, dragX));
      return -x / w;
    }
  }, [dragX, chatOpen]);

  // ── Handler: abrir una conversación con reveal ──────────────
  const handleOpenConv = (conv, ev) => {
    const dRect = drawerRef.current?.getBoundingClientRect();
    const r = ev.currentTarget.getBoundingClientRect();
    const x = dRect ? r.left + r.width/2 - dRect.left : 195;
    const y = dRect ? r.top  + r.height/2 - dRect.top : 200;
    setReveal({ color: conv.color, x, y, ts: Date.now() });
    setTimeout(() => setOpenConvId(conv.id), 80);
    setUnreadByConv(s => ({ ...s, [conv.id]: 0 }));
    setTimeout(() => setReveal(null), 800);
  };

  const onAccentBg = activeSection === 2;

  return (
    <div className="stage">
      <div
        className="device"
        style={{ background: theme.canvas }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="island"/>

        {/* Scroll vertical con snap entre pantallas */}
        <div ref={scrollRef} className="snap">
          {screens.map(s => <s.Comp key={s.id} theme={theme}/>)}
        </div>

        <StatusBar color={theme.ink}/>

        <ChatFab
          theme={theme}
          onAccentBg={onAccentBg}
          unreadCount={unreadCount}
          hidden={chatOpen}
          onPress={() => { setChatOpen(true); setOpenConvId(null); dismissToast(); }}
        />

        <NotificationToast
          toast={toast}
          theme={theme}
          onPress={() => {
            if (!toast) return;
            setChatOpen(true);
            setOpenConvId(toast.convId);
            dismissToast();
          }}
        />

        <SideRail
          sections={screens}
          activeSection={activeSection}
          onGoTo={goTo}
          hidden={chatOpen}
          dark={onAccentBg}
        />

        <ChatDrawer
          open={chatOpen}
          transform={drawerTransform}
          scrimOpacity={scrimOpacity}
          dragging={dragX !== null}
          theme={theme}
          onScrimClick={() => setChatOpen(false)}
        >
          <ChatScreen
            theme={theme}
            onClose={() => { setChatOpen(false); setOpenConvId(null); setReveal(null); }}
            openConvId={openConvId}
            onOpenConv={handleOpenConv}
            onBackToList={() => setOpenConvId(null)}
            reveal={reveal}
            unreadByConv={unreadByConv}
          />
        </ChatDrawer>

        <div className="home-indicator"/>
      </div>
    </div>
  );
}
