// src/components/repartidor/Icon.js
// Wrapper para iconos de lucide-react-native

import React from 'react';
import * as LucideIcons from 'lucide-react-native';

// Mapeo de nombres de iconos (snake-case a PascalCase)
const ICON_MAP = {
  'search': 'Search',
  'bell': 'Bell',
  'check': 'Check',
  'plus': 'Plus',
  'minus': 'Minus',
  'locate-fixed': 'LocateFixed',
  'layers': 'Layers',
  'route': 'Route',
  'map-pin': 'MapPin',
  'navigation': 'Navigation',
  'check-check': 'CheckCheck',
  'clock': 'Clock',
  'package': 'Package',
  'check-circle-2': 'CheckCircle2',
  'truck': 'Truck',
  'chevron-right': 'ChevronRight',
  'message-circle': 'MessageCircle',
  'send': 'Send',
  'paperclip': 'Paperclip',
  'smile': 'Smile',
  'phone': 'Phone',
  'more-vertical': 'MoreVertical',
  'x': 'X',
  'arrow-left': 'ArrowLeft',
  'megaphone': 'Volume2',
  'chevron-down': 'ChevronDown',
  'chevron-up': 'ChevronUp',
  'award': 'Award',
  'trending-up': 'TrendingUp',
  'map': 'Map',
  'star': 'Star',
  'zap': 'Zap',
  'credit-card': 'CreditCard',
  'user-round-cog': 'UserCog',
  'user': 'User',
  'mail': 'Mail',
  'log-out': 'LogOut',
  'settings': 'Settings',
};

export default function Icon({ name, size = 16, color = '#000', strokeWidth = 2.2 }) {
  const iconName = ICON_MAP[name] || name;
  const IconComponent = LucideIcons[iconName];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react-native`);
    return null;
  }

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}
