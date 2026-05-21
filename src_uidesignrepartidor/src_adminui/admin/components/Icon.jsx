// src/admin/components/Icon.jsx
// Web wrapper sobre lucide UMD. En RN usa lucide-react-native directo:
//   import { MessageCircle } from 'lucide-react-native';

import React, { useRef, useEffect } from 'react';

export default function Icon({ name, size = 18, strokeWidth = 2, color, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    const data = window.lucide.icons?.[name] || window.lucide[toPascal(name)];
    if (!data) { ref.current.innerHTML = ''; return; }
    const node = Array.isArray(data) ? data : (data.iconNode || data);
    ref.current.innerHTML = nodeToSvg(node, { size, strokeWidth, color });
  }, [name, size, strokeWidth, color]);
  return <span ref={ref} style={{
    display: 'inline-flex', width: size, height: size,
    alignItems: 'center', justifyContent: 'center',
    color: color || 'currentColor', ...style,
  }}/>;
}
function toPascal(n){ return n.split('-').map(s => s[0].toUpperCase()+s.slice(1)).join(''); }
function nodeToSvg(node, { size, strokeWidth, color }) {
  let children = '';
  if (Array.isArray(node[0]) || typeof node[0] === 'object') children = node.map(oneTag).join('');
  else if (Array.isArray(node[2])) children = node[2].map(oneTag).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color || 'currentColor'}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
}
function oneTag(c) {
  if (!Array.isArray(c)) return '';
  const [tag, attrs] = c;
  const a = Object.entries(attrs || {}).map(([k,v]) => `${k}="${v}"`).join(' ');
  return `<${tag} ${a} />`;
}
