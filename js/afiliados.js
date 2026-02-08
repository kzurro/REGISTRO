const AfiliadosManager = {
  buscar(criterio, tipo) {
    const afiliados = StorageManager.obtenerAfiliados();
    
    if (tipo === 'dni') {
      return afiliados.find(a => a.dni === criterio.toUpperCase());
    } else if (tipo === 'filiacion') {
      return afiliados.find(a => a.numeroAfiliacion === criterio);
    }
    
    return null;
  },

  validarCriterio(criterio, tipo) {
    if (tipo === 'dni') {
      return Validaciones.validarDNI(criterio);
    } else if (tipo === 'filiacion') {
      return Validaciones.validarNumeroAfiliacion(criterio);
    }
    return false;
  }
};