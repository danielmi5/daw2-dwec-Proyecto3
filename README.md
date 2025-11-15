# DWEC - Proyecto2

## Funcionalidades Implementadas

### Gestión de Clientes (CRUD Completo)

#### Crear Cliente
- **Formulario de alta** con tres campos: Nombre, Email y Teléfono
- **Validación en tiempo real** (evento blur) de cada campo
- **Validación de formato** mediante expresiones regulares
- **Validación de unicidad** asíncrona para email y teléfono (no permite duplicados)
- **Feedback visual** inmediato con clases CSS (input-bien/input-mal)
- **Mensajes de error** descriptivos que se actualizan dinámicamente
- **Botón de envío** habilitado solo cuando todos los campos son válidos
- **Inserción en IndexedDB** con manejo de errores y confirmación

#### Leer/Listar Clientes
- **Carga automática** de todos los clientes al abrir la aplicación
- **Visualización dinámica** en lista HTML con datos completos (ID, nombre, email, teléfono)
- **Actualización automática** de la lista tras cualquier operación CRUD

#### Editar Cliente
- **Formulario** que se abre al hacer clic en "Editar"
- **Precarga de datos** del cliente seleccionado en el formulario
- **Validación automática inicial** de todos los campos al abrir el modal
- **Validación en tiempo real** al modificar campos
- **Exclusión del cliente actual** en validaciones de unicidad (permite mantener su propio email/teléfono)
- **Botón de guardar** habilitado solo cuando los datos son válidos
- **Actualización en IndexedDB** con método `put()`
- **Botón de cancelar** para cerrar sin guardar cambios

#### Eliminar Cliente
- **Botón de eliminar** por cada cliente en la lista
- **Eliminación inmediata** de la base de datos
- **Actualización automática** de la lista tras eliminar


### Validación

#### Validación de Formato
- **Nombre:** Solo letras y espacios
- **Email:** Formato estándar de email (usuario@dominio.extension)
- **Teléfono:** Exactamente 9 dígitos numéricos

#### Validación de únicos
- **Email único:** No permite crear/editar cliente con email ya existente
- **Teléfono único:** No permite crear/editar cliente con teléfono ya existente
- **Validación asíncrona:** Consulta a IndexedDB usando Promesas
- **Exclusión en edición:** Al editar, el sistema no marca error si los datos son los mismos del cliente actual

#### Generación en la interfaz
- **Clase `input-bien`:** Borde verde cuando el campo es válido
- **Clase `input-mal`:** Borde rojo cuando hay error
- **Mensajes de error:** Texto descriptivo debajo del campo con el problema específico
- **Actualización dinámica:** Los mensajes cambian según el tipo de error

### IndexedDB

#### Base de Datos
- **Nombre:** CRM_Database
- **Versión:** 1
- **ObjectStore:** clients (con autoincrement en ID)

#### Índices
- `name` - Nombre del cliente (no único)
- `email` - Email del cliente (**único**)
- `phone` - Teléfono del cliente (**único**)

#### Transacciones
- **Readonly:** Para consultas (getAll, get)
- **Readwrite:** Para modificaciones (add, put, delete, clear)
- **Manejo de eventos:** oncomplete y onerror en todas las operaciones

### Funciones Auxiliares

#### Validación de Datos
- `comprobarNombre(nombre)` - Valida formato del nombre
- `comprobarEmail(email)` - Valida formato del email
- `comprobarTelefono(telefono)` - Valida formato del teléfono
- `comprobarEmailYaExiste(email, excluirId)` - Verifica unicidad de email
- `comprobarTelefonoYaExiste(telefono, excluirId)` - Verifica unicidad de teléfono

#### Gestión de UI
- `generarErrorInput(input, mensaje)` - Muestra mensaje de error
- `generarBienInput(input)` - Marca input como válido
- `validarInput(input, clienteId)` - Valida input completo (formato + BD)
- `activarDesactivarBtn(boton, inputs)` - Controla habilitación del botón

#### Gestión de Datos
- `fetchClients()` - Carga y muestra todos los clientes
- `mostrarForm(cliente)` - Abre formulario de edición
- `actualizarCliente(cliente, ventana)` - Guarda cambios del cliente

## Cheatsheet IndexedDB

### Base de Datos

- `indexedDB.open(nombre, version)` - Abre o crea una base de datos
- `indexedDB.deleteDatabase(nombre)` - Elimina una base de datos completa
- `request.onsuccess` - Se ejecuta cuando la operación tiene éxito
- `request.onerror` - Se ejecuta cuando hay un error
- `request.onupgradeneeded` - Se ejecuta al crear o actualizar la estructura de la BD

### ObjectStore

- `db.createObjectStore(nombre, options)` - Crea un almacén de objetos (solo en onupgradeneeded)
- `db.objectStoreNames.contains(nombre)` - Comprueba si existe un objectStore
- `objectStore.createIndex(nombre, keyPath, options)` - Crea un índice en el objectStore

