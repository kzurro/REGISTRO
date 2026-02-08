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
