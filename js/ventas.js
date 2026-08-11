
/* =========================================
   CONFIGURACIÓN
========================================= */

const CLAVE_PEDIDOS = "tienda_pedidos";


/* =========================================
   INICIAR
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    cargarVentas();

    const btnFiltrar = document.getElementById("btn-filtrar");

    if (btnFiltrar) {
        btnFiltrar.addEventListener("click", cargarVentas);
    }

});


/* =========================================
   OBTENER PEDIDOS
========================================= */

function obtenerPedidos() {

    try {

        const datos = localStorage.getItem(CLAVE_PEDIDOS);

        if (!datos) {
            return [];
        }

        const pedidos = JSON.parse(datos);

        return Array.isArray(pedidos) ? pedidos : [];

    } catch (error) {

        console.error("Error al obtener los pedidos:", error);

        return [];

    }

}


/* =========================================
   CARGAR VENTAS
========================================= */

function cargarVentas() {

    const pedidos = obtenerPedidos();

    const fechaDesde = document.getElementById("fecha-desde")?.value || "";
    const fechaHasta = document.getElementById("fecha-hasta")?.value || "";
    const estado = document.getElementById("estado-venta")?.value || "todos";


    const ventas = pedidos.filter(pedido => {

        /* -----------------------------
           FILTRO POR ESTADO
        ----------------------------- */

        if (estado !== "todos") {

            const estadoPedido = obtenerEstado(pedido);

            if (estadoPedido !== estado) {
                return false;
            }

        }


        /* -----------------------------
           FILTRO POR FECHA
        ----------------------------- */

        const fechaPedido = obtenerFecha(pedido);

        if (fechaDesde && fechaPedido) {

            if (fechaPedido < fechaDesde) {
                return false;
            }

        }

        if (fechaHasta && fechaPedido) {

            if (fechaPedido > fechaHasta) {
                return false;
            }

        }


        return true;

    });


    actualizarResumen(ventas);

    mostrarVentas(ventas);

}


/* =========================================
   OBTENER FECHA
========================================= */

function obtenerFecha(pedido) {

    const fecha =
        pedido.fecha ||
        pedido.fechaPedido ||
        pedido.createdAt ||
        pedido.created_at ||
        "";

    if (!fecha) {
        return "";
    }

    try {

        const fechaObjeto = new Date(fecha);

        if (isNaN(fechaObjeto.getTime())) {
            return "";
        }

        return fechaObjeto.toISOString().split("T")[0];

    } catch (error) {

        return "";

    }

}


/* =========================================
   OBTENER ESTADO
========================================= */

function obtenerEstado(pedido) {

    return (
        pedido.estado ||
        pedido.status ||
        "pendiente"
    ).toString().toLowerCase();

}


/* =========================================
   OBTENER TOTAL
========================================= */

function obtenerTotal(pedido) {

    const total =
        pedido.total ??
        pedido.totalPedido ??
        pedido.monto ??
        pedido.precioTotal ??
        0;

    const numero = Number(total);

    return isNaN(numero) ? 0 : numero;

}


/* =========================================
   OBTENER CLIENTE
========================================= */

function obtenerCliente(pedido) {

    return (
        pedido.cliente?.nombre ||
        pedido.clienteNombre ||
        pedido.nombreCliente ||
        pedido.nombre ||
        pedido.cliente ||
        "Cliente"
    );

}


/* =========================================
   OBTENER CANTIDAD DE PRODUCTOS
========================================= */

function obtenerCantidadProductos(pedido) {

    if (Array.isArray(pedido.productos)) {

        return pedido.productos.reduce((total, producto) => {

            return total + Number(
                producto.cantidad || 1
            );

        }, 0);

    }

    if (Array.isArray(pedido.items)) {

        return pedido.items.reduce((total, producto) => {

            return total + Number(
                producto.cantidad || 1
            );

        }, 0);

    }

    return Number(
        pedido.cantidad ||
        pedido.cantidadProductos ||
        0
    );

}


