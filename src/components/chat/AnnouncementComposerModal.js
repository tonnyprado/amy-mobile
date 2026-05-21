import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '../Button';

export default function AnnouncementComposerModal({
  visible,
  onClose,
  contacts,
  onSubmit,
  loading = false,
}) {
  const repartidores = useMemo(
    () => contacts.filter((contact) => contact.rol === 'REPARTIDOR'),
    [contacts]
  );

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleContact = (contactId) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(contactId)
        ? currentIds.filter((id) => id !== contactId)
        : [...currentIds, contactId]
    );
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    await onSubmit({
      titulo: title.trim(),
      mensaje: message.trim(),
      enviarATodos: sendToAll,
      userIds: sendToAll ? [] : selectedIds,
    });

    setTitle('');
    setMessage('');
    setSendToAll(true);
    setSelectedIds([]);
  };

  const disabled =
    loading ||
    !title.trim() ||
    !message.trim() ||
    (!sendToAll && selectedIds.length === 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Anuncio fuerte</Text>
                <Text style={styles.subtitle}>Se guardará dentro del chat de cada repartidor</Text>
              </View>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.close}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Mensaje"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={2000}
            />

            <TouchableOpacity style={styles.toggle} onPress={() => setSendToAll((current) => !current)}>
              <View style={[styles.checkbox, sendToAll && styles.checkboxActive]} />
              <Text style={styles.toggleText}>Enviar a todos los repartidores</Text>
            </TouchableOpacity>

            {!sendToAll && (
              <ScrollView style={styles.targets} nestedScrollEnabled>
                {repartidores.map((contact) => {
                  const selected = selectedIds.includes(contact.id);

                  return (
                    <TouchableOpacity
                      key={contact.id}
                      style={[styles.targetItem, selected && styles.targetItemActive]}
                      onPress={() => toggleContact(contact.id)}
                    >
                      <Text style={styles.targetName}>{contact.nombre}</Text>
                      <Text style={styles.targetMeta}>{contact.repartidorId || 'Sin id'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <Button
              title={loading ? 'Enviando...' : 'Enviar anuncio'}
              onPress={handleSubmit}
              disabled={disabled}
              style={styles.submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 13,
  },
  close: {
    color: '#2563eb',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94a3b8',
    marginRight: 10,
    backgroundColor: '#ffffff',
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  toggleText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  targets: {
    maxHeight: 180,
    marginBottom: 12,
  },
  targetItem: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  targetItemActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  targetName: {
    color: '#0f172a',
    fontWeight: '700',
  },
  targetMeta: {
    color: '#64748b',
    marginTop: 2,
  },
  submit: {
    marginTop: 4,
  },
});
