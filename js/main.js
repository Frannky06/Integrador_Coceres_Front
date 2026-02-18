// Redireccion a inicio////////////////////
let nombreUsuario = sessionStorage.getItem("nombreUsuario");

// Redirige si no existe un nombre de usuario
if(!nombreUsuario){
	window.location.href = "index.html";
}




// Variables////////////////////////////////
let productos = []; // Agregamos la variable global productos
let cuadriculaProductos = document.querySelector(".product-grid");
let barraBusqueda = document.querySelector(".search-bar");

let botonesCarrito = document.querySelectorAll(".add-to-cart");

// Hacer variables globales disponibles para otros scripts
window.productos = productos;
window.nombreUsuario = nombreUsuario;




// Obtener productos////////////////////////////////////////////
const url = "http://localhost:3000/api/products"; // Guardamos en una variable la url de nuestro endpoint

async function obtenerProductos() {
    try {
        let respuesta = await fetch(url); // Hacemos una peticion a nuestro nuevo endpoint en http://localhost:3000/api/products

        let data = await respuesta.json();

        console.log(data); // Nuestros productos estan disponibles dentro de payload { payload: Array(19) }

        productos = data.payload; // Aca guardamos en la variable productos el array de productos que contiene "payload"
        window.productos = productos; // Actualizar la variable global

        mostrarProductos(productos);
        
        

    } catch(error) {
        console.error(error);
    }
}




// Mostrar productos////////////////////////////////
function mostrarProductos(array) {
    let cartaProducto = "";
    
    for(let i = 0; i < array.length; i++) {    
        cartaProducto += `
            <div class="product-card">
                <img src="${array[i].image}" alt="${array[i].name}">
                <h3>${array[i].name}</h3>
                <p>$${array[i].price}</p>
                <button class="add-to-cart" onclick="agregarCarrito(${array[i].id})">Agregar a carrito</button>
            </div>
        `;
    }
    cuadriculaProductos.innerHTML = cartaProducto;
    //console.log(cartaProducto)
}




// Saludar usuario/////////////////////////////////
function saludarUsuario() {
    let saludoUsuario = document.getElementById("saludo-usuario");
    saludoUsuario.innerHTML = `Bienvenido ${nombreUsuario}!`;
}








// Filtrar productos////////////////////////////////
barraBusqueda.addEventListener("keyup", filtrarProductos);

function filtrarProductos() {
	let valorBusqueda = barraBusqueda.value;
	// console.log(valorBusqueda)

	let productosFiltrados = productos.filter((producto) => { 
		return producto.name.includes(valorBusqueda);
	});
	mostrarProductos(productosFiltrados);
}




// Funcion inicializadora
function init() {
    obtenerProductos();
    saludarUsuario();
    initCarrito();
}

init();