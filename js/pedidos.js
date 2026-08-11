
const CLAVE_PEDIDOS = "tienda_pedidos";

let pedidos = [];


/* =====================================================
   INICIAR
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    cargarPedidos();

    mostrarPedidos();

    actualizarResumen();

    configurarEventos();

});


/* =====================================================
   CARGAR PEDIDOS
===================================================== */

function cargarPedidos() {

    const datos =
        localStorage.getItem(
            CLAVE_PEDIDOS
        );


    if (!datos) {

        pedidos = [];

        return;

    }


    try {

        const datosGuardados =
            JSON.parse(datos);


        pedidos =
            Array.isArray(datosGuardados)
                ? datosGuardados
                : [];


    } catch (error) {

        console.error(
            "Error al cargar los pedidos:",
            error
        );

        pedidos = [];

    }

}


/* =====================================================
   GUARDAR PEDIDOS
===================================================== */

function guardarPedidos() {

    try {

        localStorage.setItem(
            CLAVE_PEDIDOS,
            JSON.stringify(pedidos)
        );

        return true;

    } catch (error) {

        console.error(
            "Error al guardar los pedidos:",
            error
        );

        return false;

    }

}


/* =====================================================
   CONFIGURAR EVENTOS
===================================================== */

function configurarEventos() {

    const buscador =
        document.getElementById(
            "buscarPedido"
        );


    if (buscador) {

        buscador.addEventListener(
            "input",
            aplicarFiltros
        );

    }


    const filtroEstado =
        document.getElementById(
            "filtroPedidoEstado"
        );


    if (filtroEstado) {

        filtroEstado.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    const filtroFecha =
        document.getElementById(
            "filtroPedidoFecha"
        );


    if (filtroFecha) {

        filtroFecha.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    const btnActualizar =
        document.getElementById(
            "btnActualizarPedidos"
        );


    if (btnActualizar) {

        btnActualizar.addEventListener(
            "click",
            () => {

                cargarPedidos();

                mostrarPedidos();

                actualizarResumen();

            }
        );

    }


    const btnCerrar =
        document.getElementById(
            "btnCerrarModal"
        );


    if (btnCerrar) {

        btnCerrar.addEventListener(
            "click",
            cerrarModal
        );

    }


    const btnCerrarFooter =
        document.getElementById(
            "btnCerrarModalFooter"
        );


    if (btnCerrarFooter) {

        btnCerrarFooter.addEventListener(
            "click",
            cerrarModal
        );

    }


    const overlay =
        document.querySelector(
            ".modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            cerrarModal
        );

    }

}


/* =====================================================
   MOSTRAR PEDIDOS
===================================================== */

function mostrarPedidos(
    lista = pedidos
) {

    const contenedor =
        document.getElementById(
            "listaPedidos"
        );


    if (!contenedor) {

        return;

    }


    if (lista.length === 0) {

        contenedor.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-table"
                >

                    <span>
                        🛒
                    </span>

                    <p>
                        No hay pedidos para mostrar.
                    </p>

                </td>

            </tr>

        `;

        return;

    }


    contenedor.innerHTML =
        lista
            .map(
                pedido =>
                    crearFilaPedido(
                        pedido
                    )
            )
            .join("");

}


/* =====================================================
   CREAR FILA
===================================================== */

function crearFilaPedido(
    pedido
) {

    const numero =
        pedido.numero ||
        pedido.id ||
        "Sin número";


    const cliente =
        pedido.cliente?.nombre ||
        pedido.nombreCliente ||
        "Cliente";


    const fecha =
        formatearFecha(
            pedido.fecha ||
            pedido.fechaCreacion
        );


    const cantidadProductos =
        obtenerCantidadProductos(
            pedido
        );


    const total =
        Number(
            pedido.total || 0
        );


    const estado =
        pedido.estado ||
        "pendiente";


    return `

        <tr>

            <td>

                <strong>
                    #${escaparHTML(
                        numero
                    )}
                </strong>

            </td>


            <td>

                ${escaparHTML(
                    cliente
                )}

            </td>


            <td>

                ${fecha}

            </td>


            <td>

                ${cantidadProductos}

            </td>


            <td>

                <strong>

                    ${formatearPrecio(
                        total
                    )}

                </strong>

            </td>


            <td>

                ${crearEstadoPedido(
                    estado
                )}

            </td>


            <td>

                <div
                    class="table-actions"
                >

                    <button
                        type="button"
                        class="table-action"
                        onclick="
                            verPedido(
                                '${escaparAtributo(
                                    pedido.id
                                )}'
                            )
                        "
                    >

                        Ver

                    </button>


                    <button
                        type="button"
                        class="table-action"
                        onclick="
                            cambiarEstadoPedido(
                                '${escaparAtributo(
                                    pedido.id
                                )}'
                            )
                        "
                    >

                        Estado

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =====================================================
   VER PEDIDO
