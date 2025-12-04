# 🔧 Troubleshooting - Recurrente

## ❌ Problema: No aparecen los campos de la tarjeta

### Pasos para Diagnosticar:

#### 1️⃣ Verifica las variables de entorno

Abre la terminal y verifica que las variables estén configuradas:

```bash
# Verifica que el archivo .env existe
cat .env | grep RECURRENTE

# Deberías ver algo como:
# RECURRENTE_PUBLIC_KEY=pk_test_...
# RECURRENTE_SECRET_KEY=sk_test_...
```

**Si no existen**, crea el archivo `.env`:

```bash
# En la raíz del proyecto
echo "RECURRENTE_PUBLIC_KEY=pk_test_TU_LLAVE_AQUI" >> .env
echo "RECURRENTE_SECRET_KEY=sk_test_TU_LLAVE_AQUI" >> .env
```

#### 2️⃣ Reinicia el servidor

```bash
# Detén el servidor (Ctrl+C)
# Reinicia
npm run dev
```

#### 3️⃣ Abre la consola del navegador

1. Presiona `F12` o `Cmd+Option+I` (Mac)
2. Ve a la pestaña **Console**
3. Completa el formulario de facturación
4. Haz clic en "Cargar formulario de pago"
5. **Observa los mensajes**:

**✅ Mensajes esperados (todo bien):**
```
✅ Recurrente Checkout script cargado
🔄 Inicializando Recurrente Checkout con URL: https://...
✅ Formulario de Recurrente inicializado
```

**❌ Si ves errores:**

##### Error: "Las credenciales de Recurrente no están configuradas"
**Solución**: Las variables de entorno no están cargadas
```bash
# Verifica que estén en .env
cat .env
# Reinicia el servidor
```

##### Error: "401 Unauthorized"
**Solución**: Las llaves de API son incorrectas
- Verifica que copiaste las llaves completas
- Asegúrate de usar llaves TEST (empiezan con `pk_test_` y `sk_test_`)
- Ve a https://app.recurrente.com → Configuración → Llaves API

##### Error: "400 Bad Request"
**Solución**: Error en el formato de los datos
- Abre la pestaña **Network** en DevTools
- Busca la llamada a `/api/recurrente/create-checkout`
- Revisa el **Request Payload**
- Debería ser FormData, no JSON

##### Error: "Recurrente Checkout no disponible"
**Solución**: El script no se cargó
- Verifica tu conexión a internet
- Abre: https://unpkg.com/recurrente-checkout@latest/recurrente-checkout.js
- Si no carga, intenta con otro navegador
- Revisa si hay bloqueadores de scripts (AdBlock, etc.)

#### 4️⃣ Verifica que el contenedor exista

En la consola del navegador, escribe:

```javascript
document.getElementById('recurrente-checkout-container')
```

**Debería retornar**: `<div id="recurrente-checkout-container">...</div>`

**Si retorna `null`**: El contenedor no existe
- Asegúrate de que seleccionaste "Tarjeta de Crédito/Débito"
- Refres la página

#### 5️⃣ Verifica la respuesta del servidor

En la consola del navegador, pestaña **Network**:

1. Filtra por `/create-checkout`
2. Haz clic en la llamada
3. Ve a la pestaña **Response**

**✅ Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "ch_xxxxx",
    "checkout_url": "https://app.recurrente.com/checkout-session/ch_xxxxx"
  }
}
```

**❌ Respuesta con error:**
```json
{
  "success": false,
  "message": "..."
}
```

## 🐛 Debugging Paso a Paso

### Opción 1: Verificar que el script se carga

Agrega esto en la consola del navegador:

```javascript
// Verificar que RecurrenteCheckout existe
console.log('RecurrenteCheckout disponible:', typeof window.RecurrenteCheckout !== 'undefined')

// Si existe, verificar sus métodos
if (window.RecurrenteCheckout) {
  console.log('Métodos disponibles:', Object.keys(window.RecurrenteCheckout))
}
```

### Opción 2: Cargar manualmente para probar

En la consola del navegador:

```javascript
// Cargar el script manualmente
const script = document.createElement('script')
script.src = 'https://unpkg.com/recurrente-checkout@latest/recurrente-checkout.js'
script.onload = () => console.log('Script cargado!')
document.head.appendChild(script)

// Espera 2 segundos, luego:
RecurrenteCheckout.load({
  url: 'https://app.recurrente.com/checkout-session/TU_CHECKOUT_ID_AQUI',
  onSuccess: (data) => console.log('Éxito!', data),
  onFailure: (err) => console.log('Error:', err)
})
```

## 🔍 Checklist de Verificación

- [ ] ¿Existe el archivo `.env`?
- [ ] ¿Las variables tienen el formato correcto? (pk_test_... y sk_test_...)
- [ ] ¿Reiniciaste el servidor después de crear el .env?
- [ ] ¿Completaste TODOS los campos de facturación?
- [ ] ¿Seleccionaste "Tarjeta de Crédito/Débito"?
- [ ] ¿Hiciste clic en "Cargar formulario de pago"?
- [ ] ¿La consola muestra algún error?
- [ ] ¿Tienes conexión a internet?
- [ ] ¿Hay algún bloqueador de scripts activo?

## 💡 Solución Rápida

Si nada funciona, intenta esta solución temporal:

### Plan B: Usar redirección directa

Cambia temporalmente en `payment.vue`:

```typescript
// En lugar de initializeEmbeddedCheckout
window.location.href = checkout.checkout_url
```

Esto redirigirá a la página de Recurrente (como Stripe o PayPal). Es funcional pero el usuario sale de tu página.

## 📞 Contactar Soporte

Si el problema persiste:

1. **Recurrente**: soporte@recurrente.com o Discord https://discord.gg/QhKPEkSKp2
2. Envía esta información:
   - Mensaje de error en consola
   - Screenshot de la pestaña Network
   - Versión de navegador
   - ¿Llaves TEST o LIVE?

## 🎯 Modo Debug

Para activar más logs, agrega en `payment.vue`:

```typescript
onMounted(() => {
  console.log('🔍 Debug Info:')
  console.log('- Script loaded:', isScriptLoaded.value)
  console.log('- Checkout URL:', checkoutUrl.value)
  console.log('- RecurrenteCheckout:', typeof window.RecurrenteCheckout)
  console.log('- Container exists:', !!document.getElementById('recurrente-checkout-container'))
})
```

## ✅ Verificación Final

Cuando todo funcione correctamente, deberías ver:

1. ✅ Formulario de facturación completado
2. ✅ Botón "Cargar formulario de pago" enabled
3. ✅ Al hacer clic → Loading spinner
4. ✅ Formulario de tarjeta aparece con campos:
   - Número de tarjeta
   - Nombre en tarjeta
   - Fecha de expiración
   - CVV
5. ✅ Puedes ingresar `4242 4242 4242 4242`
6. ✅ Botón de pago dentro del formulario embedido

