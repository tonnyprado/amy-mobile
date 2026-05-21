# Repartidor App — Diseño UI/UX

App móvil para repartidores de paquetería. Esta carpeta contiene el **diseño de referencia** (HTML + React web) listo para portar a **Expo / React Native**.

> Esta es una guía técnica para que un asistente IA (Claude Code / Cursor / etc.) integre el diseño a tu proyecto Expo. Léela completa antes de empezar a portar.

---

## 📦 Estructura del repo

```
.
├── Repartidor App.html        ← Demo funcional. Ábrela para ver la UI en vivo.
├── src/
│   ├── theme.js               ← Paletas + tokens tipográficos
│   ├── data.js                ← Mock data (paradas, pedidos, conversaciones, mensajes)
│   ├── App.jsx                ← Composición raíz. Maneja todo el estado global.
│   ├── components/            ← Átomos / piezas reusables
│   │   ├── Icon.jsx
│   │   ├── Pill.jsx
│   │   ├── PkgPlaceholder.jsx
│   │   ├── SectionShell.jsx
│   │   ├── SectionHeader.jsx
│   │   ├── StatusBar.jsx      (solo demo web — en Expo se borra)
│   │   ├── SideRail.jsx
│   │   ├── ChatFab.jsx
│   │   ├── ChatDrawer.jsx
│   │   └── NotificationToast.jsx
│   └── screens/               ← Pantallas
│       ├── MapScreen.jsx
│       ├── OrdersScreen.jsx
│       ├── StatsScreen.jsx
│       └── chat/
│           ├── ChatScreen.jsx
│           ├── ConversationList.jsx
│           ├── ConversationView.jsx
│           └── MessageBubble.jsx
└── README.md (este archivo)
```

---

## 🎯 Resumen funcional

La app tiene **3 pantallas principales** apiladas verticalmente (scroll-snap) y **1 pantalla de chat** que entra como drawer desde la derecha.

```
┌──────────────────────┐
│ 01 · MAPA            │  ← Default. Mapa + ruta + próxima parada.
├──────────────────────┤
│ 02 · PEDIDOS DEL DÍA │  ← Lista filtrable, stats arriba.
├──────────────────────┤
│ 03 · ESTADÍSTICAS    │  ← Fondo color acento. Hero number + chart.
└──────────────────────┘

  + FAB chat flotante (esquina inf. derecha, todas las pantallas)
  + Drawer de chat (desliza desde la derecha)
  + Notificación tipo toast cuando llega mensaje y chat está cerrado
```

### Interacciones clave

| Gesto | Acción |
|---|---|
| Scroll vertical | Snap entre Mapa / Pedidos / Estadísticas |
| Tap a un dot en el rail derecho | Salta a esa sección |
| Tap al FAB de chat | Abre drawer con lista de conversaciones |
| Swipe ← sobre cualquier pantalla | Abre drawer de chat |
| Swipe → dentro del drawer | Cierra drawer |
| Tap al scrim oscuro | Cierra drawer |
| Tap a una conversación | Animación de círculo de color expansivo → abre conversación |
| Tap a back arrow en conversación | Vuelve a lista |
| Tap al toast de notificación | Abre drawer directo a esa conversación |
| Auto-trigger a 4.5 s | Aparece toast simulado de Tony |

---

## 🎨 Sistema de diseño

### Tipografía

- **Display / títulos grandes** → `Montserrat` (700/800)
- **Body / UI / números** → `Manrope` (400/600/700) con `font-feature-settings: 'tnum'` para tabular numbers

En Expo:
```bash
npx expo install expo-font @expo-google-fonts/montserrat @expo-google-fonts/manrope
```

```jsx
import { useFonts, Montserrat_700Bold, Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
```

### Paletas (definidas en `src/theme.js`)

| Token       | Coral (default)  | Uso |
|-------------|------------------|-----|
| `canvas`    | `#F8F4F0`        | Fondo principal |
| `surface`   | `#FFFFFF`        | Cards |
| `ink`       | `#1A1110`        | Texto / botones oscuros |
| `muted`     | `#6E5E5C`        | Texto secundario |
| `accent`    | `#FF7849`        | Acento (CTAs, route line, FAB) |
| `border`    | `rgba(0,0,0,0.07)` | Bordes sutiles |
| `mapBg`     | `#F0EBE6`        | Fondo del mapa |
| `mapLine`   | `#D2CBC3`        | Calles del mapa |
| `successFg`/`Bg` | `#0B7E3E` / `#DFF1E2` | Estados "entregado" |
| `warnBg`/`Border` | `#FFE3B8` / `#F0BE5C` | Banner de anuncio |

