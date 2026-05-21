// src/admin/App.jsx
// Composición raíz del Admin App. Mantiene TODO el estado global:
//   - paleta + tema
//   - scroll-snap entre las 3 pantallas
//   - splash de carga (Pinterest-style, primer mount)
//   - chat drawer + reveal-circle + toast + unread counts
//   - more-details drawer (slide-from-LEFT) + reveal-circle
//   - scanner overlay (slide-from-BOTTOM)
//   - analysis panel (slide-from-RIGHT narrow)
//   - statsAnimKey para retrigger de animaciones al volver a Stats
//   - moreOpenKey para retrigger de animaciones al reabrir More Details

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { theme } from './theme';
import { REPARTIDORES } from './data';

import StatsScreen from './screens/StatsScreen';
import MonitoreoScreen from './screens/MonitoreoScreen';
import RepartidoresScreen from './screens/RepartidoresScreen';
import MoreDetailsPanel from './screens/MoreDetailsPanel';
import AnalysisPanel from './screens/AnalysisPanel';
import ScannerOverlay from './screens/ScannerOverlay';
import ChatDrawer from './screens/chat/ChatDrawer';

import StatusBar from './components/StatusBar';
import ChatFab from './components/ChatFab';
import SideRail from './components/SideRail';
import NotificationToast from './components/NotificationToast';
import Splash from './components/Splash';

const DEVICE_WIDTH = 390;

