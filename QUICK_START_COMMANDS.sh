#!/bin/bash

# ========================================
# Mendiola Logistics - Comandos Rápidos
# ========================================
# Script con todos los comandos necesarios para publicar la app
# Copia y pega estos comandos en tu terminal

echo "🚀 Mendiola Logistics - Quick Start Guide"
echo "===================================="
echo ""

# ========================================
# 1. CONFIGURACIÓN INICIAL
# ========================================

echo "📋 PASO 1: Configuración Inicial"
echo ""

# Navegar al proyecto
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile

# Instalar dependencias (si no lo has hecho)
echo "Instalando dependencias..."
npm install

# Crear archivo .env desde template
echo "Creando archivo .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env creado. EDÍTALO con tus valores:"
  echo "   nano .env"
  echo ""
  echo "   Configura:"
  echo "   - APP_ENV=production"
  echo "   - API_BASE_URL=https://amy-backend-minutaapi.onrender.com"
  echo "   - GOOGLE_MAPS_API_KEY=tu_api_key_real"
  echo ""
else
  echo "⚠️  .env ya existe. Verifica que tenga los valores correctos:"
  echo "   cat .env"
  echo ""
fi

# ========================================
# 2. INSTALAR HERRAMIENTAS
# ========================================

echo "📦 PASO 2: Instalar Herramientas Globales"
echo ""

# Instalar EAS CLI
echo "Instalando EAS CLI..."
npm install -g eas-cli

# Verificar instalación
echo ""
echo "✅ Verificando instalaciones:"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "EAS CLI version: $(eas --version)"
echo ""

# ========================================
# 3. LOGIN EN EAS
# ========================================

echo "🔐 PASO 3: Login en Expo/EAS"
echo ""
echo "Ejecuta: eas login"
echo "Luego verifica con: eas whoami"
echo ""

# Descomentar para login automático:
# eas login

# ========================================
# 4. VERIFICAR CONFIGURACIÓN
# ========================================

echo "🔍 PASO 4: Verificar Configuración"
echo ""

# Verificar que existan archivos clave
echo "Verificando archivos de configuración..."

files_to_check=(
  "app.config.js"
  "eas.json"
  ".env.example"
  "PRIVACY_POLICY.md"
  "TERMS_OF_SERVICE.md"
  "BUILD_AND_PUBLISH_GUIDE.md"
  "ASSETS_GUIDE.md"
)

for file in "${files_to_check[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - FALTA"
  fi
done

echo ""

# ========================================
# 5. BUILDS DE PRUEBA (PREVIEW)
# ========================================

echo "🔨 PASO 5: Builds de Prueba (Opcional)"
echo ""
echo "Para probar en dispositivos antes de publicar:"
echo ""
echo "Android (APK instalable):"
echo "  eas build --platform android --profile preview"
echo ""
echo "iOS (Simulador):"
echo "  eas build --platform ios --profile development"
echo ""

# ========================================
# 6. BUILDS DE PRODUCCIÓN
# ========================================

echo "🏭 PASO 6: Builds de Producción"
echo ""
echo "Cuando estés listo para publicar:"
echo ""
echo "Android (App Bundle):"
echo "  eas build --platform android --profile production"
echo ""
echo "iOS (IPA):"
echo "  eas build --platform ios --profile production"
echo ""
echo "⏱️  Tiempo estimado: 10-25 minutos por plataforma"
echo ""

# ========================================
# 7. SUBMIT A TIENDAS
# ========================================

echo "📤 PASO 7: Submit a Tiendas"
echo ""
echo "Después de que el build termine:"
echo ""
echo "Android (Play Store):"
echo "  eas submit --platform android --latest"
echo ""
echo "iOS (App Store):"
echo "  eas submit --platform ios --latest"
echo ""

# ========================================
# 8. COMANDOS ÚTILES
# ========================================

