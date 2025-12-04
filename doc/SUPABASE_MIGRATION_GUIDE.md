# VERTEX ERP - Guía de Migración a Supabase

## ✅ Estado de la Migración

La data demo ha sido migrada exitosamente a Supabase:

| Tabla | Registros |
|-------|-----------|
| app_users | 50 |
| invoice_clients | 20 |
| invoices | 50 |
| ecommerce_products | 20 |
| ecommerce_customers | 10 |
| ecommerce_orders | 15 |
| ecommerce_reviews | 5 |
| referrals | 5 |
| logistics_vehicles | 25 |
| demo_auth_users | 2 |
| roles | 5 |
| permissions | 10 |

---

## 🔧 Configuración del Cliente Supabase

### 1. Instalar dependencias

```bash
pnpm add @supabase/supabase-js
```

### 2. Configurar variables de entorno

En tu archivo `.env`:

```env
NUXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NUXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Crear plugin de Supabase

Crea el archivo `plugins/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  return {
    provide: {
      supabase
    }
  }
})
```

---

## 📊 Mapeo de Endpoints - Fake DB a Supabase

### USERS (app_users)

**Antes (fake-db):**
```typescript
// server/api/apps/users/index.get.ts
import { db } from '@/server/fake-db/apps/users'
return db.users
```

**Después (Supabase):**
```typescript
// server/api/apps/users/index.get.ts
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  const { data, error } = await client
    .from('app_users')
    .select('*')
    .order('id', { ascending: true })
  
  if (error) throw createError({ statusCode: 500, message: error.message })
  
  return data
})
```

### INVOICES

**Antes:**
```typescript
import { database } from '@/server/fake-db/apps/invoice'
return database
```

**Después:**
```typescript
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  const { data, error } = await client
    .from('invoices')
    .select(`
      *,
      client:invoice_clients(*)
    `)
    .order('invoice_number', { ascending: false })
  
  if (error) throw createError({ statusCode: 500, message: error.message })
  
  // Transformar para mantener compatibilidad con el frontend
  return data.map(invoice => ({
    id: invoice.invoice_number,
    issuedDate: invoice.issued_date,
    client: invoice.client,
    service: invoice.service,
    total: invoice.total,
    avatar: invoice.client?.avatar || '',
    invoiceStatus: invoice.invoice_status,
    balance: invoice.balance,
    dueDate: invoice.due_date
  }))
})
```

### ECOMMERCE PRODUCTS

```typescript
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  const { data, error } = await client
    .from('ecommerce_products')
    .select('*')
  
  if (error) throw createError({ statusCode: 500, message: error.message })
  
  return data.map(product => ({
    id: product.id,
    productName: product.product_name,
    productBrand: product.product_brand,
    category: product.category,
    stock: product.stock,
    sku: product.sku,
    price: product.price,
    qty: product.qty,
    status: product.status,
    image: product.image
  }))
})
```

### LOGISTICS VEHICLES

```typescript
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  const { data, error } = await client
    .from('logistics_vehicles')
    .select('*')
  
  if (error) throw createError({ statusCode: 500, message: error.message })
  
  return data.map(vehicle => ({
    id: vehicle.id,
    location: vehicle.location,
    startCity: vehicle.start_city,
    startCountry: vehicle.start_country,
    endCity: vehicle.end_city,
    endCountry: vehicle.end_country,
    warnings: vehicle.warnings,
    progress: vehicle.progress
  }))
})
```

---

## 🔐 Autenticación con Supabase Auth

### Migrar de demo_auth_users a Supabase Auth

Los usuarios de demo se migraron a `demo_auth_users`, pero para autenticación real, necesitas usar Supabase Auth:

```typescript
// Crear usuario en Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email: 'admin@demo.com',
  password: 'admin123',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'admin',
      avatar: '/images/avatars/avatar-1.png'
    }
  }
})
```

### Login con Supabase Auth

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@demo.com',
  password: 'admin123'
})
```

---

## 📁 Estructura de Tablas en Supabase

```
├── app_users              # Usuarios de la aplicación (50 registros)
├── demo_auth_users        # Usuarios demo para login legacy
├── invoice_clients        # Clientes para facturas (20 registros)
├── invoices              # Facturas (50 registros)
├── ecommerce_products    # Productos (20 registros)
├── ecommerce_customers   # Clientes ecommerce (10 registros)
├── ecommerce_orders      # Órdenes (15 registros)
├── ecommerce_reviews     # Reviews (5 registros)
├── referrals             # Referidos (5 registros)
├── logistics_vehicles    # Vehículos logística (25 registros)
├── roles                 # Roles del sistema (5 registros)
├── permissions           # Permisos (10 registros)
└── role_permissions      # Relación roles-permisos
```

---

## 🚀 Pasos para Completar la Migración

1. **Instalar Supabase module para Nuxt:**
   ```bash
   pnpm add @nuxtjs/supabase
   ```

2. **Configurar nuxt.config.ts:**
   ```typescript
   export default defineNuxtConfig({
     modules: ['@nuxtjs/supabase'],
     supabase: {
       redirect: false // Desactivar redirección automática
     }
   })
   ```

3. **Actualizar cada endpoint de API** para usar Supabase en lugar de fake-db

4. **Generar tipos TypeScript:**
   ```bash
   npx supabase gen types typescript --project-id tu-project-id > types/supabase.ts
   ```

5. **Configurar RLS (Row Level Security)** según tus necesidades de seguridad

---

## 📝 Queries Útiles

### Dashboard Stats
```sql
SELECT * FROM dashboard_stats;
```

### Invoices con cliente
```sql
SELECT 
  i.*,
  c.name as client_name,
  c.company as client_company,
  c.company_email
FROM invoices i
LEFT JOIN invoice_clients c ON i.client_id = c.id;
```

### Usuarios activos por rol
```sql
SELECT role, COUNT(*) 
FROM app_users 
WHERE status = 'active' 
GROUP BY role;
```

---

## ⚠️ Notas Importantes

1. **Las fechas son dinámicas**: Las fechas de las facturas se calculan relativas a la fecha actual, por lo que los datos siempre se ven "frescos".

2. **Los avatars usan rutas relativas**: Asegúrate de que las imágenes existan en `/public/images/avatars/`.

3. **Los precios en products están como strings**: Esto es para mantener compatibilidad con el frontend actual que espera `$999` en lugar de `999`.

4. **Sequence reset**: Los IDs de las tablas están configurados para continuar después del último registro insertado.

---

¿Necesitas ayuda con algo específico de la migración? 🚀