export default function App() {
  // ── Scroll-snap entre pantallas ──────────────────────────────
  const scrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState(0);
  const screens = [
    { id: 'stats', label: 'Estadísticas' },
    { id: 'mon',   label: 'Monitoreo' },
    { id: 'reps',  label: 'Repartidores' },
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

  // ── Splash de carga ──────────────────────────────────────────
  const [splashHidden, setSplashHidden] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSplashHidden(true), 1700);
    return () => clearTimeout(id);
  }, []);

  // ── Stats animations: bump key cada vez que entras a Stats ──
  const [statsAnimKey, setStatsAnimKey] = useState(0);
  useEffect(() => {
    if (activeSection === 0) setStatsAnimKey(k => k + 1);
  }, [activeSection]);

  // ── Chat state ──────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [openConvId, setOpenConvId] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [unreadByConv, setUnreadByConv] = useState({ r1: 2, r5: 1 });
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const unreadCount = Object.values(unreadByConv).reduce((a,b) => a+b, 0);

  const dismissToast = () => {
    setToast(null);
    if (toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null; }
  };

  // Demo incoming msg (borrar en prod, reemplazar por WS listener)
  useEffect(() => {
    const id = setTimeout(() => {
      if (chatOpen) return;
      const r = REPARTIDORES[0];
      setUnreadByConv(s => ({ ...s, [r.id]: (s[r.id] || 0) + 1 }));
      setToast({
        convId: r.id, name: r.name, tag: r.tag, color: r.color,
        message: 'Hubo un retraso en M110, ¿qué hago?', shown: false,
      });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setToast(t => t ? { ...t, shown: true } : null);
      }));
      toastTimerRef.current = setTimeout(() => {
        setToast(t => t ? { ...t, shown: false } : null);
        setTimeout(() => setToast(null), 400);
      }, 5000);
    }, 6500);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (chatOpen && openConvId) setUnreadByConv(s => ({ ...s, [openConvId]: 0 }));
  }, [chatOpen, openConvId]);

  // ── Chat drawer swipe ───────────────────────────────────────
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
    if (chatOpen) return `translateX(${Math.max(0, Math.min(DEVICE_WIDTH, dragX))}px)`;
    return `translateX(${DEVICE_WIDTH + Math.max(-DEVICE_WIDTH, Math.min(0, dragX))}px)`;
  }, [dragX, chatOpen]);

  const scrimOpacity = useMemo(() => {
    if (dragX === null) return chatOpen ? 1 : 0;
    if (chatOpen) return 1 - Math.max(0, Math.min(DEVICE_WIDTH, dragX)) / DEVICE_WIDTH;
    return -Math.max(-DEVICE_WIDTH, Math.min(0, dragX)) / DEVICE_WIDTH;
  }, [dragX, chatOpen]);

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

  // ── Overlays ─────────────────────────────────────────────────
  const [scannerOpen, setScannerOpen]   = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [moreOpen, setMoreOpen]         = useState(false);
  const [moreOpenKey, setMoreOpenKey]   = useState(0);
  const [moreReveal, setMoreReveal]     = useState(null);
  const deviceRef = useRef(null);

  // Apertura de Más detalles con reveal coral (cubre el slide)
  const openMoreDetails = (ev) => {
    const dRect = deviceRef.current?.getBoundingClientRect();
    const r = ev.currentTarget.getBoundingClientRect();
    const x = dRect ? r.left + r.width / 2 - dRect.left : 195;
    const y = dRect ? r.top  + r.height / 2 - dRect.top : 700;
    setMoreReveal({ color: theme.accent, x, y, ts: Date.now() });
    setMoreOpen(true);
    setMoreOpenKey(k => k + 1);
    setTimeout(() => setMoreReveal(null), 800);
  };

  const onAccentBg = activeSection === 0;     // Stats es coral
  const anyOverlayOpen = chatOpen || scannerOpen || analysisOpen || moreOpen;

  return (
    <div className="stage">
      <div className="device"
           ref={deviceRef}
           style={{ background: theme.canvas }}
           onPointerDown={onPointerDown} onPointerMove={onPointerMove}
           onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <div className="island"/>

        <div ref={scrollRef} className="snap">
          <StatsScreen key={statsAnimKey}
                       onOpenAnalysis={() => setAnalysisOpen(true)}
                       onOpenScanner={() => setScannerOpen(true)}
                       onOpenMoreDetails={openMoreDetails}/>
          <MonitoreoScreen onOpenAnalysis={() => setAnalysisOpen(true)}/>
          <RepartidoresScreen
            onCallTap={(r) => alert(`Llamando a ${r.name}…`)}
            onChatTap={(r, e) => {
              const dRect = drawerRef.current?.getBoundingClientRect();
              const rc = e.currentTarget.getBoundingClientRect();
              const x = dRect ? rc.left + rc.width/2 - dRect.left : 195;
              const y = dRect ? rc.top  + rc.height/2 - dRect.top : 200;
              setReveal({ color: r.color, x, y, ts: Date.now() });
              setChatOpen(true);
              setTimeout(() => setOpenConvId(r.id), 80);
              setUnreadByConv(s => ({ ...s, [r.id]: 0 }));
              setTimeout(() => setReveal(null), 800);
            }}/>
        </div>

        <StatusBar color={theme.ink}/>

        <ChatFab onAccentBg={onAccentBg} unreadCount={unreadCount}
                 hidden={anyOverlayOpen}
                 onPress={() => { setChatOpen(true); setOpenConvId(null); dismissToast(); }}/>

        <NotificationToast toast={toast}
                           onPress={() => {
                             if (!toast) return;
                             setChatOpen(true);
                             setOpenConvId(toast.convId);
                             dismissToast();
                           }}/>

        <SideRail sections={screens} activeSection={activeSection} onGoTo={goTo}
                  hidden={anyOverlayOpen} dark={onAccentBg}/>

        {/* Chat drawer (slide from right) */}
        <div className={`drawer-scrim ${chatOpen ? 'open' : ''}`}
             style={{ opacity: scrimOpacity, pointerEvents: chatOpen ? 'auto' : 'none' }}
             onClick={() => setChatOpen(false)}/>
        <div ref={drawerRef}
             className={`drawer ${dragX !== null ? 'dragging' : ''} ${chatOpen ? 'open' : ''}`}
             style={{ background: theme.canvas, transform: drawerTransform }}>
          <div className="drawer-handle"/>
          <ChatDrawer
            onClose={() => { setChatOpen(false); setOpenConvId(null); setReveal(null); }}
            openConvId={openConvId}
            onOpenConv={handleOpenConv}
            onBackToList={() => setOpenConvId(null)}
            unreadByConv={unreadByConv}
          />
          {/* Chat reveal va dentro del drawer porque sólo se ve cuando el drawer ya está abierto */}
          {reveal && (
            <div key={reveal.ts} className="reveal-circle" style={{
              ['--rx']: `${reveal.x}px`, ['--ry']: `${reveal.y}px`,
              background: reveal.color,
            }}/>
          )}
        </div>

        {/* Analysis panel (slide from right, narrow) */}
        <div className={`drawer-scrim ${analysisOpen ? 'open' : ''}`}
             style={{ opacity: analysisOpen ? 1 : 0, pointerEvents: analysisOpen ? 'auto' : 'none' }}
             onClick={() => setAnalysisOpen(false)}/>
        <div className={`drawer narrow ${analysisOpen ? 'open' : ''}`}
             style={{ background: theme.canvas }}>
          <AnalysisPanel onClose={() => setAnalysisOpen(false)}/>
        </div>

        <ScannerOverlay open={scannerOpen} onClose={() => setScannerOpen(false)}/>

        {/* More details drawer (slide from left) */}
        <div className={`drawer-scrim ${moreOpen ? 'open' : ''}`}
             style={{ opacity: moreOpen ? 1 : 0, pointerEvents: moreOpen ? 'auto' : 'none' }}
             onClick={() => setMoreOpen(false)}/>
        <div className={`drawer-left ${moreOpen ? 'open' : ''}`}
             style={{ background: theme.canvas }}>
          <MoreDetailsPanel
            key={moreOpenKey}
            onClose={() => setMoreOpen(false)}
            onOpenAnalysis={() => { setAnalysisOpen(true); }}
          />
        </div>

        {/* Device-level reveal — cubre TODO el device durante el slide */}
        {moreReveal && (
          <div key={moreReveal.ts} className="reveal-circle"
               style={{
                 ['--rx']: `${moreReveal.x}px`,
                 ['--ry']: `${moreReveal.y}px`,
                 background: moreReveal.color,
                 zIndex: 95,
               }}/>
        )}

        <Splash hidden={splashHidden}/>

        <div className="home-indicator"/>
      </div>
    </div>
  );
}