===================================================== */

function verPedido(
    id
) {

    const pedido =
        pedidos.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!pedido) {

        alert(
            "No se encontró el pedido."
        );

        return;

    }


    const modal =
        document.getElementById(
            "modalPedido"
        );


    const titulo =
        document.getElementById(
            "modalPedidoTitulo"
        );


    const detalle =
        document.getElementById(
            "detallePedido"
        );


    if (!modal || !detalle) {

        return;

    }


    if (titulo) {

        titulo.textContent =
            `Pedido #${
                pedido.numero ||
                pedido.id
            }`;

    }


    const cliente =
        pedido.cliente || {};


    const productosPedido =
        Array.isArray(
            pedido.productos
        )
            ? pedido.productos
            : Array.isArray(
                pedido.items
            )
                ? pedido.items
                : [];


    detalle.innerHTML = `

        <div class="pedido-detalle">


            <div class="pedido-info">


                <h3>
                    Datos del cliente
                </h3>


                <p>

                    <strong>
                        Nombre:
                    </strong>

                    ${escaparHTML(
                        cliente.nombre ||
                        pedido.nombreCliente ||
                        "No informado"
                    )}

                </p>


                <p>

                    <strong>
                        Teléfono:
                    </strong>

                    ${escaparHTML(
                        cliente.telefono ||
                        pedido.telefono ||
                        "No informado"
                    )}

                </p>


                <p>

                    <strong>
                        Localidad:
                    </strong>

                    ${escaparHTML(
                        cliente.localidad ||
                        pedido.localidad ||
                        "No informada"
                    )}

                </p>


                <p>

                    <strong>
                        Dirección:
                    </strong>

                    ${escaparHTML(
                        cliente.direccion ||
                        pedido.direccion ||
                        "No informada"
                    )}

                </p>


            </div>



            <div class="pedido-info">


                <h3>
                    Estado
                </h3>


                <div>

                    ${crearEstadoPedido(
                        pedido.estado ||
                        "pendiente"
                    )}

                </div>


            </div>



            <div class="pedido-productos">


                <h3>
                    Productos
                </h3>


                ${
                    productosPedido.length
                        ? productosPedido
                            .map(
                                producto =>
                                    crearProductoPedido(
                                        producto
                                    )
                            )
                            .join("")
                        : `
                            <p>
                                No hay productos registrados.
                            </p>
                          `
                }


            </div>



            <div class="pedido-total">


                <span>
                    Total
                </span>


                <strong>

                    ${formatearPrecio(
                        pedido.total || 0
                    )}

                </strong>


            </div>


        </div>

    `;


    modal.hidden = false;

}


/* =====================================================
   PRODUCTO DEL PEDIDO
===================================================== */

