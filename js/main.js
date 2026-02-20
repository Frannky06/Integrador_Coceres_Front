// Redireccion a inicio
let nombreUsuario = sessionStorage.getItem("nombreUsuario");
if (!nombreUsuario) {
  window.location.href = "index.html";
}

// Variables
let productos = [];
let productosFiltrados = [];
let categoriaActiva = "todas";

const cuadriculaProductos = document.querySelector(".product-grid");
const barraBusqueda = document.querySelector(".search-bar");
const contenedorCategorias = document.getElementById("category-filters");
const contenedorPaginacion = document.getElementById("pagination-container");

let paginaActual = 1;
const productosPorPagina = 6;

// Variables globales compartidas
window.productos = productos;
window.nombreUsuario = nombreUsuario;
if (typeof window.initCarrito !== "function") {
  window.initCarrito = function () { };
}


const url = "http://localhost:3000/api/products";

async function obtenerProductos() {
  try {
    const respuesta = await fetch(url);
    const data = await respuesta.json();

    productos = data.payload || [];
    productosFiltrados = [...productos];
    window.productos = productos;

    renderizarCategorias(productos);
    aplicarFiltros();
  } catch (error) {
    console.error("No se pudieron obtener productos:", error);
  }
}

function mostrarProductos(array) {
  if (!cuadriculaProductos) return;

  if (array.length === 0) {
    cuadriculaProductos.innerHTML = "<p>No hay productos para mostrar.</p>";
    return;
  }

  const totalPaginas = Math.ceil(array.length / productosPorPagina);
  if (paginaActual > totalPaginas && totalPaginas > 0) paginaActual = totalPaginas;

  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosVisibles = array.slice(inicio, fin);

  let cartaProducto = "";

  for (let i = 0; i < productosVisibles.length; i++) {
    const producto = productosVisibles[i];
    cartaProducto += `
      <div class="product-card">
      <img src="${producto.image}" alt="${producto.name}">
      <div class = "product-info">
      <h3>${producto.name}</h3>
      <a href="detalle.html?id=${producto.id}">
      +
      </a>
      </div>
          <p>$${producto.price}</p>
          <p class="product-category">${producto.category ? producto.category.charAt(0).toUpperCase() + producto.category.slice(1) : "Sin categoría"}</p>
          <div class="qty-row" onclick="event.stopPropagation()">
            <label for="qty-${producto.id}">Cantidad:</label>
            <input id="qty-${producto.id}" class="quantity-input" type="number" min="1" value="1">
          </div>
          <button class="add-to-cart" onclick="agregarCarritoDesdeListado(event, ${producto.id})">Agregar al carrito</button>
      </div>
    `;
  }

  cuadriculaProductos.innerHTML = cartaProducto;
  renderizarPaginacion(array.length);
}

function renderizarPaginacion(totalItems) {
  if (!contenedorPaginacion) return;

  const totalPaginas = Math.ceil(totalItems / productosPorPagina);
  if (totalPaginas <= 1) {
    contenedorPaginacion.innerHTML = "";
    return;
  }

  let htmlPaginacion = "";
  for (let i = 1; i <= totalPaginas; i++) {
    htmlPaginacion += `
      <button class="page-btn ${i === paginaActual ? 'active' : ''}" onclick="cambiarPagina(${i})">
        ${i}
      </button>
    `;
  }
  contenedorPaginacion.innerHTML = htmlPaginacion;
}

function cambiarPagina(numeroPagina) {
  paginaActual = numeroPagina;
  mostrarProductos(productosFiltrados);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saludarUsuario() {
  const saludoUsuario = document.getElementById("saludo-usuario");
  if (saludoUsuario) {
    saludoUsuario.innerHTML = `Bienvenido ${nombreUsuario}!`;
  }
}

function renderizarCategorias(items) {
  if (!contenedorCategorias) return;

  const categorias = [...new Set(items.map((p) => p.category).filter(Boolean))];

  if (categorias.length === 0) {
    contenedorCategorias.innerHTML = "";
    return;
  }

  const botones = [
    `<button class="category-btn active" data-category="todas">Todas</button>`,
    ...categorias.map(
      (cat) => `<button class="category-btn" data-category="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`
    ),
  ];

  contenedorCategorias.innerHTML = botones.join("");

  contenedorCategorias.addEventListener("click", (event) => {
    const btn = event.target.closest(".category-btn");
    if (!btn) return;

    categoriaActiva = btn.dataset.category;
    document
      .querySelectorAll(".category-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    paginaActual = 1;
    aplicarFiltros();
  });
}

function filtrarPorTexto(items) {
  const valorBusqueda = (barraBusqueda?.value || "").toLowerCase();
  return items.filter((producto) =>
    producto.name.toLowerCase().includes(valorBusqueda)
  );
}

function filtrarPorCategoria(items) {
  if (categoriaActiva === "todas") return items;
  return items.filter((producto) => producto.category === categoriaActiva);
}

function aplicarFiltros() {
  const porCategoria = filtrarPorCategoria(productos);
  const porTexto = filtrarPorTexto(porCategoria);
  productosFiltrados = porTexto;
  mostrarProductos(productosFiltrados);
}

function agregarCarritoDesdeListado(event, id) {
  if (event) event.stopPropagation();
  const inputCantidad = document.getElementById(`qty-${id}`);
  const cantidad = Math.max(1, Number(inputCantidad?.value || 1));
  agregarCarrito(id, cantidad);
}

if (barraBusqueda) {
  barraBusqueda.addEventListener("keyup", () => {
    paginaActual = 1;
    aplicarFiltros();
  });
}

function init() {
  obtenerProductos();
  saludarUsuario();
}

window.agregarCarritoDesdeListado = agregarCarritoDesdeListado;
window.cambiarPagina = cambiarPagina;

init();
