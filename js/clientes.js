
/* =========================================
   CONFIGURACIÓN
========================================= */

const CLAVE_PEDIDOS = "tienda_pedidos";


/* =========================================
   INICIAR
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    cargarClientes();

    const buscador = document.getElementById("buscar-cliente");

    if (buscador) {

        buscador.addEventListener("input", () => {
            cargarClientes();
        });

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

        console.error("Error al obtener pedidos:", error);

        return [];

    }

}


/* =========================================
   CARGAR CLIENTES
========================================= */

function cargarClientes() {

    const pedidos = obtenerPedidos();

    const clientes = construirClientes(pedidos);

    const textoBusqueda =
        document.getElementById("buscar-cliente")?.value
        .toLowerCase()
        .trim() || "";


    /* =====================================
       FILTRAR CLIENTES
    ===================================== */

    const clientesFiltrados = clientes.filter(cliente => {

        if (!textoBusqueda) {
            return true;
        }

        return (

            cliente.nombre
                .toLowerCase()
                .includes(textoBusqueda)

            ||

            cliente.telefono
                .toLowerCase()
                .includes(textoBusqueda)

            ||

            cliente.email
                .toLowerCase()
                .includes(textoBusqueda)

        );

    });


    actualizarResumen(clientes);

    mostrarClientes(clientesFiltrados);

}


/* =========================================
   CONSTRUIR CLIENTES
========================================= */

function construirClientes(pedidos) {

    const mapaClientes = new Map();


    pedidos.forEach(pedido => {

        const datosCliente =
            obtenerDatosCliente(pedido);


        const clave =
            datosCliente.email ||
            datosCliente.telefono ||
            datosCliente.nombre;


        if (!clave) {
            return;
        }


        const claveNormalizada =
            clave.toString()
                .toLowerCase()
                .trim();


        if (!mapaClientes.has(claveNormalizada)) {

            mapaClientes.set(
                claveNormalizada,
                {

                    nombre:
                        datosCliente.nombre ||
                        "Cliente",

                    telefono:
                        datosCliente.telefono ||
                        "-",

                    email:
                        datosCliente.email ||
                        "-",

                    pedidos: 0,

                    total: 0,

                    ultimoPedido: "",

                    primerPedido: ""

                }
            );

        }


        const cliente =
            mapaClientes.get(claveNormalizada);


        /* -----------------------------
           PEDIDOS
        ----------------------------- */

        cliente.pedidos++;


        /* -----------------------------
           TOTAL COMPRADO
        ----------------------------- */

        cliente.total += obtenerTotal(pedido);


        /* -----------------------------
           FECHA
        ----------------------------- */

        const fecha =
            obtenerFecha(pedido);


        if (fecha) {

            if (
                !cliente.ultimoPedido ||
                fecha > cliente.ultimoPedido
            ) {

                cliente.ultimoPedido = fecha;

            }


            if (
                !cliente.primerPedido ||
                fecha < cliente.primerPedido
            ) {

                cliente.primerPedido = fecha;

            }

        }

    });


    return Array.from(mapaClientes.values());

}


/* =========================================
   OBTENER DATOS DEL CLIENTE
========================================= */

function obtenerDatosCliente(pedido) {

    const cliente =
        pedido.cliente || {};


    let nombre =
        pedido.clienteNombre ||
        pedido.nombreCliente ||
        pedido.nombre ||
        "";


    let telefono =
        pedido.telefono ||
        pedido.telefonoCliente ||
        pedido.celular ||
        "";


    let email =
        pedido.email ||
        pedido.emailCliente ||
        "";


    /* -------------------------------------
       SI EL CLIENTE ES UN OBJETO
    ------------------------------------- */

    if (
        typeof cliente === "object" &&
        cliente !== null
    ) {

        nombre =
            cliente.nombre ||
            cliente.name ||
            nombre;


        telefono =
            cliente.telefono ||
            cliente.celular ||
            cliente.phone ||
            telefono;


        email =
            cliente.email ||
            cliente.correo ||
            email;

    }


    /* -------------------------------------
       SI cliente ES TEXTO
    ------------------------------------- */

    if (typeof cliente === "string") {

        nombre =
            cliente || nombre;

    }


    return {

        nombre: String(nombre),

        telefono: String(telefono),

        email: String(email)

    };

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


    const numero =
        Number(total);


    return isNaN(numero)
        ? 0
        : numero;

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

        const fechaObjeto =
            new Date(fecha);


        if (
            isNaN(
                fechaObjeto.getTime()
            )
        ) {

            return "";

        }


        return fechaObjeto
            .toISOString()
            .split("T")[0];

    } catch (error) {

        return "";

    }

}


