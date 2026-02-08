const StorageManager = {
  KEYS: {
    AFILIADOS: "isfas_afiliados",
    EXPEDIENTES: "isfas_expedientes",
    DELEGACIONES: "isfas_delegaciones",
    TIPOS_DOC: "isfas_tipos_documentos",
    NOTIFICACIONES: "isfas_notificaciones",
  },

  borrarAfiliadosCache() {
    localStorage.removeItem(this.KEYS.AFILIADOS);
  },

  async inicializarDatos() {
    // Verificar si localStorage está vacío
    if (!localStorage.getItem(this.KEYS.AFILIADOS)) {
      try {
        // Cargar desde JSON
        const afiliados = await fetch("./data/afiliados.json").then((r) => r.json());
        const expedientes = await fetch("./data/expedientes.json").then((r) => r.json());
        const delegaciones = await fetch("./data/delegaciones.json").then((r) => r.json());
        const tiposDoc = await fetch("./data/tipos-documentos.json").then((r) => r.json());

        // Guardar en localStorage
        localStorage.setItem(this.KEYS.AFILIADOS, JSON.stringify(afiliados));
        localStorage.setItem(this.KEYS.EXPEDIENTES, JSON.stringify(expedientes));
        localStorage.setItem(this.KEYS.DELEGACIONES, JSON.stringify(delegaciones));
        localStorage.setItem(this.KEYS.TIPOS_DOC, JSON.stringify(tiposDoc));
        console.log("Datos inicializados correctamente");
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      }
    }
  },

  obtenerAfiliados() {
    const data = localStorage.getItem(this.KEYS.AFILIADOS);
    return data ? JSON.parse(data).afiliados : [];
  },

  obtenerExpedientes() {
    const data = localStorage.getItem(this.KEYS.EXPEDIENTES);
    return data ? JSON.parse(data).expedientes : [];
  },

  obtenerTiposDocumentos() {
    const data = localStorage.getItem(this.KEYS.TIPOS_DOC);
    return data ? JSON.parse(data).tiposDocumentos : [];
  },

  guardarAfiliado(afiliado) {
    const data = JSON.parse(localStorage.getItem(this.KEYS.AFILIADOS) || '{"afiliados":[]}');
    data.afiliados.push(afiliado);
    localStorage.setItem(this.KEYS.AFILIADOS, JSON.stringify(data));
  },

  guardarExpediente(expediente) {
    const data = JSON.parse(localStorage.getItem(this.KEYS.EXPEDIENTES) || '{"expedientes":[]}');
    data.expedientes.push(expediente);
    localStorage.setItem(this.KEYS.EXPEDIENTES, JSON.stringify(data));
  },

  actualizarExpediente(numeroExpediente, nuevosDocumentos) {
    const data = JSON.parse(localStorage.getItem(this.KEYS.EXPEDIENTES));
    const expedientes = data.expedientes;
    const index = expedientes.findIndex((e) => e.numeroExpediente === numeroExpediente);
    if (index !== -1) {
      expedientes[index].documentos.push(...nuevosDocumentos);
      localStorage.setItem(this.KEYS.EXPEDIENTES, JSON.stringify(data));
      return true;
    }
    return false;
  },

  buscarPorDNI(dni) {
    return this.obtenerAfiliados().find((a) => a.dni === dni.toUpperCase());
  },

  buscarPorFiliacion(filiacion) {
    return this.obtenerAfiliados().find((a) => a.numeroAfiliacion === filiacion);
  },

  buscarExpedientesPorAfiliado(afiliadoId) {
    return this.obtenerExpedientes().filter((e) => e.afiliadoId === afiliadoId);
  },
};