Hay 4 paletas precargadas (`lime`, `coral`, `violet`, `blue`). Cambiar paleta es una sola línea: `PALETTES[paletteId]`.

### Espaciado y radios

- Padding lateral estándar de pantallas: **20 px**
- Cards: `borderRadius: 16–22`, `padding: 12–18`
- Avatares: 38–46 px
- Status bar overlay: 54 px alto
- Home indicator: 30 px reservado al fondo

---

## 🧩 Componentes — referencia rápida

### `<MapScreen theme>`
Mapa fullscreen + header flotante (saludo) + timeline vertical izq. + FABs de mapa der. + card "Próxima parada" inferior. El placeholder del mapa es un SVG generado; sustituir por `react-native-maps` (MapView + Polyline + Marker).

### `<OrdersScreen theme>`
- Header con título + contador "carrito"
- Strip 4-col de stats (Total / Entregados / En ruta / Pendientes)
- Chips de filtro horizontales
- Lista vertical de cards `<OrderCard>`. La card con `status === 'enRoute'` se destaca con fondo oscuro.

### `<StatsScreen theme>`
- Fondo `theme.accent`
- Hero card oscura con número 96 px (entregas hoy) + barras semanales
- Grid 2×2 de stats (km, calificación, eficiencia, ingreso)
- Strip de logro al final

### Chat — flujo

```
ChatScreen (decide qué vista mostrar)
├── ConversationList  (lista de chats)
│   ├── header (cerrar + título + buscar)
│   ├── banner de anuncio amarillo
│   └── lista de ConversationRow
└── ConversationView  (cuando openConvId !== null)
    ├── header (back + avatar + nombre + status + llamar + menú)
    ├── lista de MessageBubble
    └── input bar (paperclip + textarea + emoji + send)
```

`<MessageBubble>` soporta 4 `kind`:
- `system` → chip centrado con borde punteado
- `announcement` → tarjeta amarilla con megáfono
- `them` → burbuja gris izquierda
- `me` → burbuja oscura derecha con check/double-check

### `<ChatFab>`
Botón circular flotante. **Importante:** invierte colores según el fondo.
- Sobre `canvas` (Mapa, Pedidos) → `bg: accent`, icono oscuro
- Sobre `accent` (Stats) → `bg: ink`, icono claro
- Halo de pulso animado
- Badge con contador (solo si `unreadCount > 0`)

### `<NotificationToast>`
Burbuja que entra desde arriba (translateY) cuando llega un mensaje y chat está cerrado. Auto-dismiss a 5 s. Tap → abre la conversación.

### `<ChatDrawer>`
Drawer absoluto que ocupa todo el device, slide desde la derecha. Recibe `transform`, `scrimOpacity` y `dragging` calculados por el padre.

---

## 🔁 Estado global (en `App.jsx`)

```js
// pantalla activa (0/1/2)
activeSection

// chat
chatOpen          // bool
openConvId        // 'tony' | 'ops' | 'karla' | null
reveal            // { color, x, y, ts } | null  (anim circular)
unreadByConv      // { tony: 2, ops: 0, karla: 0 }
toast             // { name, tag, color, message, convId, shown } | null

// drag del drawer
dragX             // number | null  (px relativos al inicio del drag)
```

---

## 🚀 Cómo portarlo a Expo / React Native

> El código de `src/` está escrito en JSX **web** (usa `<div>`, `<span>`, CSS inline). Cada archivo es traducible 1:1 a RN si sigues estas reglas:

### 1. Mapeo de primitivas

| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<span>` con texto | `<Text>` |
| `<button>` | `<Pressable>` o `<TouchableOpacity>` |
| `<input type="text">` | `<TextInput>` |
| `<section>` | `<View>` (con prop opcional para a11y) |
| `<svg>` inline | `react-native-svg` (mismas tags `Svg / Path / Circle / Rect`) |

### 2. Estilos

- En RN no existen `string` con `px` — usa **numbers**. `padding: '8px 16px'` → `paddingVertical: 8, paddingHorizontal: 16`.
- `box-shadow` → en iOS: `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius`; en Android: `elevation`.
- `background:` → `backgroundColor:`
- `border:` → `borderWidth` + `borderColor` + `borderStyle`
- `repeating-linear-gradient` / `linear-gradient` → usa `expo-linear-gradient` o un `Svg` con `pattern`.
- `transform: 'rotate(-4deg)'` → `transform: [{ rotate: '-4deg' }]`
- `gap` en flex está soportado desde RN 0.71+. Si no, usa `marginRight`/`marginBottom`.

### 3. Navegación entre pantallas

El scroll-snap CSS **no existe en RN**. Sustituye por una de estas opciones:

**Opción A — `react-native-pager-view` (recomendada para este caso):**
```jsx
<PagerView orientation="vertical" initialPage={0} onPageSelected={(e) => setActiveSection(e.nativeEvent.position)}>
  <View key="0"><MapScreen /></View>
  <View key="1"><OrdersScreen /></View>
  <View key="2"><StatsScreen /></View>
