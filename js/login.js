const LoginManager = {
  login() {
    // Capturar valor del input
    const usuarioInput = document.getElementById("login-user");
    const nombreUsuario = usuarioInput.value.trim() || "Juan Español Español"; // Valor por defecto si está vacío

    // Actualizar el header con el nuevo nombre
    const headerUsername = document.getElementById("header-username");
    if (headerUsername) {
      headerUsername.textContent = `Tramitador: ${nombreUsuario}`;
    }

    // Mostrar elementos de la UI principal
    const userInfo = document.getElementById("header-user-info");
    if (userInfo) {
      userInfo.style.visibility = "visible";
      userInfo.classList.add("fade-in"); // Opcional, si existiera la animación
    }

    const breadcrumb = document.getElementById("main-breadcrumb");
    if (breadcrumb) {
      breadcrumb.style.display = "block";
    }

    // Navegar a Inicio
    navigateTo("inicio");
  },
};
