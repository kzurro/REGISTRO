const Validaciones = {
  // Validar DNI español (algoritmo letra)
  validarDNI(dni) {
    const regex = /^\d{8}[A-Za-z]$/; // acepta mayúsculas y minúsculas
    if (!regex.test(dni)) return false;

    const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
    const numero = parseInt(dni.substr(0, 8), 10);
    const letra = dni.substr(8, 1).toUpperCase(); // normaliza

    return letras[numero % 23] === letra;
  },
  /* validarDNI(dni) {
    const regex = /^\d{8}[A-Za-z]$/;
    return regex.test(dni); // Quitas la comprobación de la letra
  },*/

  // Validar Número de Afiliación
  validarNumeroAfiliacion(numero) {
    const regex = /^28\/7\d{7}$/;
    return regex.test(numero);
  },

  // Validar Número de Registro
  validarNumeroRegistro(numero) {
    const regex = /^RE-\d{3}-E-\d{2}-\d{8}$/;
    return regex.test(numero);
  },

  // Validar Número de Expediente
  validarNumeroExpediente(numero) {
    const regex = /^\d{2}[A-Z0-9]{6}\d{2}\d{6}$/;
    return regex.test(numero);
  },

  // Validar tamaño archivo (máximo 10MB)
  validarTamanoArchivo(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  },

  // Validar tipo archivo
  validarTipoArchivo(file) {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    return allowedTypes.includes(file.type);
  },

  // Generar número de registro
  generarNumeroRegistro(codigoDelegacion, ano) {
    const expedientes = StorageManager.obtenerExpedientes();
    const expedientesDelegacion = expedientes.filter((e) => e.numeroRegistro && e.numeroRegistro.includes(`RE-${codigoDelegacion}-E-${ano}`));
    const ultimoNumero = expedientesDelegacion.length;
    const nuevoNumero = String(ultimoNumero + 1).padStart(8, "0");
    return `RE-${codigoDelegacion}-E-${ano}-${nuevoNumero}`;
  },

  // Generar número de expediente
  generarNumeroExpediente(codigoDelegacion, tipoPrestacion, ano) {
    const tipoCodigo = this.obtenerCodigoTipo(tipoPrestacion);
    const expedientes = StorageManager.obtenerExpedientes();
    const expedientesTipo = expedientes.filter((e) => e.numeroExpediente && e.numeroExpediente.startsWith(`${codigoDelegacion}${tipoCodigo}${ano}`));
    const ultimoNumero = expedientesTipo.length;
    const nuevoNumero = String(ultimoNumero + 1).padStart(6, "0");
    return `${codigoDelegacion}${tipoCodigo}${ano}${nuevoNumero}`;
  },

  obtenerCodigoTipo(tipoPrestacion) {
    const codigos = {
      Ortodoncia: "ORTOD1",
      "Prótesis dental": "PROTDE",
      Oftalmología: "OFTALM",
      Fisioterapia: "FISIOP",
      Farmacia: "FARMAC",
    };
    return codigos[tipoPrestacion] || "GENERI";
  },

  // Generar código de verificación
  generarCodigoVerificacion() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let codigo = "";
    for (let i = 0; i < 20; i++) {
      codigo += chars[Math.floor(Math.random() * chars.length)];
      if ((i + 1) % 4 === 0 && i < 19) codigo += "-";
    }
    return codigo;
  },
};
