// src/admin/screens/chat/ChatDrawer.jsx
// Container que decide qué vista del chat mostrar (lista vs conversación).
// El reveal-circle se renderiza al nivel del device (App.jsx), NO aquí,
// para que cubra la pantalla mientras el drawer hace su slide.

import React from 'react';
import SectionShell from '../../components/SectionShell';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { theme } from '../../theme';
import { REPARTIDORES } from '../../data';

export default function ChatDrawer({
  onClose, openConvId, onOpenConv, onBackToList, unreadByConv,
}) {
  const openConv = REPARTIDORES.find(r => r.id === openConvId);
  return (
    <SectionShell bg={theme.canvas} label="Chat">
      {openConv ? (
        <ConversationView conv={openConv} onBack={onBackToList}/>
      ) : (
        <ConversationList onClose={onClose} onOpenConv={onOpenConv} unreadByConv={unreadByConv}/>
      )}
    </SectionShell>
  );
}