**Opciones comunes:**
- `keyPath: 'id'` - Define la clave primaria
- `autoIncrement: true` - Auto-incrementa el ID
- `unique: true` - El valor debe ser único

### Transacciones

- `db.transaction(storeName, mode)` - Crea una transacción
- `transaccion.objectStore(nombre)` - Obtiene el objectStore de la transacción
- `transaccion.oncomplete` - Se ejecuta cuando la transacción se completa
- `transaccion.onerror` - Se ejecuta si hay error en la transacción

**Modos:**
- `"readonly"` - Solo lectura
- `"readwrite"` - Lectura y escritura

### Operaciones CRUD

| Operación | Método | Descripción | Modo |
|-----------|--------|-------------|------|
| **Create** | `store.add(objeto)` | Añade un nuevo registro | `readwrite` |
| **Read** | `store.get(id)` | Obtiene un registro por ID | `readonly` |
| **Read** | `store.getAll()` | Obtiene todos los registros | `readonly` |
| **Update** | `store.put(objeto)` | Actualiza o crea un registro | `readwrite` |
| **Delete** | `store.delete(id)` | Elimina un registro por ID | `readwrite` |
| **Clear** | `store.clear()` | Elimina todos los registros | `readwrite` |

### Eventos de Request

- `request.onsuccess` - Se ejecuta cuando la operación tiene éxito
- `request.onerror` - Se ejecuta cuando hay error
- `request.result` - Contiene el resultado de la operación

### Recursos

- [IndexedDB Documentación](https://developer.mozilla.org/es/docs/Web/API/IndexedDB_API)


---

## Expresiones Regulares Utilizadas

### Validación de Nombre

```javascript
const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
```

**Propósito:** Valida que el nombre contenga únicamente letras (incluyendo tildes, ñ y diéresis), mayúsculas, minúsculas y espacios.

**Componentes:**
- `^` - Inicio de la cadena
- `[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+` - Uno o más caracteres que sean:
  - `a-z` - Letras minúsculas sin tilde
  - `A-Z` - Letras mayúsculas sin tilde
  - `áéíóú` - Vocales minúsculas con tilde
  - `ÁÉÍÓÚ` - Vocales mayúsculas con tilde
  - `ñÑ` - Letra eñe (minúscula y mayúscula)
  - `üÜ` - U con diéresis (minúscula y mayúscula)
  - `\s` - Espacios en blanco
- `+` - Uno o más caracteres del conjunto anterior
- `$` - Fin de la cadena

**Casos de uso:**
- "Juan García" → **Válido**
- "María José" → **Válido**
- "Iñaki Peña" → **Válido**
- "José Ángel" → **Válido**
- "Juan123" → **NO válido** (contiene números)
- "juan@garcia" → **NO válido** (contiene @)


### Validación de Email

```javascript
const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

**Propósito:** Valida el formato correcto de una dirección de correo electrónico.

**Componentes:**
- `^` - Inicio de la cadena
- `[a-zA-Z0-9._%+-]+` - Parte local (antes del @):
  - Letras, números y caracteres especiales: `._%+-`
  - `+` - Uno o más caracteres
- `@` - Símbolo arroba (obligatorio)
- `[a-zA-Z0-9.-]+` - Dominio:
  - Letras, números, puntos y guiones
- `\.` - Punto literal (escapado)
- `[a-zA-Z]{2,}` - Extensión del dominio:
  - `{2,}` - Mínimo 2 letras (ej: .es, .com, .info)
- `$` - Fin de la cadena

**Casos de uso:**
- "usuario@example.com" → **Válido**
- "juan.garcia@empresa.es" → **Válido**
- "correo_123@dominio.info" → **Válido**
- "usuario@" → **NO válido** (falta dominio)
- "@example.com" → **NO válido** (falta parte local)
- "usuario@dominio" → **NO válido** (falta extensión)


### Validación de Teléfono

```javascript
const regex = /^[0-9]{9}$/;
```

**Propósito:** Valida que el teléfono tenga exactamente 9 dígitos numéricos (formato español).

**Componentes:**
- `^` - Inicio de la cadena
- `[0-9]` - Cualquier dígito del 0 al 9
- `{9}` - Exactamente 9 dígitos (ni más ni menos)
- `$` - Fin de la cadena

**Casos de uso:**
- "612345678" → **Válido**
- "912345678" → **Válido**
- "61234567" → **NO válido** (8 dígitos)
- "6123456789" → **NO válido** (10 dígitos)
- "612-345-678" → **NO válido** (contiene guiones)
- "612 345 678" → **NO válido** (contiene espacios)

### Como se usan

Todas las expresiones regulares se aplican usando el método `.test()`:

```javascript
regex.test(valor)  // Devuelve true o false
```

**Ejemplo de uso:**
```javascript
const regexNombre = /^[a-zA-Z\s]+$/;
regexNombre.test("Juan Garcia");  // true
regexNombre.test("Juan123");      // false
```