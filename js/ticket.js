function obtenerTicketData() {
  try {
    return JSON.parse(sessionStorage.getItem("ticketData")) || null;
  } catch {
    return null;
  }
}

function renderTicket() {
  const container = document.getElementById("ticketContainer");
  if (!container) return;

  const ticket = obtenerTicketData();

  if (!ticket || !ticket.items || ticket.items.length === 0) {
    container.innerHTML = "<p>No hay ticket para mostrar. Confirmá tu carrito primero.</p>";
    return;
  }

  const filas = ticket.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price}</td>
        <td>$${item.quantity * Number(item.price)}</td>
      </tr>
    `
    )
    .join("");

  container.innerHTML = `
    <p><strong>Comprobante Nro:</strong> ${ticket.saleNumber || ticket.id || "N/A"}</p>
    <p><strong>Cliente:</strong> ${ticket.user_name}</p>
    <p><strong>Fecha:</strong> ${ticket.date}</p>
    <table class="ticket-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
    <p class="ticket-total"><strong>Total:</strong> $${ticket.total_price}</p>
  `;
}

function descargarPDF() {
  const ticket = obtenerTicketData();
  if (!ticket || !window.jspdf) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;
  doc.setFontSize(18);
  doc.text("Auto-ticket de compra:", 20, y);
  y += 12;
  doc.setFontSize(12);
  doc.text(`Comprobante Nro: ${ticket.saleNumber || ticket.id || "N/A"}`, 20, y);
  y += 8;
  doc.text(`Cliente: ${ticket.user_name}`, 20, y);
  y += 8;
  doc.text(`Fecha: ${ticket.date}`, 20, y);
  y += 12;

  ticket.items.forEach((item) => {
    doc.text(`${item.name} x${item.quantity} - $${item.quantity * Number(item.price)}`, 20, y);
    y += 8;
  });

  y += 6;
  doc.setFontSize(14);
  doc.text(`Total: $${ticket.total_price}`, 20, y);
  doc.save(`ticket_${ticket.saleNumber || ticket.id || "venta"}.pdf`);
}

function salir() {
  // Limpiamos todo para reiniciar el sistema
  sessionStorage.clear();
  localStorage.clear();
  // Redirigimos a la pantalla de bienvenida (index.html)
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderTicket();

  const btnDescargar = document.getElementById("btnDescargarTicket");
  if (btnDescargar) {
    btnDescargar.addEventListener("click", descargarPDF);
  }

  const btnSalir = document.getElementById("btnSalir");
  if (btnSalir) {
    btnSalir.addEventListener("click", salir);
  }
});
