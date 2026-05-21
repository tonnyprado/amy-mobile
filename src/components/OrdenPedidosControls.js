import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Controles para ordenar pedidos (botones de acción).
 * Componente reutilizable que muestra acciones disponibles según el contexto.
 *
 * @param {boolean} modoReorden - Si está en modo reordenamiento
 * @param {boolean} ordenModificado - Si se modificó el orden
 * @param {boolean} guardando - Si está guardando
 * @param {Function} onToggleReorden - Callback para entrar/salir de modo reorden
 * @param {Function} onGuardar - Callback para guardar
 * @param {Function} onResetear - Callback para resetear
 */
export default function OrdenPedidosControls({
  modoReorden,
  ordenModificado,
  guardando,
  onToggleReorden,
  onGuardar,
  onResetear
}) {
  if (!modoReorden) {
    // Botón simple para activar modo reorden
    return (
      <TouchableOpacity
        style={styles.reorderButton}
        onPress={onToggleReorden}
        activeOpacity={0.7}
      >
        <View style={styles.reorderButtonContent}>
          <MaterialIcons name="reorder" size={22} color="#3b82f6" />
          <Text style={styles.reorderButtonText}>Ordenar Manualmente</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Modo reorden activo - mostrar controles
  return (
    <View style={styles.activeControls}>
      <View style={styles.activeHeader}>
        <View style={styles.activeHeaderLeft}>
          <MaterialIcons name="edit" size={20} color="#3b82f6" />
          <Text style={styles.activeHeaderText}>Modo Edición</Text>
        </View>
        <TouchableOpacity onPress={onToggleReorden} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {ordenModificado && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={onResetear}
            disabled={guardando}
          >
            <MaterialIcons name="refresh" size={20} color="#64748b" />
            <Text style={styles.resetButtonText}>Resetear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={onGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="check" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Guardar Orden</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.hint}>
        Usa las flechas ↑ ↓ para reorganizar el orden de entrega
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  reorderButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  },
  reorderButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeControls: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
    marginLeft: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  resetButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  resetButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
