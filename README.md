# Sistema de Registro Electrónico ISFAS (Demo)

Aplicación web tipo SPA (Single Page Application) que simula el flujo completo de un Registro Electrónico del ISFAS: identificación de afiliados, alta de expedientes, anexión de documentación y consulta posterior, utilizando datos de ejemplo cargados desde ficheros JSON.

> Nota: Es una demo funcional orientada a pruebas de interfaz y flujo, **no hay integración real con sistemas externos ni validaciones de seguridad**.

---

## Características principales

- Login simulado sin backend.
- Gestión de afiliados mock (DNI, nº afiliación, delegaciones).
- Registro de nuevos expedientes.
- Añadir documentación a expedientes existentes.
- Consulta global y detalle de expedientes.
- Generación de recibo de entrada en formato imprimible/PDF.
- Navegación tipo SPA con breadcrumb y cabecera contextual.
- Todos los datos se almacenan en `localStorage` y se **resetean al recargar**.

---

## Datos de ejemplo y almacenamiento

Al iniciar la aplicación, se cargan los ficheros JSON y se copian a `localStorage` a través de `StorageManager.inicializarDatos`:

- `afiliados.json`: listado de afiliados con:
  - `dni`, `numeroAfiliacion`, nombre y apellidos, email, teléfono.
  - Delegación (`delegacion`, `codigoDelegacion`) y estado `activo` (alta/baja).[file:129]
- `expedientes.json`: expedientes asociados a afiliados vía `afiliadoId`:
  - `numeroExpediente`, `numeroRegistro`, fechas, tipo de prestación, estado, delegación.
  - Array de `documentos` con nombre, tipo, fecha, tamaño y `base64Data` (vacío en los mocks).[file:131]
- `delegaciones.json`: catálogo de delegaciones y códigos.[file:130]
- `tipos-documentos.json`: catálogo de tipos de prestación/documento.[file:132]

En el arranque se borra la clave de afiliados del `localStorage` para forzar una recarga limpia de datos en cada refresco de la página.[file:109][file:102]

**Consecuencia para las pruebas:**

- Cualquier expediente nuevo o documento añadido se conserva solo mientras la pestaña está abierta.
- Al recargar la página, los datos vuelven al estado inicial definido en los JSON.

---

## Flujo funcional

### 1. Login

- Formulario de acceso con “Usuario DICODEF” y “Contraseña”.
- No hay validación real: cualquier usuario/contraseña es aceptado.
- Al hacer login:
  - Se actualiza el nombre del tramitador en el header.
  - Se muestra la barra de breadcrumb.
  - Se navega automáticamente a la vista **Inicio**.[file:108][file:113]

### 2. Inicio

Vista de menú principal con tres tarjetas:

1. **Registrar Nuevo Expediente**
2. **Añadir Documentos a Expediente**
3. **Consultar Expedientes** (consulta global)[file:113]

Desde aquí comienza todo el flujo de negocio.

---

### 3. Registrar nuevo expediente

Ruta: tarjeta “Registrar Nuevo Expediente”.

Funcionalidades:

- **Identificación del afiliado**
  - Búsqueda por:
    - **DNI** (p.ej. `92384102W`, `54855789F`, `06010030S`).[file:129]
    - **Nº Afiliación** (p.ej. `28/71234567`, `28/79876543`, `28/75544332`).[file:129]
  - Validación de:
    - Formato y letra del DNI.
    - Formato del nº de afiliación.[file:104][file:110]

- **Documentación del expediente**
  - Subida de un archivo: PDF / PNG / JPG.
  - Validaciones:
    - Tipo de archivo permitido.
    - Tamaño máximo (10 MB).[file:106][file:110]
  - Conversión a Base64 y almacenamiento temporal antes de asociarlo al expediente.[file:106]

- **Datos de prestación**
  - Selección del **tipo de prestación**:
    - Ortodoncia, Prótesis dental, Oftalmología, Fisioterapia, Farmacia.[file:132][file:113]

- **Registro y generación de identificadores**
  - Generación automática de:
    - **Número de registro** (`RE-XXX-E-26-00000NNN`) siguiendo la lógica de los mocks.[file:100][file:131]
    - **Número de expediente** (`codigoDelegacion + código prestación + año + correlativo`).[file:100][file:131]
  - Persistencia del expediente en `localStorage`.[file:103][file:109]

- **Recibo de entrada**
  - Vista de recibo con:
    - Datos del registro (nº registro, fecha, oficina, tramitador).
    - Datos del titular (afiliado).
    - Relación de documentos.
    - Código de verificación simulado.[file:98][file:113]
  - Preparado para exportar a PDF mediante librerías JS.

---

### 4. Añadir documentos a expedientes existentes

Ruta: tarjeta “Añadir Documentos”.

Funcionalidades:

- **Búsqueda de expedientes**
  - Por **DNI** del afiliado.
  - Por **Nº de afiliación**.
  - Por **Nº de registro** (p.ej. `RE-003-E-26-00000234`, `RE-002-E-26-00000101`).[file:103][file:131]

