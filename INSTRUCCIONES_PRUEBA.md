# Instrucciones para Probar AdminApp

## 🚀 Pasos para Iniciar

### 1. Reiniciar Metro Bundler

Dado que se modificó `babel.config.js`, es **necesario** reiniciar el bundler con caché limpia:

```bash
# Detener el servidor actual si está corriendo (Ctrl+C)

# Limpiar caché y reiniciar
npm start -- --clear
```

O si prefieres ejecutar directamente en un dispositivo/simulador:

```bash
# iOS
npm run ios

# Android
npm run android
```

### 2. Iniciar Sesión

1. Abrir la aplicación
2. Iniciar sesión con credenciales de un usuario con rol `ADMIN`
3. Deberías ver el **splash screen** (Pinterest-style) durante ~1.7 segundos
4. Luego aparecerá la **StatsScreen** con fondo coral

---

## ✅ Checklist de Pruebas Básicas

### Navegación y Pantallas
- [ ] Splash screen aparece y desaparece
- [ ] StatsScreen carga con fondo coral
- [ ] Swipe vertical cambia entre 3 pantallas
- [ ] SideRail muestra pantalla activa

### Funcionalidades Principales
- [ ] ChatFAB abre ChatDrawer
- [ ] ChatDrawer se desliza y cierra con swipe
- [ ] Overlays (Scanner, Analysis, MoreDetails) abren y cierran
- [ ] Animaciones son fluidas

---

Ver checklist completo en la documentación completa.

**Fecha:** Mayo 20, 2026
