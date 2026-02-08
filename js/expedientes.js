// Variables Globales de Estado
let expedienteEnCurso = {
    afiliado: null,
    documentos: [],
    tipoPrestacion: null,
    comunicacionDigital: false
};

function buscarAfiliado() {
    const radios = document.getElementsByName('tipoBusqueda');
    let tipo = 'dni';
    for (const r of radios) { if (r.checked) type = r.value; }
    
    // Corrección lectura radio
    tipo = document.querySelector('input[name="tipoBusqueda"]:checked').value;
    
    const input = document.getElementById('input-busqueda-afiliado');
    const valor = input.value.trim();

    if (!valor) {
        UIManager.mostrarNotificacion('error', 'Introduzca un valor de búsqueda');
        return;
    }

    if (!AfiliadosManager.validarCriterio(valor, tipo)) {
        UIManager.mostrarNotificacion('error', `Formato de ${tipo === 'dni' ? 'DNI' : 'Filiación'} incorrecto`);
        return;
    }

    const afiliado = AfiliadosManager.buscar(valor, tipo);

    if (afiliado) {
        UIManager.mostrarModalAfiliado(afiliado);
    } else {
        UIManager.mostrarNotificacion('error', 'Afiliado no encontrado en la base de datos');
    }
}

function confirmarAfiliado() {
    const afiliado = window.afiliadoTemp; // Guardado por UIManager
    if (!afiliado) return;

    expedienteEnCurso.afiliado = afiliado;
    
    // UI Update
    UIManager.cerrarModal('modal-afiliado');
    
    const resumenDiv = document.getElementById('datos-afiliado-resumen');
    resumenDiv.innerHTML = `
        <p><strong>${afiliado.nombreCompleto}</strong></p>
        <p>DNI: ${afiliado.dni} | Afil: ${afiliado.numeroAfiliacion}</p>
        <p>Delegación: ${afiliado.delegacion}</p>
    `;
    
    document.getElementById('afiliado-seleccionado').classList.remove('hidden');
    
    // Activar siguientes secciones
    document.getElementById('section-documentos').classList.remove('disabled');
    document.getElementById('section-preferencias').classList.remove('disabled');
    document.getElementById('btn-registrar').classList.remove('disabled');
}

function registrarExpediente() {
    if (!expedienteEnCurso.afiliado) {
        alert("Debe identificar al afiliado");
        return;
    }

    const docs = DocumentosManager.obtenerDocumentos();
    if (docs.length === 0) {
        alert("Debe adjuntar al menos un documento");
        return;
    }

    // Recoger datos formulario
    const prestacion = document.getElementById('select-prestacion').value;
    const digital = document.getElementById('check-comunicacion-digital').checked;
    
    // Generar IDs
    const now = new Date();
    const yearCode = String(now.getFullYear()).substring(2);
    // Hardcoded delegation 03 (Madrid Este) for creation based on mockup, or use user's delegation
    const codigoDelegacion = "03"; // Mock value based on prompt reqs
    
    const numReg = Validaciones.generarNumeroRegistro(codigoDelegacion, yearCode);
    const numExp = Validaciones.generarNumeroExpediente(codigoDelegacion, prestacion, yearCode);
    
    const nuevoExpediente = {
        id: "exp" + Date.now(),
        numeroExpediente: numExp,
        numeroRegistro: numReg,
        fechaRegistro: now.toISOString(),
        fechaRegistroFormato: now.toLocaleString('es-ES'),
        afiliadoId: expedienteEnCurso.afiliado.id,
        tipoPrestacion: prestacion,
        estado: "Tramitación",
        delegacion: "Madrid Este",
        codigoDelegacion: codigoDelegacion,
        comunicacionDigital: digital,
        documentos: docs
    };

    // Guardar
    StorageManager.guardarExpediente(nuevoExpediente);
    
    // Limpiar Manager Docs
    DocumentosManager.limpiarDocumentos();

    // Preparar Recibo (Objeto combinado para PDF)
    const recibo = {
        ...nuevoExpediente,
        afiliado: expedienteEnCurso.afiliado,
        codigoVerificacion: Validaciones.generarCodigoVerificacion()
    };
    
    // Navegar a Vista Recibo
    UIManager.mostrarRecibo(recibo);
}

// Lógica para búsqueda de expedientes existentes
function buscarExpedientes() {
    const input = document.getElementById('input-busqueda-expediente');
    const valor = input.value.trim().toUpperCase();
    
    if(!valor) return;

    // Dependiendo del tab activo (variable global o class check)
    const activeTab = document.querySelector('.tab.active').innerText; // Simple check
    let resultados = [];
    const todos = StorageManager.obtenerExpedientes();

    if (activeTab.includes("DNI")) {
        // Buscar afiliado primero
        const af = StorageManager.buscarPorDNI(valor);
        if (af) {
            resultados = todos.filter(e => e.afiliadoId === af.id);
        }
    } else if (activeTab.includes("Filiación")) {
         const af = StorageManager.buscarPorFiliacion(valor);
         if (af) {
             resultados = todos.filter(e => e.afiliadoId === af.id);
         }
    } else if (activeTab.includes("Registro")) {
        resultados = todos.filter(e => e.numeroRegistro.includes(valor));
    }

    UIManager.renderTablaExpedientes(resultados);
}
