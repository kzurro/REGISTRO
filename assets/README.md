# Assets

La aplicación carga imágenes desde CDNs o usa SVGs/Texto para los logos.
Si desea agregar logos locales:

1. Coloque `logo_isfas.png` y `logo_ministerio.png` en esta carpeta.
2. Actualice `css/styles.css` o `index.html` para apuntar a estas rutas relativas `./assets/logo_isfas.png`.

Nota: El PDF Generator usa `html2pdf.js` que renderiza el HTML tal cual. Asegúrese de que las imágenes sean accesibles o use Base64 si tiene problemas de CORS con imágenes locales sin servidor web.