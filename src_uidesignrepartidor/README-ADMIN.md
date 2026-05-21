# Panel Admin — Diseño UI/UX

App móvil para **administradores** de la empresa de paquetería. Comparte el lenguaje visual con la app del repartidor, pero las funcionalidades son distintas: monitoreo en tiempo real, lista de repartidores, estadísticas globales, chat con el equipo y un escáner de cajas (placeholder).

> Esta guía es para que tu **Claude local / Cursor** integre este diseño al mismo proyecto Expo donde ya vive la app del repartidor. Léela completa antes de portar.

---

## 📦 Estructura

```
src/admin/
├── App.jsx                       ← composición raíz; maneja TODO el estado global
├── theme.js                      ← paleta cool neutral + coral
├── data.js                       ← mock: REPARTIDORES, ADMIN_MESSAGES, STATS
├── styles.css                    ← keyframes + clases utilitarias
├── components/                   ← átomos / piezas reusables
│   ├── Icon.jsx                  · wrapper lucide
│   ├── CountUp.jsx               · número que cuenta de 0 → valor
│   ├── SectionShell.jsx          · padding para status bar + home indicator
│   ├── AdminBadge.jsx            · pill negra "PANEL ADMIN"
│   ├── Splash.jsx                · pantalla de carga estilo Pinterest
│   ├── StatusBar.jsx             · solo demo web
│   ├── SideRail.jsx              · indicador lateral de puntos
│   ├── ChatFab.jsx               · FAB de chat (color adaptativo)
│   ├── NotificationToast.jsx     · burbuja entrante desde arriba
│   ├── Pill.jsx                  · chip mini-uppercase
│   └── primitives.jsx            · Block · HeroStat · MiniBox · IntentoBox · SmallMetric
└── screens/
    ├── StatsScreen.jsx           ← 01 — Estadísticas e incidencias (FONDO CORAL)
    ├── MoreDetailsPanel.jsx      · sub-página (slide-from-LEFT)
    ├── MonitoreoScreen.jsx       ← 02 — Monitoreo en tiempo real
    ├── RepartidoresScreen.jsx    ← 03 — Lista del equipo
    ├── ScannerOverlay.jsx        · overlay full-screen (slide-from-BOTTOM)
    ├── AnalysisPanel.jsx         · panel narrow (slide-from-RIGHT)
    ├── stats/
    │   ├── RitmoCard.jsx         · banner verde/azul/rojo según ritmo
    │   ├── AlertsStrip.jsx       · pill central de alertas activas
    │   ├── IncidenciaRow.jsx     · fila con barra animada
    │   └── TopRepRow.jsx         · podio con medalla
    ├── monitoreo/
    │   ├── CriticalAlert.jsx     · banner pulsante rojo + hora LIVE
    │   ├── MetricCard.jsx        · card compacta con barra opcional
    │   └── ProgressCard.jsx      · card por repartidor con mini-stats
    └── chat/
        ├── ChatDrawer.jsx        · router lista vs conversación
        ├── ConversationList.jsx  · lista de repartidores + mensaje masivo
        ├── ConversationView.jsx  · conversación abierta (con megáfono)
        └── MessageBubble.jsx     · 4 tipos: system, them, me, announcement
```

---

## 🎯 Resumen funcional

3 pantallas verticales con scroll-snap:

```
┌──────────────────────────────┐
│ 01 · ESTADÍSTICAS E INCID.   │  ← Default. FONDO CORAL. Botón Escáner arriba.
├──────────────────────────────┤
│ 02 · MONITOREO TIEMPO REAL   │  ← Saludo + alerta crítica live + cards
├──────────────────────────────┤
│ 03 · REPARTIDORES            │  ← Lista filtrable, 3 acciones por card
└──────────────────────────────┘

  + FAB Chat (esquina inf. der., color invierte sobre coral)
  + Drawer Chat (slide-from-RIGHT) → lista repartidores → conversación
  + Drawer Más detalles (slide-from-LEFT, desde Estadísticas)
  + Panel Análisis (slide-from-RIGHT narrow)
  + Overlay Escáner (slide-from-BOTTOM, fondo navy)
  + Toast notification cuando entra mensaje de un repartidor
  + Splash de carga Pinterest-style (primer mount)
```

### Diferencias vs. app del Repartidor