- **Selección de expediente**
  - Tabla con columnas:
    - Nº de registro, fecha, prestación, estado, acción.[file:103][file:113]
  - Botón para seleccionar un expediente y ver resumen.

- **Anexión de nueva documentación**
  - Misma lógica de subida y validación de archivos que en el alta.
  - Los nuevos documentos se añaden al array `documentos` del expediente correspondiente en `localStorage`.[file:103][file:106][file:109]

---

### 5. Consulta general de expedientes

Ruta: tarjeta “Consultar Expedientes”.

Funcionalidades:

- **Listado global**
  - Construido uniendo expedientes (`expedientes.json`) y afiliados (`afiliados.json`) para mostrar:
    - Nº registro, fecha, nombre del afiliado, DNI, tipo de prestación, estado.[file:105][file:131][file:129]

- **Filtros**
  - **Texto**:
    - Nº de registro.
    - Nombre/apellidos del afiliado.
    - DNI del afiliado.[file:105]
  - **Estado**:
    - Todos los estados.
    - Tramitación.
    - Resuelto.
    - Pendiente.[file:105][file:131]

- **Detalle de expediente**
  - Botón “Ver detalle” que lleva a una vista solo lectura del expediente:
    - Datos del registro.
    - Datos del afiliado.
    - Estado y preferencias de comunicación.
    - Documentos adjuntos.[file:105]

---

### 6. Documentos adjuntos y visualización

En las vistas de detalle:

- Lista de documentos de cada expediente, con nombre, tipo, fecha y tamaño.[file:105][file:131]
- Botón de visualización:
  - Si el documento tiene `base64Data` (subido por el usuario):
    - Se abre el documento real (PDF o imagen) en nueva pestaña.[file:106]
  - Si es un documento mock sin contenido real (de los JSON):
    - Se abre una página que indica “ESTO ES UN DOCUMENTO DE PRUEBAS”.[file:105][file:131]

---

### 7. Navegación, cabecera y breadcrumb

- **Header**
  - Logos de ISFAS y Ministerio:
    - En vistas internas, llevan de vuelta a **Inicio**.
    - En la vista de login, no tienen efecto de navegación.[file:113][file:102]
  - Información de usuario:
    - “Tramitador: [nombre]”.
    - Botón “Cerrar sesión” con icono de salida que vuelve a la vista de login.[file:113][file:102]

- **Breadcrumb**
  - Muestra la ruta actual (Inicio, Inicio > Nuevo Expediente, etc.).[file:102][file:113]
  - Es clicable y permite volver a la vista anterior sin pasar por la pantalla de login, mediante una pequeña pila de navegación interna.[file:102]

---

## Limitaciones conocidas

- No hay autenticación real ni control de permisos.
- No hay backend: todo se ejecuta en el navegador con `localStorage`.
- Los documentos de ejemplo (`base64Data` vacío en los JSON) no contienen contenido real; se sustituye por una página de texto de prueba.
- Cada recarga pierde cualquier alta o modificación realizada.

---

## Resumen Técnico

Este proyecto está pensado como **prototipo funcional** para:

- Demostrar el flujo de trabajo de un registro electrónico orientado a prestaciones sanitarias del ISFAS.
- Probar interacciones de usuario (búsqueda, alta, adjuntar documentación, consulta).
- Servir como base para futuras integraciones con servicios reales (APIs, bases de datos, sistemas de autenticación).

Es ideal para demos, pruebas de usabilidad y como punto de partida para un desarrollo más completo.



# Sistema de Registro Electrónico ISFAS

Aplicación web para la gestión de registros de entrada de expedientes del ISFAS.

## Estructura del Proyecto

- `index.html`: Punto de entrada único.
- `css/`: Estilos (styles.css) y responsive (responsive.css).
- `js/`: Lógica de negocio separada por módulos (afiliados, expedientes, documentos, etc.).
- `data/`: Datos mockeados en JSON.

## Funcionalidades

1. **Gestión de Afiliados:** Búsqueda por DNI o Nº Afiliación.
2. **Registro de Expedientes:** Creación de nuevos expedientes con generación automática de números de registro.
3. **Gestión Documental:** Carga de archivos, conversión a Base64 y clasificación.
4. **Recibos:** Generación de recibo PDF con diseño oficial, firma electrónica simulada y código CSV.
5. **Comunicaciones:** Envío simulado por Email y sistema NOTIFICA.

## Instalación y Uso

1. Esta aplicación no requiere servidor backend (Node, PHP, etc.). Funciona directamente en el navegador.
2. Sin embargo, debido a las políticas de CORS de los navegadores modernos al cargar archivos JSON locales (`fetch`), se recomienda usar un servidor local simple.

### Opción A: Extension de VS Code (Live Server)
1. Abrir la carpeta del proyecto en VS Code.
2. Click derecho en `index.html` -> "Open with Live Server".

### Opción B: Python
```bash
python -m http.server 8000
```
Luego abrir `http://localhost:8000` en el navegador.

## Tecnologías

- HTML5 / CSS3 / Vanilla JS
- jsPDF + html2pdf.js (Generación PDF)
- localStorage (Persistencia de datos)
