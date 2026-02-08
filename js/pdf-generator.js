const PDFGenerator = {
  async generarReciboPDF(recibo) {
    const element = document.getElementById('recibo-preview');
    
    const options = {
      margin: 10,
      filename: `Recibo_${recibo.numeroRegistro}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    return html2pdf().set(options).from(element).save();
  },

  async generarVistaPrevia(recibo) {
    // Esta función no es necesaria para html2pdf si mostramos el elemento en pantalla,
    // pero se incluye por completitud de estructura.
    const element = document.getElementById('recibo-preview');
    // Forzar renderizado
  }
};

function enviarPorEmail_Mailto(recibo) {
  const asunto = `Recibo Registro ${recibo.numeroRegistro}`;
  const cuerpo = `SE PRETENDE QUE ESTO SEA UNA COMUNICACIÓN REALIZADA POR NOTIFICA

Estimado/a ${recibo.afiliado.nombreCompleto},

Adjunto encontrará el recibo de entrada del expediente registrado:

Número de Registro: ${recibo.numeroRegistro}
Número de Expediente: ${recibo.numeroExpediente}
Fecha: ${recibo.fechaRegistroFormato}
Delegación: ${recibo.delegacion}

Documentación registrada: ${recibo.documentos.length} documento(s)

Puede verificar este recibo en la sede electrónica del ISFAS con el código:
${recibo.codigoVerificacion}

Atentamente,
Sistema de Registro Electrónico ISFAS`;

  const mailtoLink = `mailto:${recibo.afiliado.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  window.location.href = mailtoLink;
}

function enviarPorEmail_NOTIFICA(recibo) {
    // Función auxiliar para generar contenido (mock)
    const generarContenidoNotifica = (r) => `Notificación oficial de registro ${r.numeroRegistro}`;

  // Simular envío a través de NOTIFICA
  const notificacion = {
    sistema: 'NOTIFICA',
    destinatario: recibo.afiliado.email,
    asunto: `Notificación Registro ISFAS - ${recibo.numeroRegistro}`,
    contenido: generarContenidoNotifica(recibo),
    fechaEnvio: new Date().toISOString(),
    estado: 'PENDIENTE_ENVIO'
  };
  
  // Guardar en localStorage como "enviado"
  const notificaciones = JSON.parse(localStorage.getItem('isfas_notificaciones') || '[]');
  notificaciones.push(notificacion);
  localStorage.setItem('isfas_notificaciones', JSON.stringify(notificaciones));
  
  // Mostrar confirmación
  UIManager.mostrarNotificacion('success', `Notificación enviada vía NOTIFICA a ${recibo.afiliado.email}`);
}

function mostrarInfoNOTIFICA(recibo) {
  const mensaje = `
    <div style="text-align:center;">
      <h3>Envío vía NOTIFICA</h3>
      <p>El recibo se enviará automáticamente a través del sistema NOTIFICA a:</p>
      <p><strong>${recibo.afiliado.email}</strong></p>
      <p>Estado: <span style="color:green;">✓ Programado</span></p>
      <p><small>El afiliado recibirá la notificación en las próximas 24 horas</small></p>
    </div>
  `;
  UIManager.mostrarModalGenerico('Envío NOTIFICA', mensaje);
}