/* =========================================
   ACTUALIZAR RESUMEN
========================================= */

function actualizarResumen(ventas) {

    const elementoVentasHoy =
        document.querySelector(".stat-card:nth-child(1) strong");

    const elementoVentasMes =
        document.querySelector(".stat-card:nth-child(2) strong");

    const elementoPedidos =
        document.querySelector(".stat-card:nth-child(3) strong");

    const elementoTicket =
        document.querySelector(".stat-card:nth-child(4) strong");


    const hoy = new Date();

    const fechaHoy =
        hoy.toISOString().split("T")[0];


    const mesActual =
        hoy.getMonth();

    const añoActual =
        hoy.getFullYear();


    let ventasHoy = 0;
    let ventasMes = 0;
    let totalVentas = 0;


    ventas.forEach(pedido => {

        const total = obtenerTotal(pedido);

        totalVentas += total;


        const fecha = obtenerFecha(pedido);

        if (!fecha) {
            return;
        }


        if (fecha === fechaHoy) {

            ventasHoy += total;

        }


        const fechaObjeto = new Date(fecha + "T00:00:00");


        if (
            fechaObjeto.getMonth() === mesActual &&
            fechaObjeto.getFullYear() === añoActual
        ) {

            ventasMes += total;

        }

    });


    const cantidadPedidos = ventas.length;


    const ticketPromedio =
        cantidadPedidos > 0
            ? totalVentas / cantidadPedidos
            : 0;


    if (elementoVentasHoy) {

        elementoVentasHoy.textContent =
            formatearPrecio(ventasHoy);

    }


    if (elementoVentasMes) {

        elementoVentasMes.textContent =
            formatearPrecio(ventasMes);

    }


    if (elementoPedidos) {

        elementoPedidos.textContent =
            cantidadPedidos;

    }


    if (elementoTicket) {

        elementoTicket.textContent =
            formatearPrecio(ticketPromedio);

    }

}


/* =========================================
   MOSTRAR VENTAS
========================================= */

function mostrarVentas(ventas) {

    const tabla =
        document.getElementById("tabla-ventas");


    if (!tabla) {
        return;
    }


    tabla.innerHTML = "";


    if (ventas.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="tabla-vacia">
                    No hay ventas registradas.
                </td>
            </tr>
        `;

        return;

    }


    ventas.forEach((pedido, indice) => {

        const fila =
            document.createElement("tr");


        const numeroPedido =
            pedido.id ||
            pedido.numero ||
            pedido.numeroPedido ||
            `#${indice + 1}`;


        const fecha =
            obtenerFecha(pedido);


        const cliente =
            obtenerCliente(pedido);


        const cantidad =
            obtenerCantidadProductos(pedido);


        const total =
            obtenerTotal(pedido);


        const estado =
            obtenerEstado(pedido);


        fila.innerHTML = `

            <td>
                <strong>${numeroPedido}</strong>
            </td>

            <td>
                ${formatearFecha(fecha)}
            </td>

            <td>
                ${cliente}
            </td>

            <td>
                ${cantidad}
            </td>

            <td>
                <strong>
                    ${formatearPrecio(total)}
                </strong>
            </td>

            <td>
                <span class="estado-venta estado-${estado}">
                    ${capitalizar(estado)}
                </span>
            </td>

        `;


        tabla.appendChild(fila);

    });

}


/* =========================================
   FORMATEAR PRECIO
========================================= */

function formatearPrecio(valor) {

    return new Intl.NumberFormat("es-AR", {

        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0

    }).format(valor);

}


/* =========================================
   FORMATEAR FECHA
========================================= */

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }


    const partes = fecha.split("-");


    if (partes.length !== 3) {
        return fecha;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================
   CAPITALIZAR
========================================= */

function capitalizar(texto) {

    if (!texto) {
        return "";
    }


    return texto.charAt(0).toUpperCase() +
        texto.slice(1);

}

