# Proyecto 3: Mejora y ampliación del CRM con IndexedDB

Se ha decidido mejorar el proyecto2: [CRM con Indexed](https://github.com/danielmi5/daw2-dwec-Proyecto2)

## Funcionalidades añadidas/mejoradas

### Mejora de la interfaz de usuario y su experiencia al utilizarla
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