echo "🛠️  COMANDOS ÚTILES"
echo ""
echo "Ver lista de builds:"
echo "  eas build:list"
echo ""
echo "Ver detalles de un build:"
echo "  eas build:view [BUILD_ID]"
echo ""
echo "Ver credenciales:"
echo "  eas credentials"
echo ""
echo "Publicar OTA update (sin rebuild):"
echo "  eas update --branch production --message 'Fix de bug'"
echo ""

# ========================================
# 9. ESTRUCTURA DE ARCHIVOS CREADOS
# ========================================

echo "📁 ARCHIVOS CREADOS PARA PRODUCCIÓN"
echo ""
echo "Configuración:"
echo "  ✅ app.config.js - Configuración dinámica de Expo"
echo "  ✅ eas.json - Configuración de builds"
echo "  ✅ .env.example - Template de variables de entorno"
echo "  ✅ .gitignore actualizado"
echo ""
echo "Código:"
echo "  ✅ src/config/api.js - Actualizado con variables de entorno"
echo "  ✅ src/utils/platformStyles.js - Estilos cross-platform"
echo "  ✅ src/components/SafeScreen.js - Wrapper con SafeAreaView"
echo ""
echo "Documentación:"
echo "  ✅ BUILD_AND_PUBLISH_GUIDE.md - Guía completa de publicación"
echo "  ✅ ASSETS_GUIDE.md - Guía de assets para tiendas"
echo "  ✅ PRIVACY_POLICY.md - Política de privacidad"
echo "  ✅ TERMS_OF_SERVICE.md - Términos de servicio"
echo "  ✅ README_PRODUCTION.md - README completo"
echo "  ✅ PRODUCTION_READINESS_REPORT.md - Reporte de preparación"
echo "  ✅ QUICK_START_COMMANDS.sh - Este archivo"
echo ""

# ========================================
# 10. CHECKLIST FINAL
# ========================================

echo "✅ CHECKLIST ANTES DE PUBLICAR"
echo ""
echo "Pre-Build:"
echo "  [ ] .env configurado con valores de producción"
echo "  [ ] Google Maps API key válida"
echo "  [ ] Backend en producción funcionando"
echo "  [ ] Usuarios de demo creados"
echo ""
echo "Assets (ver ASSETS_GUIDE.md):"
echo "  [✅] App Icon (1024x1024px)"
echo "  [✅] Adaptive Icon (Android)"
echo "  [ ] Feature Graphic (1024x500px) - PENDIENTE"
echo "  [ ] Screenshots Android (mínimo 2) - PENDIENTE"
echo "  [ ] Screenshots iOS (3 tamaños) - PENDIENTE (si App Store)"
echo ""
echo "Legal:"
echo "  [ ] Privacy Policy subida a sitio público"
echo "  [ ] Terms of Service subidos a sitio público"
echo "  [ ] URLs de documentos listas"
echo ""
echo "Cuentas:"
echo "  [ ] Google Play Console creada (\$25)"
echo "  [ ] Apple Developer creada (\$99/año) - si aplica"
echo ""

# ========================================
# 11. SIGUIENTE PASO
# ========================================

echo ""
echo "🎯 SIGUIENTE PASO:"
echo ""
echo "1. Editar .env con tus valores:"
echo "   nano .env"
echo ""
echo "2. Login en EAS:"
echo "   eas login"
echo ""
echo "3. Build de prueba (APK):"
echo "   eas build --platform android --profile preview"
echo ""
echo "4. Crear assets faltantes (ver ASSETS_GUIDE.md)"
echo ""
echo "5. Build de producción:"
echo "   eas build --platform android --profile production"
echo ""
echo "6. Leer guía completa:"
echo "   less BUILD_AND_PUBLISH_GUIDE.md"
echo ""
echo "=========================================="
echo "📚 DOCUMENTACIÓN COMPLETA"
echo "=========================================="
echo ""
echo "Todos los documentos están en el directorio actual:"
ls -1 *.md *.sh 2>/dev/null | sed 's/^/  📄 /'
echo ""
echo "¡Éxito con tu publicación! 🚀"
echo ""
