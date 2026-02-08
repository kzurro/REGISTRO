const DocumentosManager = {
  documentosTemporales: [],
  callbackRender: null, // Función para refrescar la UI al cambiar docs

  setCallback(fn) {
      this.callbackRender = fn;
  },

  seleccionarArchivo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.png,.jpg,.jpeg';
    input.multiple = false;
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Validar tipo y tamaño
      if (!Validaciones.validarTipoArchivo(file)) {
        alert('Solo se permiten archivos PDF, PNG o JPG');
        return;
      }
      
      if (!Validaciones.validarTamanoArchivo(file)) {
        alert('El archivo no puede superar 10 MB');
        return;
      }
      
      // Convertir a Base64
      const base64 = await this.convertirABase64(file);
      
      const documento = {
        nombre: file.name,
        nombreOriginal: file.name,
        tipo: '',
        fechaSubida: new Date().toISOString(),
        fechaFormato: new Date().toLocaleString('es-ES'),
        tamano: this.formatearTamano(file.size),
        base64Data: base64,
        clasificado: false
      };
      
      // Mostrar modal clasificación
      UIManager.mostrarModalClasificacion(documento);
    };
    
    input.click();
  },

  convertirABase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  formatearTamano(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },

  clasificarDocumento(documento, tipo, nombrePersonalizado) {
    documento.tipo = tipo;
    if (nombrePersonalizado) {
      // Mantener extensión original
      const ext = documento.nombreOriginal.split('.').pop();
      documento.nombre = nombrePersonalizado.endsWith('.' + ext) ? nombrePersonalizado : nombrePersonalizado + '.' + ext;
    }
    documento.clasificado = true;
    this.documentosTemporales.push(documento);
    
    // Trigger render
    if(this.callbackRender) this.callbackRender();
    
    return documento;
  },

  obtenerDocumentos() {
    return this.documentosTemporales;
  },

  limpiarDocumentos() {
    this.documentosTemporales = [];
    if(this.callbackRender) this.callbackRender();
  },

  eliminarDocumento(index) {
    this.documentosTemporales.splice(index, 1);
    if(this.callbackRender) this.callbackRender();
  },

  verDocumento(documento) {
    // Abrir en nueva pestaña desde Base64
    const ventana = window.open();
    if (documento.base64Data.startsWith('data:application/pdf')) {
      ventana.document.write(`<iframe width='100%' height='100%' src='${documento.base64Data}' style='border:none;'></iframe>`);
    } else {
      ventana.document.write(`<img src='${documento.base64Data}' style='max-width:100%;'/>`);
    }
  }
};