| Cosa            | Repartidor                  | Admin                                       |
|-----------------|-----------------------------|---------------------------------------------|
| Pantalla 1      | Mapa de ruta                | Estadísticas e incidencias                  |
| Pantalla 2      | Pedidos del día             | Monitoreo en tiempo real                    |
| Pantalla 3      | Estadísticas personales     | Lista de repartidores                       |
| Chat            | Habla con admin/operaciones | Habla con cada repartidor + mensaje masivo  |
| Badge identity  | (ninguno)                   | Pill negra "PANEL ADMIN" en cada header     |
| Stats screen    | Stats personales            | Stats globales + tabla incidencias + tops   |
| Acciones extra  | —                           | Escáner, Análisis y sugerencias             |

### Interacciones clave

| Gesto                                     | Acción                                                                |
|-------------------------------------------|------------------------------------------------------------------------|
| Scroll vertical                            | Snap entre Stats / Monitoreo / Repartidores                            |
| Tap a dot del rail derecho                 | Salta a esa sección                                                    |
| Tap a FAB chat                             | Abre drawer con lista de repartidores                                  |
| Swipe ← sobre el device                    | Abre drawer chat                                                       |
| Swipe → dentro del drawer chat             | Cierra drawer                                                          |
| Tap a un repartidor en la lista del chat   | Reveal coral → abre conversación                                       |
| Tap a botón "Chat" en RepartidoresScreen   | Reveal con su color → abre conversación directo                        |
| Tap a "Ver más detalles" en Estadísticas   | **Reveal coral cubriendo todo** → drawer-left con Incidencias + Top    |
| Tap a icono escáner en header de Stats     | Overlay desde abajo con mensaje "No disponible en Expo Go"             |
| Tap a "Análisis y sugerencias"             | Panel narrow desde la derecha                                          |
| Toast llega a 6.5s (demo)                  | Tap → abre conversación de ese repartidor                              |
| Volver a la pantalla de Stats              | **Animaciones se repiten** (cards entrance + CountUp + barras crecen) |

---

## 🎨 Sistema de diseño

### Paleta

| Token       | Valor              | Uso                                       |
|-------------|--------------------|-------------------------------------------|
| `canvas`    | `#F1F3F5`          | Fondo principal (cool neutral)            |
| `surface`   | `#FFFFFF`          | Cards estándar                            |
| `ink`       | `#0E1116`          | Texto principal, cards oscuras            |
| `muted`     | `#5C6470`          | Texto secundario                          |
| `accent`    | `#FF7849`          | Coral — único color cálido, CTA, route    |
| `border`    | `rgba(15,23,42,.08)` | Bordes sutiles                          |
| `successFg` | `#0B7E3E`          | "Entregado"                               |
| `dangerFg`  | `#B83A22`          | Alertas críticas, ritmo lento             |
| `warnBg`    | `#FFE9B8`          | Banners de aviso (megáfono, pedidos)      |
| `infoFg`    | `#0F3A8A`          | Tag "En ruta", azul informativo           |

Card backgrounds varían — **no todo es blanco**:
- Hero stats: green-tinted, ink (dark), info-tinted
- Stats screen → fondo coral
- Más detalles → Incidencias ink, Top reps beige `#FFF6E6`, Métricas azul claro `#ECF1F8`

### Tipografía

- **Display / títulos** → `Montserrat` (700/800)
- **Body / UI / cifras** → `Manrope` (400/600/700) con `font-feature-settings: 'tnum'`

```bash
npx expo install expo-font @expo-google-fonts/montserrat @expo-google-fonts/manrope
```

### Espaciado / radios

| Pieza                | Valor              |
|----------------------|--------------------|
| Padding lateral      | 18 px              |
| Cards                | `radius 14-22 px`  |
| Avatares             | 38-46 px           |
| Status bar overlay   | 54 px              |
| Home indicator       | 30 px              |
| Botones primarios    | `radius 12-14`     |

---

## ⚙️ Estado global (App.jsx)

```js
// pantalla activa (0=stats, 1=monitoreo, 2=reps)
activeSection

// retrigger de animaciones
statsAnimKey      // bump cuando activeSection === 0
moreOpenKey       // bump cada vez que se abre Más detalles

// chat
chatOpen          // bool
openConvId        // 'r1' | 'r2' | …  | null
reveal            // { color, x, y, ts } — círculo dentro del chat drawer
unreadByConv      // { r1: 2, r5: 1 }
toast             // { name, tag, color, message, convId, shown } | null

// overlays
scannerOpen
analysisOpen
moreOpen
moreReveal        // círculo a nivel device (cubre el slide)

// drag del chat drawer
dragX             // px | null

// splash
splashHidden      // bool — se enciende a 1.7s
```

