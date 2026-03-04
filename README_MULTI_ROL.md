# 🔄 Sistema Multi-Rol con Cambio Instantáneo

## ✨ Funcionalidad Implementada

Se ha implementado un sistema completo de **múltiples roles por usuario** con **cambio instantáneo** sin necesidad de cerrar sesión.

### Características principales:

1. **Asignación de múltiples roles**: En el panel de "Usuarios Sistema", ahora se pueden asignar múltiples roles a un usuario (Admin, Docente, Secretario)

2. **Cambio de rol instantáneo**: Los usuarios con múltiples roles verán un botón de cambio de rol (🔄) en la barra superior, entre el botón de tema oscuro y el botón salir

3. **Menú dinámico**: El menú lateral cambia automáticamente según el rol activo

4. **Permisos por rol activo**: Las rutas protegidas verifican el rol activo actual

---

## 📋 Pasos para activar la funcionalidad

### 1️⃣ Ejecutar migración de base de datos

**IMPORTANTE**: Antes de iniciar el backend, ejecuta el script SQL de migración:

```bash
psql -U tu_usuario -d tu_base_de_datos -f MIGRATION_ROLES_ARRAY.sql
```

O copia el contenido del archivo `MIGRATION_ROLES_ARRAY.sql` y ejecútalo en tu cliente PostgreSQL (pgAdmin, DBeaver, etc.)

Este script:
- ✅ Agrega la columna `roles` (array) a la tabla `auth_user`
- ✅ Migra los datos existentes de `role` → `roles`
- ✅ Establece valores por defecto
- ⚠️ (Opcional) Elimina la columna antigua `role`

### 2️⃣ Iniciar el backend

```bash
cd rrhh-backend-v4
npm run start:dev
```

El backend ahora acepta y maneja arrays de roles en:
- Creación de usuarios
- Actualización de usuarios
- JWT tokens (incluye array de roles)

### 3️⃣ Iniciar el frontend

```bash
cd rrhh-frontend-v4
npm run dev
```

### 4️⃣ Probar la funcionalidad

1. **Login como Admin** (usuario: `admin`, contraseña: `admin123`)

2. **Ir a "Usuarios Sistema"** (menú lateral)

3. **Editar un usuario existente** o **crear uno nuevo**:
   - En el campo "Roles", ahora verás un selector múltiple con chips
   - Selecciona múltiples roles (ej: `Docente` + `Secretario`)
   - Guarda los cambios

4. **Cerrar sesión** y **entrar con el usuario multi-rol**

5. **Verás el botón de cambio de rol** (🔄) en la barra superior
   - Click en el botón muestra un menú con los roles disponibles
   - El rol activo está marcado con un chip "Activo"
   - Al seleccionar otro rol:
     - ✅ El menú lateral se actualiza instantáneamente
     - ✅ Las rutas disponibles cambian según el nuevo rol
     - ✅ El nombre de usuario muestra el rol activo actual

---

## 🎯 Casos de uso

### Ejemplo 1: Usuario Secretario + Docente

Un usuario con estos dos roles puede:
- **Modo Secretario**: Ver/editar Docentes, Servicios, Licencias, No Docente
- **Modo Docente**: Ver DDJJ, Mi Licencia
- **Cambiar entre modos** sin cerrar sesión

### Ejemplo 2: Usuario Admin

- Si tiene solo rol Admin, **NO verá el botón de cambio de rol** (no es necesario)
- Si tiene Admin + Docente, **SÍ verá el botón** para cambiar entre ambos contextos

---

## 🏗️ Arquitectura técnica

### Backend

**Entidad AuthUser** (`auth_users.entity.ts`):
```typescript
@Column('simple-array', { default: Role.Docente })
roles: string[];  // Array de roles
```

**JWT Payload** (`auth.service.ts`):
```typescript
{
  username: "usuario",
  sub: 123,
  personaId: "uuid",
  roles: ["docente", "secretario"]  // Array completo
}
```

**Endpoints compatibles**: Aceptan tanto `role` (string) como `roles` (array) para compatibilidad

