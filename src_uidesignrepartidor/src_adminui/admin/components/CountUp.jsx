// src/admin/components/CountUp.jsx
// Anima un número desde 0 hasta value con easing cubic-out.
// Útil para que las cifras "corran" cuando la pantalla entra a viewport.
// En RN: usar Animated.Value + listener que setState, mismo concepto.

import React, { useState, useEffect } from 'react';

export default function CountUp({ value, duration = 1200, suffix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(target)) { setN(0); return; }
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  const isInt = Number.isInteger(typeof value === 'number' ? value : parseFloat(value));
  return <>{isInt ? Math.round(n) : n.toFixed(1)}{suffix}</>;
}