</PagerView>
```

**Opción B — FlatList paginada vertical:**
```jsx
<FlatList
  data={screens}
  pagingEnabled
  showsVerticalScrollIndicator={false}
  renderItem={({ item }) => <View style={{ height: SCREEN_HEIGHT }}>{item.Comp}</View>}
  onViewableItemsChanged={({ viewableItems }) => setActiveSection(viewableItems[0]?.index ?? 0)}
/>
```

### 4. Drawer + swipe horizontal

Reemplaza los `onPointer*` handlers + `transform: translateX()` por **`react-native-gesture-handler`** + **`react-native-reanimated`**:

```jsx
const translateX = useSharedValue(SCREEN_WIDTH);

const pan = Gesture.Pan()
  .onUpdate((e) => {
    if (chatOpen) translateX.value = Math.max(0, e.translationX);
    else          translateX.value = Math.max(0, SCREEN_WIDTH + e.translationX);
  })
  .onEnd((e) => {
    if (!chatOpen && e.translationX < -60) {
      translateX.value = withTiming(0); runOnJS(setChatOpen)(true);
    } else if (chatOpen && e.translationX > 80) {
      translateX.value = withTiming(SCREEN_WIDTH); runOnJS(setChatOpen)(false);
    } else {
      translateX.value = withTiming(chatOpen ? 0 : SCREEN_WIDTH);
    }
  });

const drawerStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

### 5. Animación de **círculo revelador**

`clip-path: circle()` **no existe en RN**. Sustitúyelo por un `<Animated.View>` circular absoluto que escala de 0 → 40:

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

// al tap:
reveal.value = 0;
reveal.value = withTiming(40, { duration: 700 });
setTimeout(() => setOpenConvId(conv.id), 80);
```

O usa **`react-native-reanimated`** + **`react-native-redash`** para un efecto idéntico.

### 6. Notificación toast

Anima `translateY` de `-100` a `0` y back. Con Reanimated:

```jsx
const tY = useSharedValue(-100);

useEffect(() => {
  if (toast?.shown) tY.value = withSpring(0, { damping: 18 });
  else              tY.value = withTiming(-100);
}, [toast?.shown]);
```

### 7. Iconos

En lugar del wrapper web de `lucide` UMD, instala:
```bash
npm i lucide-react-native react-native-svg
```
```jsx
import { MessageCircle, Search, Send } from 'lucide-react-native';
<MessageCircle size={24} color={theme.ink} strokeWidth={2.2} />
```

### 8. Mapa (placeholder SVG → mapa real)

```bash
npx expo install react-native-maps
```
```jsx
<MapView style={StyleSheet.absoluteFill} region={initialRegion}>
  <Polyline coordinates={routeCoords} strokeColor={theme.accent} strokeWidth={6}/>
  {stops.map(s => <Marker key={s.id} coordinate={s.coord} pinColor={theme.ink}/>)}
</MapView>
```

### 9. Status bar + Safe Area

```jsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

<SafeAreaView style={{ flex: 1, backgroundColor: theme.canvas }}>
  <StatusBar style="dark"/>
  ...
</SafeAreaView>
```
Borra `src/components/StatusBar.jsx` — no se usa en RN.

---

## 📋 Checklist de integración a Expo

1. [ ] Instalar dependencias: `expo-font`, `lucide-react-native`, `react-native-svg`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-pager-view`, `react-native-maps`, `react-native-safe-area-context`
2. [ ] Cargar fuentes (Montserrat + Manrope) con `expo-font` en `App.tsx` root
3. [ ] Copiar `src/theme.js` y `src/data.js` tal cual
4. [ ] Reescribir cada componente reemplazando `<div>`→`<View>`, `<span>`→`<Text>`, inline styles → `StyleSheet.create` (o mantener inline, da igual)
5. [ ] Reemplazar `<Icon>` wrapper por `lucide-react-native` directo
6. [ ] Implementar paginación vertical con `PagerView`
7. [ ] Implementar drawer con gesture handler + reanimated
8. [ ] Implementar `reveal-circle` con Animated.View escalada
9. [ ] Reemplazar el placeholder de mapa por `react-native-maps`
10. [ ] Cablear datos reales: paradas, pedidos, conversaciones, mensajes (socket / websocket / FCM para push)
11. [ ] Push notifications: cuando llega mensaje fuera del chat, **además** del toast in-app dispara `expo-notifications` para cuando la app esté en background

