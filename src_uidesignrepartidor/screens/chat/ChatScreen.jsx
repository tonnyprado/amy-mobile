// src/screens/chat/ChatScreen.jsx
// Container que decide qué vista del chat mostrar (lista vs conversación).
// Recibe estado y handlers del padre (App.jsx) que maneja el reveal animation.

import React from 'react';
import SectionShell from '../../components/SectionShell';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import { CONVERSATIONS } from '../../data';

export default function ChatScreen({
  theme, onClose,
  openConvId, onOpenConv, onBackToList,
  reveal, unreadByConv,
}) {
  const openConv = CONVERSATIONS.find(c => c.id === openConvId);

  return (
    <SectionShell bg={theme.canvas} label="Chat" theme={theme}>
      {openConv ? (
        <ConversationView theme={theme} conv={openConv} onBack={onBackToList}/>
      ) : (
        <ConversationList
          theme={theme}
          onClose={onClose}
          onOpenConv={onOpenConv}
          unreadByConv={unreadByConv}
        />
      )}

      {/* Overlay del círculo revelador. La animación se define en
          el CSS global (.reveal-circle + @keyframes reveal-expand). */}
      {reveal && (
        <div
          key={reveal.ts}
          className="reveal-circle"
          style={{
            ['--rx']: `${reveal.x}px`,
            ['--ry']: `${reveal.y}px`,
            background: reveal.color,
          }}
        />
      )}
    </SectionShell>
  );
}