---

### Frontend

**AuthContext** (`state/AuthContext.tsx`):
```typescript
type User = {
  username: string;
  roles: string[];       // Todos los roles del usuario
  activeRole: string;    // Rol activo actual
  sub: number;
  personaId?: string;
}

// Función para cambiar rol
switchRole: (role: string) => void
```

**ProtectedRoute** (`components/ProtectedRoute.tsx`):
- Verifica solo el `activeRole` (no todos los roles)
- Redirige a inicio si el rol activo no tiene permiso

**MenuConfig** (`config/menuConfig.ts`):
- Filtrado por `activeRole` en lugar de array completo

**DashboardLayout** (`layouts/DashboardLayout.tsx`):
- Botón de cambio de rol **condicional**: `{user.roles.length > 1 && ...}`
- Menú dropdown con todos los roles disponibles
- Display: `{user.username} ({user.activeRole})`

---

## 🔧 Configuración de roles en AuthUsers

**Selector múltiple** con Autocomplete de Material-UI:

```tsx
<Autocomplete
  multiple
  options={ROLE_OPTIONS}
  renderInput={(params) => <TextField {...params} label="Roles" />}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip label={option.label} {...getTagProps({ index })} />
    ))
  }
/>
```

**Grid de usuarios**: Muestra chips con todos los roles asignados

---

## 📝 Notas importantes

1. **localStorage**: El `activeRole` se persiste en `localStorage` para mantener el contexto al recargar

2. **Redirección al cambiar rol**: Al cambiar de rol, la app redirige a `/` (inicio) para refrescar el menú

3. **Compatibilidad**: El backend acepta tanto `role` (string) como `roles` (array) para mantener compatibilidad con clientes antiguos

4. **Migración de datos**: Los usuarios existentes mantienen su rol original convertido a array

5. **Usuario Admin inicial**: Creado automáticamente con `roles: ['admin']`

---

## 🐛 Troubleshooting

### El botón de cambio de rol no aparece
- Verifica que el usuario tenga **más de un rol** asignado
- Revisa la consola del navegador para errores

### Error 403 al cambiar de rol
- Verifica que la ruta esté permitida para el `activeRole`
- Revisa el array `allowedRoles` en `menuConfig.ts`

### Los roles no se guardan
- Ejecuta la migración SQL primero
- Verifica que la columna `roles` exista en la BD
- Revisa los logs del backend para errores

### El menú no se actualiza
- Verifica que `getVisibleMenuItems` use `activeRole`
- Revisa que `DashboardLayout` use `user.activeRole`

---

## 📚 Archivos modificados

### Backend
- ✅ `auth_users/auth_users.entity.ts` - Cambio de `role` a `roles[]`
- ✅ `auth_users/auth_users.service.ts` - Manejo de array de roles
- ✅ `auth_users/dto/link-user-to-persona.dto.ts` - DTO actualizado
- ✅ `auth/auth.service.ts` - JWT con array de roles
- ✅ `MIGRATION_ROLES_ARRAY.sql` - Script de migración

### Frontend
- ✅ `state/AuthContext.tsx` - Agregado `activeRole` y `switchRole()`
- ✅ `views/AuthUsers.tsx` - Selector múltiple de roles
- ✅ `layouts/DashboardLayout.tsx` - Botón de cambio de rol
- ✅ `config/menuConfig.ts` - Filtrado por `activeRole`
- ✅ `views/Home.tsx` - Uso de `activeRole`
- ✅ `components/ProtectedRoute.tsx` - Verificación de `activeRole`

---

## 🎉 Resultado final

Los usuarios con múltiples roles ahora pueden:
- ✨ **Cambiar de contexto al instante** sin cerrar sesión
- 🎯 **Ver solo el menú relevante** para el rol activo
- 🔒 **Mantener la seguridad** con permisos por rol activo
- 💾 **Persistir la selección** al recargar la página

---

¿Necesitas ajustes o tienes preguntas? ¡Estoy aquí para ayudarte! 🚀