---

## ✨ Animaciones — reference rápida

| Animación          | Duración | Easing                                | Notas                                          |
|--------------------|----------|---------------------------------------|------------------------------------------------|
| card-in (entrance) | 750 ms   | `cubic-bezier(0.22, 1, 0.36, 1)`      | translateY 22px + scale 0.94 → 1               |
| bar-grow           | 1400 ms  | mismo                                 | scaleX 0 → 1 desde left                        |
| reveal-circle      | 700 ms   | mismo                                 | clip-path circle 0% → 110% → fade              |
| Pinterest splash   | 1.7 s    | hold + 0.45s fade-out                 | Logo pulsa scale 1 → 1.08                      |
| critical-pulse     | 1.8 s    | ease-in-out, loop                     | Halo rojo expandiéndose                        |
| critical-stripes   | 1.6 s    | linear, loop                          | Stripes diagonales animados                    |
| chat drawer slide  | 320 ms   | mismo                                 | translateX 100% → 0                            |
| more-details slide | 320 ms   | mismo                                 | translateX -100% → 0                           |
| scanner slide      | 420 ms   | mismo                                 | translateY 100% → 0                            |
| toast              | 450 in / 300 out | mismo / linear              | translateY -140% → 0                           |
| CountUp            | 1200 ms  | cubic-out                             | 0 → value                                      |

### El truco del **reveal-circle de "Ver más detalles"**

El círculo coral se renderiza al **nivel del device** (z-index 95), no dentro del drawer. Mientras el drawer desliza desde la izquierda (0.32s), el círculo se expande sobre TODA la pantalla (0.7s), por lo que el slide queda oculto. Cuando el círculo se disipa el drawer ya está en posición final.

El reveal del **chat** sí va dentro del drawer porque solo aparece después de que el drawer ya está abierto.

### Cómo se re-disparan animaciones en Stats

```js
// En App.jsx
useEffect(() => {
  if (activeSection === 0) setStatsAnimKey(k => k + 1);
}, [activeSection]);

// Y luego
<StatsScreen key={statsAnimKey} ... />
```

Cambiar el `key` fuerza React a **desmontar y remontar** el componente. Resultado:
- Todas las `.card-anim` re-disparan su CSS animation
- Todos los `<CountUp>` reinician desde 0
- Las `.bar-anim` crecen de nuevo

Lo mismo para `<MoreDetailsPanel key={moreOpenKey}>` — cada apertura es un nuevo mount.

---

## 🚀 Cómo integrarlo al proyecto Expo existente

Asumiendo que ya tienes la app del repartidor con `src/` montada. El admin va al lado en `src/admin/`.

### 1. Setup React Navigation

Si aún no usas un navigator raíz que decida entre repartidor / admin:

```bash
npm i @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

```jsx
// App.tsx (raíz del proyecto Expo)
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RepartidorApp from './src/App';        // existente
import AdminApp     from './src/admin/App';   // NUEVO

const Stack = createNativeStackNavigator();