---

## ⚙️ Datos / API — qué necesitas del backend

| Endpoint | Devuelve | Usado por |
|---|---|---|
| `GET /me/route?date=today` | Lista de `Stop` con coords, código, status | `MapScreen` |
| `GET /orders?date=today` | Lista de `Order` con cliente, peso, status, ETA | `OrdersScreen` |
| `GET /stats/weekly` | Bars por día + agregados (km, ingreso, rating, eficiencia) | `StatsScreen` |
| `GET /conversations` | Lista de chats con último mensaje y unread | `ConversationList` |
| `GET /conversations/:id/messages` | Histórico de mensajes | `ConversationView` |
| `POST /conversations/:id/messages` | Envío de mensaje | input del chat |
| `WS /chat` | Subscripción a mensajes entrantes → emite `NotificationToast` y actualiza `unreadByConv` | global |

### Shape sugerido — `Message`

```ts
type Message = {
  id: string;
  kind: 'system' | 'them' | 'me' | 'announcement';
  text: string;
  time: string;        // ya formateado para UI ("4:57 p.m." | "ahora")
  read?: boolean;      // solo para 'me'
};
```

### Shape sugerido — `Conversation`

```ts
type Conversation = {
  id: string;
  name: string;
  role: 'Administrador' | 'Soporte 24/7' | 'Supervisor' | string;
  color: string;       // hex — usado por avatar Y por la animación reveal
  tag: string;         // 2 letras iniciales
  online: boolean;
  last: string;
  time: string;        // "4:57 p.m." | "Ayer"
};
```

---

## 🐛 Gotchas / tips

- **El `color` de cada conversación importa más de lo obvio**: se reutiliza para el avatar, el toast Y la animación circular del reveal. Asigna un color distintivo por persona en el backend.
- **El timer de 4.5 s en `App.jsx`** que dispara el toast simulado es solo demo. Bórralo o reemplázalo por el listener del WebSocket.
- **Tabular numbers**: Manrope soporta `font-variant-numeric: tabular-nums`. En RN: `style={{ fontVariant: ['tabular-nums'] }}`. Úsalo en TODOS los códigos (#A-4821), tiempos y stats.
- **El drawer debe estar SIEMPRE montado** (no destruirlo al cerrar), solo transformado. Si no, pierdes el state del input y la posición del scroll de mensajes.
- **El badge del FAB** se oculta cuando `unreadCount === 0`. Asegúrate de decrementar el unread al abrir cada conversación.
- **No hagas el scroll snap obligatorio si te impide ver una orden parcialmente** — en RN, `pagingEnabled` puede sentirse muy rígido. Considera `decelerationRate="fast"` como alternativa.

---

## 🎬 Animaciones — duraciones de referencia

| Animación | Duración | Easing |
|---|---|---|
| Drawer abrir/cerrar | 320 ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Toast in | 450 ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Toast out | 300 ms | linear |
| Reveal circle | 700 ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| FAB pulse | 2200 ms loop | ease-out |
| Typing dots | 1200 ms loop, stagger 200 ms | ease-in-out |

---

## 🙏 Prompt sugerido para tu Claude local

```
Lee este README completo y el contenido de src/. Vamos a portar este diseño
a mi proyecto Expo existente. Procede en este orden:

1. Confirma qué dependencias me faltan instalar
2. Crea el archivo de tema/colores adaptado a RN StyleSheet
3. Carga Montserrat + Manrope con expo-font
4. Migra MapScreen primero (con placeholder, antes de integrar react-native-maps)
5. Migra OrdersScreen
6. Migra StatsScreen
7. Implementa el PagerView vertical para alternar entre las 3 pantallas
8. Migra ChatDrawer con gesture handler + reanimated
9. Migra ChatScreen / ConversationList / ConversationView / MessageBubble
10. Implementa la animación reveal-circle con Animated.View + scale
11. Implementa NotificationToast con translateY
12. Conecta con mi API/WebSocket (te paso endpoints)

En cada paso muéstrame el archivo completo, NO hagas patches. Confirma
visualmente que se ve como el diseño (manda screenshot) antes de pasar al
siguiente paso.
```

¡Listo! Cualquier duda sobre un componente específico está documentada como
comentario en su archivo `.jsx`.