function crearProductoPedido(
    producto
) {

    const cantidad =
        Number(
            producto.cantidad || 1
        );


    const precio =
        Number(
            producto.precio || 0
        );


    const subtotal =
        cantidad * precio;


    const imagen =
        producto.imagen ||
        (
            Array.isArray(
                producto.imagenes
            )
                ? producto.imagenes[0]
                : ""
        );


    return `

        <div class="pedido-producto">


            <div class="pedido-producto-imagen">

                ${
                    imagen
                        ? `
                            <img
                                src="${escaparAtributo(
                                    imagen
                                )}"
                                alt=""
                            >
                          `
                        : `
                            <div>
                                FOTO
                            </div>
                          `
                }

            </div>


            <div class="pedido-producto-info">


                <strong>

                    ${escaparHTML(
                        producto.nombre ||
                        "Producto"
                    )}

                </strong>


                ${
                    producto.talle
                        ? `
                            <span>
                                Talle:
                                ${escaparHTML(
                                    producto.talle
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    producto.color
                        ? `
                            <span>
                                Color:
                                ${escaparHTML(
                                    producto.color
                                )}
                            </span>
                          `
                        : ""
                }


                <span>

                    ${cantidad}
                    ×
                    ${formatearPrecio(
                        precio
                    )}

                </span>

            </div>


            <strong>

                ${formatearPrecio(
                    subtotal
                )}

            </strong>


        </div>

    `;

}


/* =====================================================
   CAMBIAR ESTADO
===================================================== */

function cambiarEstadoPedido(
    id
) {

    const pedido =
        pedidos.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!pedido) {

        return;

    }


    const estados = [

        "pendiente",

        "confirmado",

        "preparando",

        "enviado",

        "entregado",

        "cancelado"

    ];


    const estadoActual =
        pedido.estado ||
        "pendiente";


    const indice =
        estados.indexOf(
            estadoActual
        );


    const siguiente =
        estados[
            (indice + 1) %
            estados.length
        ];


    pedido.estado =
        siguiente;


    pedido.fechaActualizacion =
        new Date().toISOString();


    guardarPedidos();


    mostrarPedidos();

    actualizarResumen();


    alert(
        `Pedido actualizado a: ${obtenerNombreEstado(
            siguiente
        )}`
    );

}


/* =====================================================
   CERRAR MODAL
===================================================== */

function cerrarModal() {

    const modal =
        document.getElementById(
            "modalPedido"
        );


    if (modal) {

        modal.hidden = true;

    }

}


/* =====================================================
   FILTROS
===================================================== */

function aplicarFiltros() {

    const buscador =
        document.getElementById(
            "buscarPedido"
        );


    const filtroEstado =
        document.getElementById(
            "filtroPedidoEstado"
        );


    const filtroFecha =
        document.getElementById(
            "filtroPedidoFecha"
        );


    const texto =
        buscador
            ? buscador.value
                .toLowerCase()
                .trim()
            : "";


    const estado =
        filtroEstado
            ? filtroEstado.value
            : "";


    const fecha =
        filtroFecha
            ? filtroFecha.value
            : "";


    const ahora =
        new Date();


    const resultado =
        pedidos.filter(
            pedido => {


                const numero =
                    String(
                        pedido.numero ||
                        pedido.id ||
                        ""
                    ).toLowerCase();


                const cliente =
                    String(
                        pedido.cliente?.nombre ||
                        pedido.nombreCliente ||
                        ""
                    ).toLowerCase();


                const coincideTexto =
                    !texto ||
                    numero.includes(texto) ||
                    cliente.includes(texto);


                const coincideEstado =
                    !estado ||
                    (
                        pedido.estado ||
                        "pendiente"
                    ) === estado;


                let coincideFecha = true;


                if (fecha) {

                    const fechaPedido =
                        obtenerFechaPedido(
                            pedido
                        );


                    if (!fechaPedido) {

                        coincideFecha = false;

                    } else {

                        const diferencia =
                            ahora -
                            fechaPedido;


                        if (fecha === "hoy") {

                            coincideFecha =
                                fechaPedido.toDateString() ===
                                ahora.toDateString();

                        }


                        if (fecha === "7") {

                            coincideFecha =
                                diferencia <=
                                7 * 24 * 60 * 60 * 1000;

                        }


                        if (fecha === "30") {

                            coincideFecha =
                                diferencia <=
                                30 * 24 * 60 * 60 * 1000;

                        }

                    }

                }


                return (
                    coincideTexto &&
                    coincideEstado &&
                    coincideFecha
                );

            }
        );


    mostrarPedidos(
        resultado
    );

}


/* =====================================================
   ACTUALIZAR RESUMEN
===================================================== */

function actualizarResumen() {

    const total =
        document.getElementById(
            "totalPedidos"
        );


    const pendientes =
        document.getElementById(
            "pedidosPendientes"
        );


    const confirmados =
        document.getElementById(
            "pedidosConfirmados"
        );


    const vendido =
        document.getElementById(
            "totalVendido"
        );


    if (total) {

        total.textContent =
            pedidos.length;

    }


    const cantidadPendientes =
        pedidos.filter(
            pedido =>
                (
                    pedido.estado ||
                    "pendiente"
                ) === "pendiente"
        ).length;


    if (pendientes) {

        pendientes.textContent =
            cantidadPendientes;

    }


    const cantidadConfirmados =
        pedidos.filter(
            pedido =>
                (
                    pedido.estado ||
                    "pendiente"
                ) === "confirmado"
        ).length;


    if (confirmados) {

        confirmados.textContent =
            cantidadConfirmados;

    }


    const totalVendido =
        pedidos
            .filter(
                pedido =>
                    (
                        pedido.estado ||
                        "pendiente"
                    ) !== "cancelado"
            )
            .reduce(
                (
                    total,
                    pedido
                ) =>
                    total +
                    Number(
                        pedido.total || 0
                    ),
                0
            );


    if (vendido) {

        vendido.textContent =
            formatearPrecio(
                totalVendido
            );

    }

}


/* =====================================================
   CANTIDAD DE PRODUCTOS
===================================================== */

function obtenerCantidadProductos(
    pedido
) {

    const productos =
        Array.isArray(
            pedido.productos
        )
            ? pedido.productos
            : Array.isArray(
                pedido.items
            )
                ? pedido.items
                : [];


    return productos.reduce(
        (
            total,
            producto
        ) =>
            total +
            Number(
                producto.cantidad || 1
            ),
        0
    );

}


/* =====================================================
   ESTADO VISUAL
===================================================== */

function crearEstadoPedido(
    estado
) {

    const nombres = {

        pendiente:
            "Pendiente",

        confirmado:
            "Confirmado",

        preparando:
            "Preparando",

        enviado:
            "Enviado",

        entregado:
            "Entregado",

        cancelado:
            "Cancelado"

    };


    const clases = {

        pendiente:
            "status-pending",

        confirmado:
            "status-active",

        preparando:
            "status-preparing",

        enviado:
            "status-shipping",

        entregado:
            "status-delivered",

        cancelado:
            "status-out"

    };


    return `

        <span
            class="status ${
                clases[estado] ||
                "status-hidden"
            }"
        >

            ${
                nombres[estado] ||
                "Pendiente"
            }

        </span>

    `;

}


/* =====================================================
   NOMBRE DEL ESTADO
===================================================== */

function obtenerNombreEstado(
    estado
) {

    const nombres = {

        pendiente:
            "Pendiente",

        confirmado:
            "Confirmado",

        preparando:
            "Preparando",

        enviado:
            "Enviado",

        entregado:
            "Entregado",

        cancelado:
            "Cancelado"

    };


    return (
        nombres[estado] ||
        "Pendiente"
    );

}


/* =====================================================
   FECHA DEL PEDIDO
===================================================== */

function obtenerFechaPedido(
    pedido
) {

    const valor =
        pedido.fecha ||
        pedido.fechaCreacion;


    if (!valor) {

        return null;

    }


    const fecha =
        new Date(
            valor
        );


    return isNaN(
        fecha.getTime()
    )
        ? null
        : fecha;

}


/* =====================================================
   FORMATEAR FECHA
===================================================== */

function formatearFecha(
    valor
) {

    if (!valor) {

        return "Sin fecha";

    }


    const fecha =
        new Date(
            valor
        );


    if (
        isNaN(
            fecha.getTime()
        )
    ) {

        return "Sin fecha";

    }


    return new Intl.DateTimeFormat(
        "es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(
        fecha
    );

}


/* =====================================================
   FORMATEAR PRECIO
===================================================== */

function formatearPrecio(
    precio
) {

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0
        }
    ).format(
        Number(
            precio
        ) || 0
    );

}


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escaparHTML(
    texto
) {

    return String(
        texto ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   ESCAPAR ATRIBUTOS
===================================================== */

function escaparAtributo(
    texto
) {

    return String(
        texto ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


/* =====================================================
   ACTUALIZACIÓN DESDE OTRA PESTAÑA
===================================================== */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key !==
            CLAVE_PEDIDOS
        ) {

            return;

        }


        cargarPedidos();

        mostrarPedidos();

        actualizarResumen();

    }
);


/* =====================================================
   ACTUALIZACIÓN MANUAL
===================================================== */

function actualizarPedidos() {

    cargarPedidos();

    mostrarPedidos();

    actualizarResumen();

}


window.actualizarPedidos =
    actualizarPedidos;

window.verPedido =
    verPedido;

window.cambiarEstadoPedido =
    cambiarEstadoPedido;

