// Variables del carrito
let carrito = [];
let objetosCarrito = document.getElementById("cart-items");
let precioCarrito = document.getElementById("total-price");
let contadorCarrito = document.getElementById("cart-count");
let boton_imprimir = document.getElementById("btn-imprimir");

// Función para mostrar el carrito
function mostrarCarrito() {
    // Actualizar contador
    contadorCarrito.textContent = carrito.length;

    // Mostrar productos en el carrito
    let htmlCarrito = "";
    let total = 0;

    carrito.forEach((producto, index) => {
        htmlCarrito += `
            <li>
                ${producto.name} - $${producto.price}
                <button onclick="eliminarProducto(${index})">Eliminar</button>
            </li>
        `;
        total += parseInt(producto.price);
    });

    objetosCarrito.innerHTML = htmlCarrito;
    precioCarrito.textContent = `$${total}`;
}

// Función para agregar al carrito
function agregarCarrito(id) {
    let frutaSeleccionada = productos.find(fruta => fruta.id === id);
    carrito.push(frutaSeleccionada);
    mostrarCarrito();
}

// Función para eliminar producto
function eliminarProducto(index) {
    carrito.splice(index, 1);
    mostrarCarrito();
}

// Función para vaciar carrito
function vaciarCarrito() {
    carrito = [];
    mostrarCarrito();
}

// Imprimir tickets PDF
boton_imprimir.addEventListener("click", imprimirTicket);

/* Gracias al CDN ya podemos usar las funcionalidades que trae jsPDF
<!-- CDN para usar jsPDF -->
<script src="https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js"></script>*/

function imprimirTicket() { // Idealmente, primero se registra la venta, luego se imprime el ticket
    console.table(carrito); // Visualizamos el carrito

    // Para registrar las ventas a posteriori, guardaremos los ids de los productos del carrito
    let idProductos = []; // Array vacio de ids de producto

    // Gracias al CDN, extraemos la clase jspdf del objeto global window
    const { jsPDF } = window.jspdf;

    // Creamos una nueva instancia del documento pdf usando al clase jsPDF
    const doc = new jsPDF(); // Ahora doc tendra todos los metodos que le provee la herramienta jsPDF

    // Definimos el margen superior de 20px en el eje y -> eje vertical, el eje x será el eje horizontal
    let y = 20;

    // Establecemos el tamaño de 18px para el primer texto
    doc.setFontSize(18);

    // Escribimos el texto "Ticket compra" en la posicion x=10, y=10 del pdf
    doc.text("Auto-ticket de compra:", 20, y);

    // Aumentamos el espacio despues del titulo
    y += 15;

    // Cambiamos el tamaño de la fuente a 12px para los productos del ticket
    doc.setFontSize(12);

    // Iteramos el carrito e imprimimos nombre y precio
    carrito.forEach(producto => {

        idProductos.push(producto.id); // Llenamos el array de ids de productos (necesario para la venta despues)

        doc.text(`${producto.name} - $${producto.price}`, 30, y); // Creamos el texto por cada producto: nombre = $precio

        // Incrementamos la posicion vertical para evitar solapamiento
        y += 10;
    });

    // Calculamos el total del ticket usando reduce
    const precioTotal = carrito.reduce((total, producto) => total + parseInt(producto.price), 0);

    // Añadimos otro espacio de 5px en el eje vertical para separar el precio total de los productos
    y += 5;

    // Establecemos el tamaño de 15px para el precio total
    doc.setFontSize(14);

    // Escribimos el total del ticket en el PDF, despues del listado de productos
    doc.text(`Total: $${precioTotal}`, 20, y);

    // Imprimimos el ticket de venta
    doc.save("ticket.pdf");

    /* De cara a la defensa, la funcionalidad ticket podria concluir aca con las siguientes lineas para hacer limpieza de session
    y redireccion

    alert("Venta creada con exito");
    sessionStorage.removeItem("nombreUsuario");
    // sessionStorage.removeItem("carrito"); // Si guardamos el carrito en session
    window.location.href = "index.html"
    */

    // Llamado a registrar ventas y que haga la redireccion -> fetch POST /api/sales -> luego crearemos este endpoint app.post("/api/sales")
    registrarVenta(precioTotal, idProductos);
}

