/* =========================================================
   CARRITO.JS
   Tienda infantil - Chamaquitos
========================================================= */

const CLAVE_CARRITO = "carrito";

let carrito = [];


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    cargarCarrito();

    actualizarContadorCarrito();

    configurarFinalizarCompra();

});


/* =========================================================
   CARGAR CARRITO
========================================================= */

function cargarCarrito() {

    carrito = obtenerCarrito();

    renderizarCarrito();

}


/* =========================================================
   OBTENER CARRITO DESDE LOCALSTORAGE
========================================================= */

function obtenerCarrito() {

    try {

        const carritoGuardado =
            localStorage.getItem(CLAVE_CARRITO);

        if (!carritoGuardado) {
            return [];
        }

        const datos =
            JSON.parse(carritoGuardado);

        if (!Array.isArray(datos)) {
            return [];
        }

        return datos;

    } catch (error) {

        console.error(
            "Error al cargar el carrito:",
            error
        );

        return [];

    }
}


/* =========================================================
   GUARDAR CARRITO
========================================================= */

function guardarCarrito() {

    try {

        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );

    } catch (error) {

        console.error(
            "Error al guardar el carrito:",
            error
        );

    }
}


/* =========================================================
   RENDERIZAR CARRITO
========================================================= */

function renderizarCarrito() {

    const lista =
        document.getElementById(
            "listaCarrito"
        );

    const carritoVacio =
        document.getElementById(
            "carritoVacio"
        );

    const resumen =
        document.getElementById(
            "resumenCarrito"
        );


    if (!lista) {
        return;
    }


    /* =====================================================
       CARRITO VACÍO
    ===================================================== */

    if (carrito.length === 0) {

        lista.innerHTML = "";

        if (carritoVacio) {
            carritoVacio.style.display = "flex";
        }

        if (resumen) {
            resumen.style.display = "none";
        }

        actualizarResumen();

        return;
    }


    /* =====================================================
       CARRITO CON PRODUCTOS
    ===================================================== */

    if (carritoVacio) {
        carritoVacio.style.display = "none";
    }

    if (resumen) {
        resumen.style.display = "block";
    }


    lista.innerHTML =
        carrito
            .map(
                (producto, indice) =>
                    generarProductoCarrito(
                        producto,
                        indice
                    )
            )
            .join("");


    agregarEventosProductos();

    actualizarResumen();

}


/* =========================================================
   GENERAR PRODUCTO
========================================================= */

function generarProductoCarrito(
    producto,
    indice
) {

    const nombre =
        producto.nombre ||
        "Producto";


    const imagen =
        producto.imagen ||
        "img/sin-imagen.jpg";


    const precio =
        obtenerPrecio(producto);


    const cantidad =
        obtenerCantidad(producto);


    const subtotal =
        precio * cantidad;


    const talle =
        producto.talle ||
        "";


    const color =
        producto.color ||
        "";


    return `

        <article
            class="item-carrito"
            data-indice="${indice}"
        >


            <!-- IMAGEN -->

            <div class="item-carrito-imagen">

                <img
                    src="${escaparHTML(imagen)}"
                    alt="${escaparHTML(nombre)}"
                    onerror="this.src='img/sin-imagen.jpg'"
                >

            </div>


            <!-- INFORMACIÓN -->

            <div class="item-carrito-info">

                <h2 class="item-carrito-nombre">

                    ${escaparHTML(nombre)}

                </h2>


                ${
                    talle
                        ? `
                            <div class="item-carrito-dato">

                                <span>
                                    Talle:
                                </span>

                                <strong>
                                    ${escaparHTML(talle)}
                                </strong>

                            </div>
                        `
                        : ""
                }


                ${
                    color
                        ? `
                            <div class="item-carrito-dato">

                                <span>
                                    Color:
                                </span>

                                <strong>
                                    ${escaparHTML(color)}
                                </strong>

                            </div>
                        `
                        : ""
                }


                <div class="item-carrito-precio">

                    ${formatearPrecio(precio)}

                </div>

            </div>


            <!-- CANTIDAD -->

            <div class="item-carrito-cantidad">

                <span class="cantidad-label">
                    Cantidad
                </span>


                <div class="control-cantidad">

                    <button
                        type="button"
                        class="btn-cantidad btn-restar"
                        data-indice="${indice}"
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>


                    <span class="cantidad-valor">
                        ${cantidad}
                    </span>


                    <button
                        type="button"
                        class="btn-cantidad btn-sumar"
                        data-indice="${indice}"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>

                </div>

            </div>


            <!-- SUBTOTAL -->

            <div class="item-carrito-subtotal">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${formatearPrecio(subtotal)}
                </strong>

            </div>


            <!-- ELIMINAR -->

            <button
                type="button"
                class="btn-eliminar-producto"
                data-indice="${indice}"
                aria-label="Eliminar ${escaparHTML(nombre)}"
                title="Eliminar producto"
            >
                🗑️
            </button>


        </article>

    `;
}


