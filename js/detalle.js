// Redireccion a inicio si no hay usuario
let nombreUsuario = sessionStorage.getItem("nombreUsuario");
if (!nombreUsuario) {
    window.location.href = "index.html";
}

// Mostrar nombre de usuario
// const usernameDisplay = document.getElementById("username-display");
// if (usernameDisplay) {
//     usernameDisplay.textContent = nombreUsuario;
// }

const urlBase = "http://localhost:3000/api/products";
const container = document.getElementById("detalle-producto-container");

// Función para obtener el ID desde la URL
// Como es un .html estático, usaremos query params tipo ?id=1
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

let productoActual = null;

async function cargarDetalle() {
    const id = getProductId();
    if (!id) {
        container.innerHTML = "<p>Error: No se especificó un ID de producto.</p>";
        return;
    }

    try {
        const respuesta = await fetch(`${urlBase}/${id}`);
        const data = await respuesta.json();

        // El controller devuelve el producto dentro de un array debido a la compatibilidad con mysql2
        const producto = data.payload && data.payload[0] ? data.payload[0][0] || data.payload[0] : null;

        if (!producto) {
            container.innerHTML = "<p>Producto no encontrado.</p>";
            return;
        }

        productoActual = producto;

        // Lo añadimos a window.productos temporalmente para que buscarProductoPorId en carrito.js funcione
        if (!window.productos) window.productos = [];
        if (!window.productos.find(p => String(p.id) === String(producto.id))) {
            window.productos.push(producto);
        }

        renderizarDetalle(producto);
    } catch (error) {
        console.error("Error al cargar el detalle:", error);
        container.innerHTML = "<p>Hubo un error al cargar los datos del producto.</p>";
    }
}

function renderizarDetalle(producto) {
    container.innerHTML = `
        <img src="${producto.image}" alt="${producto.name}" class="detail-image">
        <div class="detail-info">
            <p class="category">${producto.category || "General"}</p>
            <h1>${producto.name}</h1>
            <p class="price">$${producto.price}</p>
            <p>Descripción: Este es un espectacular ${producto.name} disponible en nuestro autoservicio veloz.</p>
            
            <div class="detail-actions">
                <div class="qty-row">
                    <label for="qty-detail">Cantidad:</label>
                    <input id="qty-detail" class="quantity-input" type="number" min="1" value="1">
                </div>
                <button class="orange-btn" onclick="agregarAlCarritoDetalle(${producto.id})">Añadir al carrito</button>
            </div>
        </div>
    `;
}

// Función global para el botón de añadir
window.agregarAlCarritoDetalle = (id) => {
    const inputQty = document.getElementById("qty-detail");
    const qty = parseInt(inputQty ? inputQty.value : 1);

    // Si tienes una función global agregarCarrito, la llamamos:
    if (typeof window.agregarCarrito === "function") {
        window.agregarCarrito(id);
        alert(`¡ Su ${productoActual.name} fue agregado al carrito con exito!`);
    } else {
        console.error("La función agregarCarrito no está disponible");
    }
};

cargarDetalle();
