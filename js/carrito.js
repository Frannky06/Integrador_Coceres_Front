const CARRITO_KEY = "carrito";

let carrito = cargarCarrito();

const objetosCarrito = document.getElementById("cart-items");
const precioCarrito = document.getElementById("total-price");
const contadorCarrito = document.getElementById("cart-count");
const botonImprimir = document.getElementById("btn-imprimir");

const carritoContainer = document.getElementById("carritoContainer");
const totalBox = document.getElementById("totalBox");
const btnFinalizar = document.getElementById("btnFinalizar");

let listenersRegistrados = false;

function normalizarNumero(valor, fallback = 0) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : fallback;
}

function normalizarItem(item) {
  if (!item || typeof item !== "object") return null;

  const id = item.id;
  const name = item.name ?? "Producto sin nombre";
  const image = item.image ?? "";
  const price = normalizarNumero(item.price, 0);
  const quantity = Math.max(1, normalizarNumero(item.quantity, 1));

  if (id === undefined || id === null) return null;

  return { ...item, id, name, image, price, quantity };
}

function cargarCarrito() {
  try {
    const items = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
    return items.map(normalizarItem).filter(Boolean);
  } catch {
    return [];
  }
}

function guardarCarrito() {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

function totalCantidad() {
  return carrito.reduce((acc, p) => acc + normalizarNumero(p.quantity, 1), 0);
}

function totalPrecio() {
  return carrito.reduce(
    (acc, p) => acc + normalizarNumero(p.price, 0) * normalizarNumero(p.quantity, 1),
    0
  );
}

function buscarProductoPorId(id) {
  if (!window.productos || !Array.isArray(window.productos)) return null;
  return window.productos.find((p) => String(p.id) === String(id)) || null;
}

function agregarCarrito(id, cantidad = 1) {
  const producto = buscarProductoPorId(id);
  if (!producto) {
    console.error("Producto no encontrado para agregar al carrito:", id);
    return;
  }

  const cantidadSegura = Math.max(1, normalizarNumero(cantidad, 1));
  const existente = carrito.find((item) => String(item.id) === String(id));

  if (existente) {
    existente.quantity += cantidadSegura;
  } else {
    const item = normalizarItem({ ...producto, quantity: cantidadSegura });
    if (!item) return;
    carrito.push(item);
  }

  guardarCarrito();
  renderizarCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find((p) => String(p.id) === String(id));
  if (!item) return;

  item.quantity += normalizarNumero(delta, 0);

  if (item.quantity <= 0) {
    carrito = carrito.filter((p) => String(p.id) !== String(id));
  }

  guardarCarrito();
  renderizarCarrito();
}

function eliminarProducto(id) {
  carrito = carrito.filter((p) => String(p.id) !== String(id));
  guardarCarrito();
  renderizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
}

function renderizarCarritoResumen() {
  if (!objetosCarrito || !precioCarrito || !contadorCarrito) return;

  contadorCarrito.textContent = totalCantidad();

  if (carrito.length === 0) {
    objetosCarrito.innerHTML = '<p class="info-carrito">No hay productos en el carrito.</p>';
  } else {
    objetosCarrito.innerHTML = carrito
      .map(
        (producto) => `
        <li class="item-block">
          <span class="item-name">${producto.name} x ${producto.quantity}</span>
          <span>$${normalizarNumero(producto.price, 0) * normalizarNumero(producto.quantity, 1)}</span>
          <button class="delete-button" onclick="cambiarCantidad('${producto.id}', -1)">-1</button>
        </li>
      `
      )
      .join("");
  }

  precioCarrito.textContent = `$${totalPrecio()}`;
}

function renderizarCarritoPantalla() {
  if (!carritoContainer || !totalBox) return;

  if (carrito.length === 0) {
    carritoContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
  } else {
    carritoContainer.innerHTML = carrito
      .map(
        (p) => `
        <div class="cart-item-card">
          <img src="${p.image}" alt="${p.name}" class="cart-item-image">
          <div class="cart-item-info">
            <h3>${p.name}</h3>
            <p>Precio unitario: $${normalizarNumero(p.price, 0)}</p>
            <p>Subtotal: $${normalizarNumero(p.price, 0) * normalizarNumero(p.quantity, 1)}</p>
            <div class="qty-controls">
              <button onclick="cambiarCantidad('${p.id}', -1)">-</button>
              <span>${normalizarNumero(p.quantity, 1)}</span>
              <button onclick="cambiarCantidad('${p.id}', 1)">+</button>
              <button onclick="eliminarProducto('${p.id}')">Eliminar</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }

  totalBox.textContent = `Total: $${totalPrecio()}`;
}

function renderizarCarrito() {
  renderizarCarritoResumen();
  renderizarCarritoPantalla();
}

function construirTicketData() {
  return {
    user_name: sessionStorage.getItem("nombreUsuario") || "Cliente",
    // Quitamos user_id del front porque el back/DB se encarga
    date: new Date().toISOString(), // Formato ISO para evitar problemas de parseo
    products: carrito.map(p => p.id), // El back espera un array de IDs en 'products'
    total_price: totalPrecio(), // El back espera 'total_price'
    items: carrito, // Mantenemos items para el renderizado del ticket local
  };
}

async function finalizarCompra() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const ticketData = construirTicketData();

  try {
    const response = await fetch("http://localhost:3000/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: ticketData.date,
        total_price: ticketData.total_price,
        user_name: ticketData.user_name,
        // No enviamos user_id, dejamos que el back lo maneje
        products: ticketData.products
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al registrar la venta");
    }

    const result = await response.json();
    console.log("Venta registrada:", result);

    // Guardamos los datos para la pantalla de ticket
    sessionStorage.setItem("ticketData", JSON.stringify({
      ...ticketData,
      id: result.saleId,
      saleNumber: result.saleNumber, // Guardamos el Nro de venta autoincremental
      date: new Date(ticketData.date).toLocaleString() // Formateamos para mostrar
    }));

    // Vaciamos el carrito local
    vaciarCarrito();

    // Redirigimos
    window.location.href = "ticket.html";

  } catch (error) {
    console.error("Error en la compra:", error);
    alert("Hubo un problema al procesar tu compra: " + error.message);
  }
}

function irATicket() {
  finalizarCompra();
}

function imprimirTicket() {
  if (!window.jspdf) {
    irATicket();
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const ticketData = construirTicketData();

  let y = 20;
  doc.setFontSize(18);
  doc.text("Auto-ticket de compra:", 20, y);
  y += 12;
  doc.setFontSize(12);
  doc.text(`Cliente: ${ticketData.user_name}`, 20, y);
  y += 8;
  doc.text(`Fecha: ${ticketData.date}`, 20, y);
  y += 12;

  ticketData.items.forEach((item) => {
    const subtotal = normalizarNumero(item.price, 0) * normalizarNumero(item.quantity, 1);
    doc.text(`${item.name} x${item.quantity} - $${subtotal}`, 20, y);
    y += 8;
  });

  y += 6;
  doc.setFontSize(14);
  doc.text(`Total: $${ticketData.total}`, 20, y);

  doc.save("ticket.pdf");
}

function initCarrito() {
  renderizarCarrito();

  if (listenersRegistrados) return;

  if (botonImprimir) {
    botonImprimir.addEventListener("click", irATicket);
  }

  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", irATicket);
  }

  listenersRegistrados = true;
}

window.agregarCarrito = agregarCarrito;
window.eliminarProducto = eliminarProducto;
window.vaciarCarrito = vaciarCarrito;
window.cambiarCantidad = cambiarCantidad;
window.initCarrito = initCarrito;
window.imprimirTicket = imprimirTicket;

initCarrito();