export default function App() {
  // Determina rol del usuario logueado:
  const role = useAuthStore(s => s.role);  // 'repartidor' | 'admin'
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {role === 'admin'
          ? <Stack.Screen name="Admin"      component={AdminApp} />
          : <Stack.Screen name="Repartidor" component={RepartidorApp} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 2. Mapeo de primitivas (igual que repartidor)

| Web                            | React Native                                  |
|--------------------------------|------------------------------------------------|
| `<div>`                        | `<View>`                                       |
| `<span>` con texto             | `<Text>`                                       |
| `<button>`                     | `<Pressable>` o `<TouchableOpacity>`           |
| `<input type="text">`          | `<TextInput>`                                  |
| `<section>`                    | `<View>`                                       |
| `<svg>` inline                 | `react-native-svg`                             |

### 3. CSS → StyleSheet

Casi todo está en estilos inline. Para RN: convertir strings con `px` a numbers, `padding: '8px 16px'` → `paddingVertical: 8, paddingHorizontal: 16`, `box-shadow` → iOS `shadow*` + Android `elevation`.

### 4. Animaciones — adaptación a RN

| Web (CSS keyframe)   | RN equivalent                                                       |
|----------------------|----------------------------------------------------------------------|
| `card-in`            | `Animated.parallel([translateY, scale, opacity])` con stagger        |
| `bar-grow`           | `Animated.timing(width, { toValue: pct })`                           |
| `reveal-circle`      | `Animated.View` circular, escala de 0 → ~40 con opacity al final    |
| `splash-pulse`       | `Animated.loop(Animated.sequence([scale up, scale down]))`           |
| `critical-pulse`     | `Animated.loop` sobre opacity + shadow                               |
| `toast slide`        | `Animated.spring(translateY, { toValue: 0, damping: 18 })`           |
| `chat drawer swipe`  | `react-native-gesture-handler` PanGesture + `react-native-reanimated`|

**`clip-path: circle()` NO existe en RN.** Para el reveal-circle:

```jsx
const reveal = useSharedValue(0);
const circleStyle = useAnimatedStyle(() => ({
  position: 'absolute',
  width: 20, height: 20, borderRadius: 10,
  left: x - 10, top: y - 10,
  backgroundColor: convColor,
  transform: [{ scale: reveal.value }],
  opacity: interpolate(reveal.value, [0, 25, 40], [1, 1, 0]),
  pointerEvents: 'none',
}));

reveal.value = 0;
reveal.value = withTiming(40, { duration: 700 });
```

### 5. Scroll-snap vertical

CSS scroll-snap **no existe en RN**. Usa `react-native-pager-view`:

```bash
npx expo install react-native-pager-view
```

```jsx
<PagerView orientation="vertical" initialPage={0}
           onPageSelected={(e) => setActiveSection(e.nativeEvent.position)}>
  <View key="0"><StatsScreen     key={statsAnimKey} /></View>
  <View key="1"><MonitoreoScreen /></View>
  <View key="2"><RepartidoresScreen /></View>
</PagerView>
```

### 6. Iconos

```bash
npm i lucide-react-native react-native-svg
```

```jsx
import { MessageCircle, Phone, ScanLine, ChevronLeft } from 'lucide-react-native';
<MessageCircle size={24} color={theme.ink} strokeWidth={2.2} />
```

Reemplaza el wrapper `<Icon name="..."/>` por imports directos.

### 7. Splash Pinterest-style en Expo

Mejor combinar **expo-splash-screen** (splash inicial nativo) **+** un componente JS `<Splash/>` que se monta una vez en cuanto la app abre y se desvanece a 1.7s. El nativo cubre el cold start, el JS cubre la parte animada con la marca.

```bash
npx expo install expo-splash-screen
```

### 8. Drawers (chat + más detalles)

```bash
npx expo install react-native-gesture-handler react-native-reanimated
```

Patrón con Reanimated 3 (drawer izquierdo, mismo concepto para el derecho con valores invertidos):

```jsx
const tx = useSharedValue(-SCREEN_WIDTH); // closed
const pan = Gesture.Pan()
  .onUpdate(e => {
    tx.value = clamp(e.translationX + startX.value, -SCREEN_WIDTH, 0);
  })
  .onEnd(() => {
    const shouldOpen = tx.value > -SCREEN_WIDTH / 2;
    tx.value = withTiming(shouldOpen ? 0 : -SCREEN_WIDTH);
  });
```

### 9. Hora LIVE en CriticalAlert

Tal cual: `useEffect` con `setInterval(() => setNow(new Date()), 1000)`. Funciona idéntico en RN.

---

## 📋 Checklist de integración

1. [ ] Verificar que ya tienes Montserrat + Manrope cargadas (compartidas con repartidor)
2. [ ] Instalar `react-native-pager-view` si no estaba
3. [ ] Copiar `src/admin/` completo al proyecto
4. [ ] Configurar el navigator raíz para alternar entre repartidor / admin según rol
5. [ ] Migrar cada componente reemplazando `<div>` → `<View>`, `<span>` → `<Text>`, `<button>` → `<Pressable>`
6. [ ] Convertir CSS strings a numbers (px → number, color formatos OK)
7. [ ] Reemplazar `<Icon name="..."/>` por imports directos de `lucide-react-native`
8. [ ] Implementar PagerView vertical
9. [ ] Implementar drawers (chat right, más-detalles left) con gesture-handler + reanimated
10. [ ] Implementar reveal-circle con Animated.View escalada
11. [ ] Implementar splash con expo-splash-screen + JS component
12. [ ] Conectar datos reales (REPARTIDORES, mensajes, stats globales) vía API/WS
13. [ ] Push notifications con `expo-notifications` para mensajes entrantes
14. [ ] Borrar el `setTimeout` demo de toast en `App.jsx` (línea ~115) — reemplazar por listener WS

---

## 🔌 Endpoints sugeridos del backend

| Endpoint                              | Devuelve                                       | Usado por                  |
|---------------------------------------|------------------------------------------------|----------------------------|
| `GET /admin/stats?period=today`       | { successRate, delivered, assigned, … }        | StatsScreen, MoreDetails   |
| `GET /admin/incidencias?period=today` | [{ key, label, value, icon }]                  | MoreDetailsPanel           |
| `GET /admin/top-repartidores`         | [{ name, pct, delivered }]                     | MoreDetailsPanel           |
| `GET /admin/repartidores`             | [{ id, name, tag, phone, routes, status, … }]  | RepartidoresScreen, Chat   |
| `GET /admin/repartidores/:id/progress`| { total, done, route, pct }                    | MonitoreoScreen            |
| `GET /admin/conversations`            | [{ id, name, color, tag, online, unread, … }]  | ConversationList           |
| `GET /admin/conversations/:id`        | [{ kind, text, time, read }]                   | ConversationView           |
| `POST /admin/conversations/:id`       | (send) → message                               | ConversationView input     |
| `POST /admin/broadcast`               | enviar mensaje a TODOS los repartidores        | "Mensaje masivo"           |
| `WS /admin/feed`                      | mensajes entrantes, cambios de status          | NotificationToast, list    |

---

## 🐛 Gotchas

- **AdminBadge debe aparecer en TODOS los headers** del admin para diferenciar visualmente del repartidor. Si agregas pantallas nuevas, ponlo arriba del kicker.
- **El color de cada repartidor (`r.color`) se reutiliza** para el avatar Y para la animación reveal de su chat. Asigna un color distintivo por persona en el backend.
- **CountUp en RN**: usa `Animated.Value` con un `listener` que haga `setState`. Mismo principio. No uses la versión web tal cual.
- **El splash dura 1.7s**. Si tu data inicial tarda más, eleva el tiempo o haz que el splash se desvanezca cuando los datos críticos terminen de cargar (lo que sea primero).
- **El reveal de Más detalles debe estar A NIVEL DEVICE** (z-index 95), NO dentro del drawer-left, o se verá el slide.
- **Mensaje masivo** (`POST /admin/broadcast`) inserta una burbuja `kind: 'announcement'` en CADA chat. Maneja idempotencia en backend.
- El **escáner** está deliberadamente sin implementar — el placeholder explica que requiere Custom Dev Client. No lo enchufes a Expo Go.

---

## 🙏 Prompt sugerido para tu Claude local

```
Lee este README completo, src/admin/ y src/ (que ya tiene la app del
repartidor montada en RN). Vamos a integrar el Admin App al proyecto Expo
existente. Procede así:

1. Confirma dependencias faltantes
2. Configura un navigator raíz que alterne entre RepartidorApp y AdminApp
   según el rol del usuario logueado (usa mi store de auth existente)
3. Migra theme.js + data.js tal cual a RN (sólo cambia exports si hace falta)
4. Migra componentes shared (Icon, Pill, CountUp, SectionShell, AdminBadge,
   Splash, ChatFab, NotificationToast, SideRail, StatusBar, primitives)
5. Migra StatsScreen (incluye stats/ sub-componentes)
6. Migra MoreDetailsPanel
7. Migra MonitoreoScreen (incluye monitoreo/ sub-componentes)
8. Migra RepartidoresScreen
9. Migra ScannerOverlay (placeholder)
10. Migra AnalysisPanel
11. Migra chat/* (ChatDrawer, ConversationList, ConversationView, MessageBubble)
12. Migra App.jsx — orquesta TODO el estado y los overlays
13. Implementa drawers con gesture-handler + reanimated
14. Implementa reveal-circle con Animated.View scale
15. Implementa CountUp con Animated.Value
16. Conecta a mi API (te paso endpoints) y WebSocket
17. Borra el setTimeout demo en App.jsx y conecta WS para toasts

En cada paso muéstrame el archivo completo, manda screenshot del simulador
y confirma que se ve idéntico al diseño antes de pasar al siguiente.
```

¡Listo! Cada componente está documentado en su archivo `.jsx` con notas de
adaptación a RN.
