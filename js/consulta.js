const ConsultaManager = {
  expedientesCache: [],

  iniciarConsulta() {
    // Navegar a la vista
    navigateTo("consultar-global");

    // Cargar datos
    this.cargarDatos();

    // Resetear filtros
    document.getElementById("input-filtro-global").value = "";
    document.getElementById("select-filtro-estado").value = "";
  },

  cargarDatos() {
    const expedientes = StorageManager.obtenerExpedientes();
    const afiliados = StorageManager.obtenerAfiliados();

    // Enriquecer datos (Join)
    this.expedientesCache = expedientes.map((exp) => {
      const afiliado = afiliados.find((a) => a.id === exp.afiliadoId);
      return {
        ...exp,
        nombreAfiliado: afiliado ? afiliado.nombreCompleto : "Desconocido",
        dniAfiliado: afiliado ? afiliado.dni : "---",
      };
    });

    // Ordenar por fecha descendente (más reciente primero)
    this.expedientesCache.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));

    this.renderTabla(this.expedientesCache);
  },

  renderTabla(datos) {
    const tbody = document.getElementById("tabla-consulta-global");
    tbody.innerHTML = "";

    if (datos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No se encontraron registros.</td></tr>';
      return;
    }

    datos.forEach((exp) => {
      const tr = document.createElement("tr");

      let badgeClass = "badge-blue"; // Tramitación
      if (exp.estado === "Resuelto") badgeClass = "badge-green";
      if (exp.estado === "Pendiente") badgeClass = "badge-orange";

      tr.innerHTML = `
                <td><strong>${exp.numeroRegistro}</strong></td>
                <td>${exp.fechaRegistroFormato}</td>
                <td>
                    ${exp.nombreAfiliado}<br>
                    <small style="color:var(--color-text-secondary)">${exp.dniAfiliado}</small>
                </td>
                <td>${exp.tipoPrestacion}</td>
                <td><span class="badge ${badgeClass}">${exp.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="ConsultaManager.verDetalle('${exp.numeroExpediente}')">👁️ Ver Detalle</button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  },

  filtrarTabla() {
    const texto = document.getElementById("input-filtro-global").value.toLowerCase();
    const estado = document.getElementById("select-filtro-estado").value;

    const filtrados = this.expedientesCache.filter((exp) => {
      const matchTexto =
        exp.numeroRegistro.toLowerCase().includes(texto) || exp.nombreAfiliado.toLowerCase().includes(texto) || exp.dniAfiliado.toLowerCase().includes(texto);

      const matchEstado = estado === "" || exp.estado === estado;

      return matchTexto && matchEstado;
    });

    this.renderTabla(filtrados);
  },

  verDetalle(numeroExpediente) {
    const exp = this.expedientesCache.find((e) => e.numeroExpediente === numeroExpediente);
    if (!exp) return;

    this.expedienteActual = exp; // Guardar estado para poder editar después

    // Recuperar afiliado completo
    const afiliado = StorageManager.buscarPorDNI(exp.dniAfiliado) || {
      nombreCompleto: exp.nombreAfiliado,
      dni: exp.dniAfiliado,
      numeroAfiliacion: "---",
      email: "---",
    };

    // Renderizar Datos Registro
    document.getElementById("detalle-datos-registro").innerHTML = `
            <div class="info-row"><label>Nº Registro:</label> <strong>${exp.numeroRegistro}</strong></div>
            <div class="info-row"><label>Nº Expediente:</label> <span>${exp.numeroExpediente}</span></div>
            <div class="info-row"><label>Fecha Registro:</label> <span>${exp.fechaRegistroFormato}</span></div>
            <div class="info-row"><label>Tipo Prestación:</label> <span>${exp.tipoPrestacion}</span></div>
            <div class="info-row"><label>Delegación:</label> <span>${exp.delegacion} (Cod: ${exp.codigoDelegacion})</span></div>
        `;

    // Renderizar Datos Afiliado
    document.getElementById("detalle-datos-afiliado").innerHTML = `
            <div class="info-row"><label>Nombre:</label> <strong>${afiliado.nombreCompleto}</strong></div>
            <div class="info-row"><label>DNI:</label> <span>${afiliado.dni}</span></div>
            <div class="info-row"><label>Nº Afiliación:</label> <span>${afiliado.numeroAfiliacion}</span></div>
            <div class="info-row"><label>Email:</label> <span>${afiliado.email}</span></div>
            <div class="info-row"><label>Teléfono:</label> <span>${afiliado.telefono}</span></div>
        `;

    // Renderizar Estado
    let badgeClass = "badge-blue";
    if (exp.estado === "Resuelto") badgeClass = "badge-green";
    if (exp.estado === "Pendiente") badgeClass = "badge-orange";

    document.getElementById("detalle-estado").innerHTML = `
            <div class="info-row"><label>Estado Actual:</label> <span class="badge ${badgeClass}" style="font-size: 1rem;">${exp.estado}</span></div>
            <div class="info-row mt-md"><label>Preferencia Comunicación:</label> 
                <span>${exp.comunicacionDigital ? "📧 Digital (Email / Sede)" : "📭 Postal Tradicional"}</span>
            </div>
        `;

    // Renderizar Documentos (Solo lectura/visualización)
    const containerDocs = document.getElementById("detalle-lista-docs");
    containerDocs.innerHTML = "";
    if (exp.documentos.length === 0) {
      containerDocs.innerHTML = '<p class="text-small">No hay documentos adjuntos.</p>';
    } else {
      exp.documentos.forEach((doc) => {
        const div = document.createElement("div");
        div.className = "doc-item";
        div.style.background = "#f9f9f9"; // Ligeramente diferente para indicar solo lectura
        div.innerHTML = `
                    <div class="doc-info">
                        <span style="font-size:1.5rem">📄</span>
                        <div>
                            <strong>${doc.nombre}</strong><br>
                            <small>${doc.tipo} | ${doc.tamano} | ${doc.fechaFormato || "---"}</small>
                        </div>
                    </div>
                    <div class="doc-actions">
                        <button class="btn btn-sm btn-ghost" onclick='ConsultaManager.verDocumentoEnDetalle(${JSON.stringify(doc)})'>👁️ Ver</button>
                    </div>
                `;
        containerDocs.appendChild(div);
      });
    }

    // Navegar
    navigateTo("detalle-lectura");
    // Actualizar Breadcrumb manualmente para UX
    document.getElementById("breadcrumb-text").textContent = "Inicio > Consultar > Detalle Expediente";
  },

  volverAListado() {
    navigateTo("consultar-global");
  },

  verDocumentoEnDetalle(doc) {
    // Reutilizamos la lógica existente de visualizar
    DocumentosManager.verDocumento(doc);
  },
  irAAgregarDocumentacion() {
    if (!this.expedienteActual) return;

    // 1. Navegar a la vista de "Buscar Expediente" (que es donde vive la funcionalidad de añadir docs)
    navigateTo("buscar-expediente");

    // 2. Invocar la función global definida en app.js que carga el detalle para edición
    // Esto abrirá la sección #detalle-expediente-existente
    seleccionarExpedienteExistente(this.expedienteActual.numeroExpediente);

    // 3. Scroll suave hacia el área de detalle para que el usuario vea dónde está
    setTimeout(() => {
      const detalleDiv = document.getElementById("detalle-expediente-existente");
      if (detalleDiv) {
        detalleDiv.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  },
};