// Registrar venta
async function registrarVenta(precioTotal, idProductos) {

    /* toLocaleString vs toISOString

        - Los métodos `toLocaleString()` y `toISOString()` de JavaScript tienen diferentes propósitos a la hora de convertir un objeto Date en una cadena. El método `toISOString()` siempre devuelve una cadena en formato ISO 8601, que representa la fecha y la hora en UTC (tiempo universal coordinado) e incluye una «Z» al final para indicar UTC. Este formato está estandarizado y es coherente independientemente de la configuración del sistema del usuario.

        - Por el contrario, `toLocaleString()` devuelve una cadena formateada según la configuración regional y la zona horaria del sistema del usuario o según lo especificado por los parámetros del método. Esto significa que el resultado puede variar significativamente en función de la ubicación del usuario, por ejemplo, utilizando diferentes separadores de fecha, formatos de hora o incluso diferentes nombres de días y meses. Por ejemplo, si se utiliza la configuración regional «de» (alemán), la fecha se formateará como «29.5.2020, 18:04:24», mientras que «fr» (francés) utilizará «29/05/2020, 18:04:24».

        - Una solución habitual para obtener la hora local en formato ISO 8601 (sin la «Z») es ajustar la fecha según la diferencia horaria antes de llamar a «toISOString()». Esto se puede hacer restando la diferencia horaria en milisegundos (obtenida mediante «getTimezoneOffset () * 60000») del valor de la hora de la fecha. A continuación, la cadena resultante se puede modificar para eliminar la «Z» final si es necesario. Alternativamente, el uso de una configuración regional como «sv» (Suecia) con «toLocaleString()» produce un formato similar al ISO 8601, aunque utiliza un espacio en lugar de «T» entre la fecha y la hora, lo que sigue siendo válido según la RFC 3339.
    */

   // Ya que el formato fecha no es valido para timestamp en SQL, tenemos que formatearlo
   const fecha = new Date()
    .toLocaleString("sv-SE", { hour12: false })
    .replace("T", " ");

    console.log(fecha);

    // Construimos el objeto con informacion para mandarle al endpoint (previo parseo a JSON)
    const data = {
        date: fecha, // Recordar que si en su BBDD tienen un valor generado automaticamente, no hace falta enviar esto
        total_price: precioTotal,
        user_name: nombreUsuario,
        products: idProductos
    }

    const response = await fetch("http://localhost:3000/api/sales", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });


    const result = await response.json();


    if(response.ok) {
        console.log(response);
        alert(result.message);

        // Limpieza de variables en sesion y redireccion para resetear la app
        sessionStorage.removeItem("nombreUsuario");
        // sessionStorage.removeItem("carrito"); // Si guardamos el carrito en session
        window.location.href = "index.html"
    } else {
        alert(result.message);
    }


    // TO DO, tenemos que crear el endpoint /api/sales



    /*
    // Una vez que terminasemos de registrar la venta -> ORDEN IDEAL 1. Venta -> 2. Ticket
    alert("Venta creada con exito");
    sessionStorage.removeItem("nombreUsuario");
    // sessionStorage.removeItem("carrito"); // Si guardamos el carrito en session
    window.location.href = "index.html"
    */
}

// Inicializar eventos del carrito
function initCarrito() {
    if (boton_imprimir) {
        boton_imprimir.addEventListener("click", imprimirTicket);
    }
}

// Hacer funciones disponibles globalmente
window.agregarCarrito = agregarCarrito;
window.eliminarProducto = eliminarProducto;
window.vaciarCarrito = vaciarCarrito;
window.initCarrito = initCarrito;