/* =========================================================
   EVENTOS DE LOS PRODUCTOS
========================================================= */

function agregarEventosProductos() {


    /* =====================================================
       SUMAR
    ===================================================== */

    document
        .querySelectorAll(".btn-sumar")
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const indice =
                            Number(
                                boton.dataset.indice
                            );

                        aumentarCantidad(
                            indice
                        );

                    }
                );

            }
        );


    /* =====================================================
       RESTAR
    ===================================================== */

    document
        .querySelectorAll(".btn-restar")
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const indice =
                            Number(
                                boton.dataset.indice
                            );

                        disminuirCantidad(
                            indice
                        );

                    }
                );

            }
        );


    /* =====================================================
       ELIMINAR
    ===================================================== */

    document
        .querySelectorAll(
            ".btn-eliminar-producto"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => {

                        const indice =
                            Number(
                                boton.dataset.indice
                            );

                        eliminarProducto(
                            indice
                        );

                    }
                );

            }
        );

}


/* =========================================================
   AUMENTAR CANTIDAD
========================================================= */

function aumentarCantidad(indice) {

    if (
        !carrito[indice]
    ) {
        return;
    }


    const cantidadActual =
        obtenerCantidad(
            carrito[indice]
        );


    carrito[indice].cantidad =
        cantidadActual + 1;


    guardarCarrito();

    renderizarCarrito();

    actualizarContadorCarrito();

}


/* =========================================================
   DISMINUIR CANTIDAD
========================================================= */

function disminuirCantidad(indice) {

    if (
        !carrito[indice]
    ) {
        return;
    }


    const cantidadActual =
        obtenerCantidad(
            carrito[indice]
        );


    /* =====================================================
       SI HAY UNA UNIDAD, ELIMINAR
    ===================================================== */

    if (cantidadActual <= 1) {

        eliminarProducto(
            indice
        );

        return;
    }


    carrito[indice].cantidad =
        cantidadActual - 1;


    guardarCarrito();

    renderizarCarrito();

    actualizarContadorCarrito();

}


/* =========================================================
   ELIMINAR PRODUCTO
========================================================= */

function eliminarProducto(indice) {

    if (
        !carrito[indice]
    ) {
        return;
    }


    const producto =
        carrito[indice];


    const nombre =
        producto.nombre ||
        "Producto";


    carrito.splice(
        indice,
        1
    );


    guardarCarrito();

    renderizarCarrito();

    actualizarContadorCarrito();


    mostrarMensaje(
        `${nombre} fue eliminado del carrito.`,
        "exito"
    );

}


/* =========================================================
   ACTUALIZAR RESUMEN
========================================================= */

function actualizarResumen() {

    let cantidadTotal = 0;

    let subtotal = 0;


    carrito.forEach(
        producto => {

            const cantidad =
                obtenerCantidad(
                    producto
                );


            const precio =
                obtenerPrecio(
                    producto
                );


            cantidadTotal +=
                cantidad;


            subtotal +=
                precio * cantidad;

        }
    );


    /* =====================================================
       CANTIDAD
    ===================================================== */

    const cantidadElemento =
        document.getElementById(
            "cantidadResumen"
        );


    if (cantidadElemento) {

        cantidadElemento.textContent =
            cantidadTotal;

    }


    /* =====================================================
       SUBTOTAL
    ===================================================== */

    const subtotalElemento =
        document.getElementById(
            "subtotalCarrito"
        );


    if (subtotalElemento) {

        subtotalElemento.textContent =
            formatearPrecio(
                subtotal
            );

    }


    /* =====================================================
       ENVÍO
    ===================================================== */

    const envioElemento =
        document.getElementById(
            "envioCarrito"
        );


    if (envioElemento) {

        if (cantidadTotal > 0) {

            envioElemento.textContent =
                "A consultar";

        } else {

            envioElemento.textContent =
                "$0";

        }

    }


    /* =====================================================
       TOTAL
    ===================================================== */

    const totalElemento =
        document.getElementById(
            "totalCarrito"
        );


    if (totalElemento) {

        totalElemento.textContent =
            formatearPrecio(
                subtotal
            );

    }

}


