//  let formBienvenida = document.getElementById("form-bienvenida");
//         formBienvenida.addEventListener("submit", event => {
//             event.preventDefault();

//             let nombreUsuario = document.getElementById("bienvenida-nombre").value;

//             if(nombreUsuario.length > 0) {
//                 sessionStorage.setItem("nombreUsuario", nombreUsuario); // Guardamos el nombre de usuario
//                 window.location.href = "productos.html"; // Hacemos la redireccion
//             }
//         });
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("form-bienvenida");
    const inputNombre = document.getElementById("bienvenida-nombre");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        let nombre = inputNombre.value.trim();

        // 1️⃣ Validar que no esté vacío
        if (nombre.length === 0) {
            alert("Debes ingresar un nombre.");
            return;
        }

        // 2️⃣ Validar que solo tenga letras y números (sin ; ni símbolos)
        const regex = /^[a-zA-Z0-9]+$/;

        if (!regex.test(nombre)) {
            alert("El nombre solo puede contener letras y números. No se permiten caracteres especiales.");
            return;
        }

        // Si pasa validación
        sessionStorage.setItem("nombreUsuario", nombre);
        sessionStorage.removeItem("ticketData"); // Limpiar cualquier ticket previo
        localStorage.removeItem("carrito"); // Limpiar carrito previo

        window.location.href = "productos.html";
    });

    const adminBtn = document.getElementById("admin-boton");
    if (adminBtn) {
        adminBtn.addEventListener("click", () => {
            window.location.href = "http://localhost:3000/";
        });
    }
});