/* =========================================
   ACTUALIZAR RESUMEN
========================================= */

function actualizarResumen(clientes) {

    const totalClientes =
        document.getElementById(
            "total-clientes"
        );


    const clientesNuevos =
        document.getElementById(
            "clientes-nuevos"
        );


    const clientesPedidos =
        document.getElementById(
            "clientes-pedidos"
        );


    const clientesFrecuentes =
        document.getElementById(
            "clientes-frecuentes"
        );


    /* -----------------------------
       TOTAL
    ----------------------------- */

    if (totalClientes) {

        totalClientes.textContent =
            clientes.length;

    }


    /* -----------------------------
       CLIENTES CON PEDIDOS
    ----------------------------- */

    const conPedidos =
        clientes.filter(
            cliente => cliente.pedidos > 0
        ).length;


    if (clientesPedidos) {

        clientesPedidos.textContent =
            conPedidos;

    }


    /* -----------------------------
       CLIENTES FRECUENTES
       3 O MÁS PEDIDOS
    ----------------------------- */

    const frecuentes =
        clientes.filter(
            cliente => cliente.pedidos >= 3
        ).length;


    if (clientesFrecuentes) {

        clientesFrecuentes.textContent =
            frecuentes;

    }


    /* -----------------------------
       CLIENTES NUEVOS
       PRIMER PEDIDO EN LOS
       ÚLTIMOS 30 DÍAS
    ----------------------------- */

    const hoy =
        new Date();


    const hace30Dias =
        new Date();


    hace30Dias.setDate(
        hoy.getDate() - 30
    );


    const nuevos =
        clientes.filter(cliente => {

            if (!cliente.primerPedido) {
                return false;
            }


            const fecha =
                new Date(
                    cliente.primerPedido +
                    "T00:00:00"
                );


            return fecha >= hace30Dias;

        }).length;


    if (clientesNuevos) {

        clientesNuevos.textContent =
            nuevos;

    }

}


/* =========================================
   MOSTRAR CLIENTES
========================================= */

function mostrarClientes(clientes) {

    const tabla =
        document.getElementById(
            "tabla-clientes"
        );


    if (!tabla) {
        return;
    }


    tabla.innerHTML = "";


    if (clientes.length === 0) {

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="tabla-vacia"
                >

                    No hay clientes registrados.

                </td>

            </tr>

        `;

        return;

    }


    clientes.forEach(cliente => {

        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>

                <strong>
                    ${escapeHTML(cliente.nombre)}
                </strong>

            </td>


            <td>

                ${escapeHTML(cliente.telefono)}

            </td>


            <td>

                ${escapeHTML(cliente.email)}

            </td>


            <td>

                ${cliente.pedidos}

            </td>


            <td>

                <strong>
                    ${formatearPrecio(cliente.total)}
                </strong>

            </td>


            <td>

                ${formatearFecha(
                    cliente.ultimoPedido
                )}

            </td>


            <td>

                <button
                    type="button"
                    class="btn-ver-cliente"
                    onclick="verCliente('${escapeAttribute(cliente.email)}')"
                >
                    Ver
                </button>

            </td>

        `;


        tabla.appendChild(fila);

    });

}


/* =========================================
   VER CLIENTE
========================================= */

function verCliente(identificador) {

    const pedidos =
        obtenerPedidos();


    const clientes =
        construirClientes(pedidos);


    const cliente =
        clientes.find(c =>

            c.email === identificador

        );


    if (!cliente) {

        alert(
            "No se encontró la información del cliente."
        );

        return;

    }


    alert(

        "Cliente: " +
        cliente.nombre +
        "\n\n" +

        "Teléfono: " +
        cliente.telefono +
        "\n" +

        "Email: " +
        cliente.email +
        "\n\n" +

        "Pedidos: " +
        cliente.pedidos +
        "\n" +

        "Total comprado: " +
        formatearPrecio(cliente.total)

    );

}


/* =========================================
   FORMATEAR PRECIO
========================================= */

function formatearPrecio(valor) {

    return new Intl.NumberFormat(
        "es-AR",
        {

            style: "currency",

            currency: "ARS",

            minimumFractionDigits: 0

        }
    ).format(valor);

}


/* =========================================
   FORMATEAR FECHA
========================================= */

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }


    const partes =
        fecha.split("-");


    if (partes.length !== 3) {
        return fecha;
    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


/* =========================================
   SEGURIDAD
========================================= */

function escapeHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(texto) {

    return String(texto)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}