/* =========================================================
   CONTADOR DEL CARRITO
========================================================= */

function actualizarContadorCarrito() {

    const cantidad =
        carrito.reduce(
            (
                total,
                producto
            ) => {

                return total +
                    obtenerCantidad(
                        producto
                    );

            },
            0
        );


    /* =====================================================
       CONTADOR PRINCIPAL
    ===================================================== */

    const contador =
        document.getElementById(
            "contadorCarrito"
        );


    if (contador) {

        contador.textContent =
            cantidad;


        contador.style.display =
            cantidad > 0
                ? "inline-flex"
                : "none";

    }


    /* =====================================================
       OTROS CONTADORES
    ===================================================== */

    document
        .querySelectorAll(
            ".contador-carrito"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    cantidad;


                elemento.style.display =
                    cantidad > 0
                        ? "inline-flex"
                        : "none";

            }
        );

}


/* =========================================================
   FINALIZAR COMPRA
========================================================= */

function configurarFinalizarCompra() {

    const boton =
        document.getElementById(
            "btnFinalizarCompra"
        );


    if (!boton) {
        return;
    }


    boton.addEventListener(
        "click",
        () => {

            if (
                carrito.length === 0
            ) {

                mostrarMensaje(
                    "Tu carrito está vacío.",
                    "error"
                );

                return;
            }


            /*
                Por ahora llevamos al usuario
                a pedidos.html.

                Más adelante podemos convertir
                esta parte en un verdadero proceso
                de checkout.
            */

            window.location.href =
                "pedidos.html";

        }
    );

}


/* =========================================================
   OBTENER PRECIO
========================================================= */

function obtenerPrecio(producto) {

    const precio =
        Number(
            producto.precio ||
            producto.precioVenta ||
            producto.valor ||
            0
        );


    if (
        isNaN(precio)
    ) {

        return 0;

    }


    return precio;

}


/* =========================================================
   OBTENER CANTIDAD
========================================================= */

function obtenerCantidad(producto) {

    const cantidad =
        Number(
            producto.cantidad
        );


    if (
        isNaN(cantidad) ||
        cantidad < 1
    ) {

        return 1;

    }


    return Math.floor(
        cantidad
    );

}


/* =========================================================
   FORMATEAR PRECIO
========================================================= */

function formatearPrecio(precio) {

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0
        }
    ).format(
        Number(precio) || 0
    );

}


/* =========================================================
   MOSTRAR MENSAJE
========================================================= */

function mostrarMensaje(
    mensaje,
    tipo = "info"
) {

    const elemento =
        document.getElementById(
            "mensajeCarrito"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.className =
        `mensaje-carrito ${tipo}`;


    clearTimeout(
        mostrarMensaje.timeout
    );


    mostrarMensaje.timeout =
        setTimeout(
            () => {

                elemento.textContent =
                    "";

                elemento.className =
                    "mensaje-carrito";

            },
            3000
        );

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)

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


/* =========================================================
   ACTUALIZAR AUTOMÁTICAMENTE SI CAMBIA EL STORAGE
========================================================= */

window.addEventListener(
    "storage",
    evento => {

        if (
            evento.key ===
            CLAVE_CARRITO
        ) {

            carrito =
                obtenerCarrito();

            renderizarCarrito();

            actualizarContadorCarrito();

        }

    }
);


/* =========================================================
   FUNCIONES DISPONIBLES GLOBALMENTE
========================================================= */

window.cargarCarrito =
    cargarCarrito;

window.actualizarContadorCarrito =
    actualizarContadorCarrito;

window.eliminarProducto =
    eliminarProducto;