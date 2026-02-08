// UI Manager handles DOM manipulation
const UIManager = {
  init() {
    StorageManager.inicializarDatos();

    // Setup Docs Callback
    DocumentosManager.setCallback(() => {
      this.renderListaDocumentos("lista-documentos-nuevos");
      this.renderListaDocumentos("lista-docs-adicionales");
    });
  },

  mostrarNotificacion(tipo, mensaje) {
    const toast = document.getElementById("notification-toast");
    toast.textContent = mensaje;
    toast.className = `toast ${tipo}`; // remove hidden
    setTimeout(() => {
      toast.className = "toast hidden";
    }, 3000);
  },

  mostrarModalAfiliado(afiliado) {
    window.afiliadoTemp = afiliado; // Guardar ref temporal
    const content = document.getElementById("modal-afiliado-content");
    content.innerHTML = `
            <div class="info-row"><label>Nombre:</label> <span>${afiliado.nombreCompleto}</span></div>
            <div class="info-row"><label>DNI:</label> <span>${afiliado.dni}</span></div>
            <div class="info-row"><label>Nº Afiliación:</label> <span>${afiliado.numeroAfiliacion}</span></div>
            <div class="info-row"><label>Delegación:</label> <span>${afiliado.delegacion}</span></div>
            <div class="info-row"><label>Estado:</label> <span class="badge badge-green">${afiliado.activo ? "ACTIVO" : "BAJA"}</span></div>
        `;
    document.getElementById("modal-afiliado").classList.remove("hidden");
  },

  mostrarModalClasificacion(documento) {
    window.documentoTemp = documento;
    const select = document.getElementById("select-tipo-doc-modal");
    select.innerHTML = "";

    const tipos = StorageManager.obtenerTiposDocumentos();
    tipos.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.nombre;
      opt.textContent = t.nombre;
      select.appendChild(opt);
    });

    document.getElementById("nombre-archivo-temp").textContent = documento.nombre;
    document.getElementById("input-nombre-doc-modal").value = ""; // Reset
    document.getElementById("modal-clasificacion").classList.remove("hidden");
  },

  mostrarModalGenerico(titulo, htmlContent) {
    document.getElementById("modal-generico-titulo").textContent = titulo;
    document.getElementById("modal-generico-content").innerHTML = htmlContent;
    document.getElementById("modal-generico").classList.remove("hidden");
  },

  cerrarModal(id) {
    document.getElementById(id).classList.add("hidden");
  },

  renderListaDocumentos(elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const docs = DocumentosManager.obtenerDocumentos();
    container.innerHTML = "";

    if (docs.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay documentos adjuntos</p>';
      return;
    }

    docs.forEach((doc, index) => {
      const div = document.createElement("div");
      div.className = "doc-item";
      div.innerHTML = `
                <div class="doc-info">
                    <span style="font-size:1.5rem">📄</span>
                    <div>
                        <strong>${doc.nombre}</strong><br>
                        <small>${doc.tipo} | ${doc.tamano}</small>
                    </div>
                </div>
                <div class="doc-actions">
                    <button class="btn btn-sm btn-ghost" onclick="DocumentosManager.verDocumento(DocumentosManager.obtenerDocumentos()[${index}])">👁️</button>
                    <button class="btn btn-sm btn-ghost" style="color:var(--color-error)" onclick="DocumentosManager.eliminarDocumento(${index})">🗑️</button>
                </div>
            `;
      container.appendChild(div);
    });
  },

  mostrarRecibo(recibo) {
    window.currentRecibo = recibo; // Para las acciones del footer
    navigateTo("recibo");

    // Fill HTML
    document.getElementById("pdf-num-registro").textContent = recibo.numeroRegistro;
    document.getElementById("pdf-fecha").textContent = recibo.fechaRegistroFormato;
    document.getElementById("pdf-oficina").textContent = recibo.delegacion;

    document.getElementById("pdf-nombre").textContent = recibo.afiliado.nombreCompleto;
    document.getElementById("pdf-dni").textContent = recibo.afiliado.dni;
    document.getElementById("pdf-afiliacion").textContent = recibo.afiliado.numeroAfiliacion;
    document.getElementById("pdf-email").textContent = recibo.afiliado.email;
    document.getElementById("pdf-comunicacion").textContent = recibo.comunicacionDigital ? "DIGITAL" : "POSTAL";

    const tbody = document.getElementById("pdf-tabla-docs");
    tbody.innerHTML = "";
    recibo.documentos.forEach((d) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${d.tipo}</td><td>${d.nombre}</td>`;
      tbody.appendChild(tr);
    });
    document.getElementById("pdf-total-docs").textContent = recibo.documentos.length;
    document.getElementById("pdf-csv").textContent = recibo.codigoVerificacion;
  },

  renderTablaExpedientes(expedientes) {
    const tbody = document.getElementById("tabla-resultados-expedientes");
    tbody.innerHTML = "";

    if (expedientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No se encontraron expedientes</td></tr>';
      return;
    }

    expedientes.forEach((e) => {
      const tr = document.createElement("tr");
      let badgeClass = "badge-blue";
      if (e.estado === "Resuelto") badgeClass = "badge-green";
      if (e.estado === "Pendiente") badgeClass = "badge-orange";

      tr.innerHTML = `
                <td>${e.numeroRegistro}</td>
                <td>${e.fechaRegistroFormato}</td>
                <td>${e.tipoPrestacion}</td>
                <td><span class="badge ${badgeClass}">${e.estado}</span></td>
                <td><button class="btn btn-sm btn-outline" onclick="seleccionarExpedienteExistente('${e.numeroExpediente}')">Seleccionar</button></td>
            `;
      tbody.appendChild(tr);
    });
  },
};

// Pila de navegación (historial simple)
let navigationStack = [];

// viewId actual, opcionalmente
let currentView = "inicio";

// Global Navigation
function navigateTo(viewId) {
  // Guardar la vista actual en la pila, salvo si vamos al login
  if (currentView && currentView !== viewId && currentView !== "login") {
    navigationStack.push(currentView);
  }
  currentView = viewId;

  // Hide all
  document.querySelectorAll(".view").forEach((el) => el.classList.remove("active"));
  // Show target
  document.getElementById(`view-${viewId}`).classList.add("active");

  // Update Breadcrumb visibility
  const breadcrumbNav = document.getElementById("main-breadcrumb");
  if (viewId === "login") {
    if (breadcrumbNav) breadcrumbNav.style.display = "none";
  } else {
    if (breadcrumbNav) breadcrumbNav.style.display = "block";
  }

  // Update Breadcrumb Text
  const breadcrumbText = document.getElementById("breadcrumb-text");
  if (viewId === "inicio") breadcrumbText.textContent = "Inicio";
  else if (viewId === "nuevo-expediente") breadcrumbText.textContent = "Inicio > Nuevo Expediente";
  else if (viewId === "buscar-expediente") breadcrumbText.textContent = "Inicio > Buscar Expediente";
  else if (viewId === "recibo") breadcrumbText.textContent = "Inicio > Recibo";

  // Reset Forms if needed
  if (viewId === "nuevo-expediente") {
    // Reset logic could go here
  }
}

function navigateBackFromBreadcrumb() {
  // Sacar la última vista visitada que no sea 'inicio'
  while (navigationStack.length > 0) {
    const prev = navigationStack.pop();
    if (prev && prev !== "inicio") {
      navigateTo(prev);
      return;
    }
  }
}

function goToInicio() {
  navigateTo("inicio");
  // Clean temp data
  window.currentRecibo = null;
  window.afiliadoTemp = null;
  window.expedienteTemp = null;
  DocumentosManager.limpiarDocumentos();
}

function guardarClasificacionDocumento() {
  const tipo = document.getElementById("select-tipo-doc-modal").value;
  const nombre = document.getElementById("input-nombre-doc-modal").value.trim();

  DocumentosManager.clasificarDocumento(window.documentoTemp, tipo, nombre);
  UIManager.cerrarModal("modal-clasificacion");
}

function cambiarTabBusqueda(tipo) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  // Busca el boton clicado (el evento onclick pasa el tipo, pero necesitamos el elemento)
  event.target.classList.add("active");
  // Clear table
  document.getElementById("tabla-resultados-expedientes").innerHTML = "";
}

function seleccionarExpedienteExistente(numExp) {
  const expedientes = StorageManager.obtenerExpedientes();
  const exp = expedientes.find((e) => e.numeroExpediente === numExp);
  if (!exp) return;

  window.expedienteExistenteTemp = exp;

  const divInfo = document.getElementById("info-expediente-existente");
  divInfo.innerHTML = `
        <p><strong>Nº Registro:</strong> ${exp.numeroRegistro}</p>
        <p><strong>Prestación:</strong> ${exp.tipoPrestacion}</p>
        <p><strong>Estado:</strong> ${exp.estado}</p>
        <p><strong>Documentos actuales:</strong> ${exp.documentos.length}</p>
    `;

  DocumentosManager.limpiarDocumentos(); // Para los nuevos
  document.getElementById("detalle-expediente-existente").classList.remove("hidden");
}

function guardarDocsAdicionales() {
  const nuevos = DocumentosManager.obtenerDocumentos();
  if (nuevos.length === 0) {
    alert("No ha añadido documentos nuevos");
    return;
  }

  StorageManager.actualizarExpediente(window.expedienteExistenteTemp.numeroExpediente, nuevos);
  alert("Documentos añadidos correctamente");
  goToInicio();
}

// Inicializar app
document.addEventListener("DOMContentLoaded", () => {
  StorageManager.borrarAfiliadosCache();
  UIManager.init();
});

// para mostrar password del password
function togglePasswordVisibility() {
  const input = document.getElementById("login-pass");
  input.type = input.type === "password" ? "text" : "password";
}
