# Proyecto 3: Mejora y ampliación del CRM con IndexedDB

Se ha decidido mejorar el proyecto2: [CRM con Indexed](https://github.com/danielmi5/daw2-dwec-Proyecto2)

## Funcionalidades añadidas/mejoradas

En la implementación de estas funcionalidades se ha refactorizado y optimizado el código.

### 1. Mejora de la interfaz de usuario y su experiencia al utilizarla
Se ha mejorado la interfaz de usuario respecto a la versión anterior:


- Se ha refactorizado como se muestra la lista de clientes. Se ha cambiado el uso la lista por una tabla para mejorar la legibilidad y facilitar operaciones sobre filas.
- Se han añadido elementos a la interfaz, se han cambiado los colores. Ahora, los elementos interactuables tienen animaciones, transiciones y cambian de estado al interactuar en ellos.
- Se han utilizado etiquetas semánticas para mejorar la accesibilidad.
- El proyecto es completamente responsive, lo que permite que la interfaz se adapte de manera óptima a cualquier dispositivo. Esto mejora la experiencia del usuario y garantiza una navegación fluida sin importar el tamaño de pantalla.

#### Cambios
Cambio de lista a tabla: antes los clientes se mostraban como elementos `<li>`. Ahora se utiliza una tabla para mejorar la claridad y hace más sencillo ordenar/buscar/filtrar en la siguiente funcionalidad.

Por el cambio anterior se ha refactorizado el código js:
- `fetchClients()` ha sido modificada para obtener los clientes desde IndexedDB y crear filas para cada campo.
- Los botones de editar/eliminar en cada fila conservan la lógica existente (`editClient`, `deleteClient`) pero ahora están dentro de la tabla.

Estilos y responsividad en el css:
- Variables CSS para la paleta de colores se reutilizan en la tabla, botones, fondos, etc.
- En pantallas pequeñas se reducen elementos para mejorar la legibilidad.


### 2. Nueva funcionalidad: Buscador de clientes

Se ha implementado un buscador para la tabla de clientes que permite filtrar resultados en tiempo real según distintos modos: `Cualquiera`, `ID`, `Nombre`, `Teléfono` y `Email`.

- Lee todos los clientes desde IndexedDB una sola vez y guarda los resultados en caché (`clientesCache`).
- EL buscador hace una comparación con los datos de los clientes por modo seleccionado.
- Los resultados se muestran inmediatamente en la tabla mediante la función `renderizarClientes()`.

Función principal `buscarClientes()`: filtra los clientes por caché según el modo seleccionado y el input introducido en el buscador del usuario:


Funcionalidades del buscador:
- Filtrado de los clientes usando caché: se optó por llamar `getAll()` una vez y filtrar la lista en memoria porque es la solución más simple y rápida para datasets. Permite búsquedas instantáneas.
- Modos de búsqueda: se añadieron modos para ofrecer búsquedas específicas (ID, nombre, teléfono y email) además del modo `Cualquiera` que busca en todos los campos.
- La tabla va cambiando instantáneamente cuando cambia el valor del buscador mediante el evento `input`.


### 3. Nueva funcionalidad: Exportar clientes (JSON)

Se añadió una funcionalidad para exportar todos los clientes almacenados en IndexedDB a un archivo JSON.

Funciones principales:
- `descargarJSON(contenido)` — función auxiliar que genera una data URL a partir del JSON proporcionado y fuerza la descarga creando un enlace temporal (`<a>`) y simulando un click.
- `exportarClientesJSON()` — función que lee todos los clientes desde IndexedDB (`store.getAll()`), convierte el resultado a JSON y llama a `descargarJSON()` para iniciar la descarga.

Funcionalidades:
- Lectura desde IndexedDB: `exportarClientesJSON()` abre una transacción `readonly` sobre el object store `clients` y obtiene todos los registros con `getAll()`.
- Generación del archivo: la función `descargarJSON(contenido)` construye una data URL con prefijo `data:application/json;charset=utf-8,` y aplica `encodeURIComponent` al contenido JSON antes de asignarlo a `href` del enlace temporal.
- Flujo general: `exportarClientesJSON()` obtiene los datos, los convierte a cadena JSON (con `JSON.stringify`) y delega la descarga a `descargarJSON()`.
- Nombre de archivo por defecto: `clientes.json`.
- Manejo de errores: si la base de datos no está lista o ocurre un error al leer los registros, `exportarClientesJSON()` registra el error en consola y muestra un `alert()` simple.