import { apiClient } from '../config/api';

async function parseResponse(response, fallbackMessage) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: fallbackMessage }));
    throw new Error(error.message || fallbackMessage);
  }

  return response.json().catch(() => null);
}

export async function obtenerContactosChat() {
  const response = await apiClient.get('/api/chat/contacts');
  return parseResponse(response, 'No se pudieron cargar los contactos del chat');
}

export async function obtenerConversacionesChat() {
  const response = await apiClient.get('/api/chat/conversations');
  return parseResponse(response, 'No se pudieron cargar las conversaciones');
}

export async function crearORecuperarConversacionDirecta(userId) {
  const response = await apiClient.post('/api/chat/conversations/direct', { userId });
  return parseResponse(response, 'No se pudo abrir la conversacion');
}

export async function obtenerMensajesConversacion(conversationId) {
  const response = await apiClient.get(`/api/chat/conversations/${conversationId}/messages`);
  return parseResponse(response, 'No se pudieron cargar los mensajes');
}

export async function enviarMensajeChat(conversationId, body) {
  const response = await apiClient.post(`/api/chat/conversations/${conversationId}/messages`, { body });
  return parseResponse(response, 'No se pudo enviar el mensaje');
}

export async function marcarConversacionLeida(conversationId) {
  const response = await apiClient.put(`/api/chat/conversations/${conversationId}/read`, {});

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'No se pudo marcar la conversacion como leida' }));
    throw new Error(error.message || 'No se pudo marcar la conversacion como leida');
  }
}

export async function enviarAnuncioChat(payload) {
  const response = await apiClient.post('/api/chat/announcements', payload);
  return parseResponse(response, 'No se pudo enviar el anuncio');
}
