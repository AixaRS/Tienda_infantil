const CLAVE_CARRITO = "tienda_carrito";
const CLAVE_PRODUCTOS = "tienda_productos";

let carrito = [];


/* =====================================================
   INICIAR
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    cargarCarrito();

    mostrarCarrito();

    configurarBotonCarrito();

    configurarFinalizarCompra();

});


/* =====================================================
   CARGAR CARRITO
===================================================== */

function cargarCarrito() {

    const datos =
        localStorage.getItem(
            CLAVE_CARRITO
        );


    if (!datos) {

        carrito = [];

        return;

    }


    try {

        const datosGuardados =
            JSON.parse(datos);


        if (
            Array.isArray(
                datosGuardados
            )
        ) {

            carrito =
                datosGuardados;

        } else {

            carrito = [];

        }

    } catch (error) {

        console.error(
            "Error al cargar el carrito:",
            error
        );

        carrito = [];

    }

}


/* =====================================================
   GUARDAR CARRITO
===================================================== */

function guardarCarrito() {

    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );

}


/* =====================================================
   MOSTRAR CARRITO
===================================================== */

function mostrarCarrito() {

    const contenedor =
        document.getElementById(
            "listaCarrito"
        );

    const carritoVacio =
        document.getElementById(
            "carritoVacio"
        );


    if (!contenedor) {

        return;

    }


    /* -------------------------------------
       CARRITO VACÍO
    ------------------------------------- */

    if (carrito.length === 0) {

        contenedor.innerHTML = "";

        if (carritoVacio) {

            carritoVacio.hidden = false;

        }

        actualizarResumen();

        return;

    }


    if (carritoVacio) {

        carritoVacio.hidden = true;

    }


    /* -------------------------------------
       MOSTRAR PRODUCTOS
    ------------------------------------- */

    contenedor.innerHTML =
        carrito
            .map(
                producto =>
                    crearProductoCarrito(
                        producto
                    )
            )
            .join("");


    actualizarResumen();

}


/* =====================================================
   CREAR PRODUCTO DEL CARRITO
===================================================== */

function crearProductoCarrito(
    producto
) {

    const nombre =
        escaparHTML(
            producto.nombre
        );


    const precio =
        Number(
            producto.precio
        ) || 0;


    const cantidad =
        Number(
            producto.cantidad
        ) || 1;


    const subtotal =
        precio * cantidad;


    let imagenHTML = "";


    /* -------------------------------------
       IMAGEN
    ------------------------------------- */

    if (
        Array.isArray(
            producto.imagenes
        ) &&
        producto.imagenes.length > 0
    ) {

        imagenHTML = `

            <img
                src="${escaparAtributo(
                    producto.imagenes[0]
                )}"
                alt="${nombre}"
                class="carrito-producto-imagen"
                onerror="this.style.display='none'"
            >

        `;

    } else if (
        producto.imagen
    ) {

        imagenHTML = `

            <img
                src="${escaparAtributo(
                    producto.imagen
                )}"
                alt="${nombre}"
                class="carrito-producto-imagen"
                onerror="this.style.display='none'"
            >

        `;

    } else {

        imagenHTML = `

            <div class="carrito-producto-placeholder">

                FOTO

            </div>

        `;

    }


    return `

        <article
            class="carrito-producto"
            data-id="${escaparAtributo(
                producto.id
            )}"
        >

            <div class="carrito-producto-imagen-contenedor">

                ${imagenHTML}

            </div>


            <div class="carrito-producto-info">

                <div>

                    <span class="carrito-producto-categoria">

                        ${escaparHTML(
                            obtenerNombreCategoria(
                                producto.categoria
                            )
                        )}

                    </span>


                    <h3 class="carrito-producto-nombre">

                        ${nombre}

                    </h3>


                    <span class="carrito-producto-precio">

                        ${formatearPrecio(
                            precio
                        )}

                    </span>

                </div>


                <div class="carrito-producto-controles">

                    <div class="carrito-cantidad">

                        <button
                            type="button"
                            onclick="cambiarCantidad(
                                '${escaparAtributo(producto.id)}',
                                -1
                            )"
                            aria-label="Disminuir cantidad"
                        >

                            −

                        </button>


                        <span>

                            ${cantidad}

                        </span>


                        <button
                            type="button"
                            onclick="cambiarCantidad(
                                '${escaparAtributo(producto.id)}',
                                1
                            )"
                            aria-label="Aumentar cantidad"
                        >

                            +

                        </button>

                    </div>


                    <strong class="carrito-producto-subtotal">

                        ${formatearPrecio(
                            subtotal
                        )}

                    </strong>


                    <button
                        type="button"
                        class="carrito-eliminar"
                        onclick="eliminarDelCarrito(
                            '${escaparAtributo(producto.id)}'
                        )"
                    >

                        Eliminar

                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =====================================================
   AGREGAR PRODUCTO
===================================================== */

function agregarAlCarrito(
    producto
) {

    if (!producto) {

        return;

    }


    const id =
        String(
            producto.id
        );


    const productoExistente =
        carrito.find(
            item =>
                String(item.id) === id
        );


    if (productoExistente) {

        productoExistente.cantidad =
            Number(
                productoExistente.cantidad
            ) + 1;

    } else {

        carrito.push({

            id:
                producto.id,

            nombre:
                producto.nombre,

            precio:
                Number(
                    producto.precio
                ) || 0,

            categoria:
                producto.categoria || "",

            imagen:
                producto.imagen || "",

            imagenes:
                Array.isArray(
                    producto.imagenes
                )
                    ? producto.imagenes
                    : [],

            cantidad: 1

        });

    }


    guardarCarrito();

    actualizarContadorCarrito();

    mostrarMensajeCarrito(
        producto.nombre
    );

}


/* =====================================================
   CAMBIAR CANTIDAD
===================================================== */

function cambiarCantidad(
    id,
    cambio
) {

    const producto =
        carrito.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!producto) {

        return;

    }


    producto.cantidad =
        Number(
            producto.cantidad
        ) + Number(cambio);


    if (
        producto.cantidad <= 0
    ) {

        eliminarDelCarrito(
            id
        );

        return;

    }


    guardarCarrito();

    mostrarCarrito();

    actualizarContadorCarrito();

}


/* =====================================================
   ELIMINAR PRODUCTO
===================================================== */

function eliminarDelCarrito(
    id
) {

    carrito =
        carrito.filter(
            producto =>
                String(producto.id) !==
                String(id)
        );


    guardarCarrito();

    mostrarCarrito();

    actualizarContadorCarrito();

}


/* =====================================================
   ACTUALIZAR RESUMEN
===================================================== */

function actualizarResumen() {

    const cantidadElemento =
        document.getElementById(
            "cantidadCarrito"
        );

    const subtotalElemento =
        document.getElementById(
            "subtotalCarrito"
        );

    const totalElemento =
        document.getElementById(
            "totalCarrito"
        );


    const cantidad =
        carrito.reduce(
            (
                total,
                producto
            ) =>
                total +
                (
                    Number(
                        producto.cantidad
                    ) || 0
                ),
            0
        );


    const subtotal =
        carrito.reduce(
            (
                total,
                producto
            ) =>
                total +
                (
                    Number(
                        producto.precio
                    ) || 0
                ) *
                (
                    Number(
                        producto.cantidad
                    ) || 0
                ),
            0
        );


    if (cantidadElemento) {

        cantidadElemento.textContent =
            cantidad;

    }


    if (subtotalElemento) {

        subtotalElemento.textContent =
            formatearPrecio(
                subtotal
            );

    }


    if (totalElemento) {

        totalElemento.textContent =
            formatearPrecio(
                subtotal
            );

    }

}


/* =====================================================
   CONTADOR DEL CARRITO
===================================================== */

function obtenerCantidadCarrito() {

    return carrito.reduce(
        (
            total,
            producto
        ) =>
            total +
            (
                Number(
                    producto.cantidad
                ) || 0
            ),
        0
    );

}


function actualizarContadorCarrito() {

    const cantidad =
        obtenerCantidadCarrito();


    const boton =
        document.getElementById(
            "btnCarrito"
        );


    if (!boton) {

        return;

    }


    boton.setAttribute(
        "data-cantidad",
        cantidad
    );


    if (cantidad > 0) {

        boton.title =
            `Carrito (${cantidad})`;

    } else {

        boton.title =
            "Carrito";

    }

}


/* =====================================================
   BOTÓN DEL CARRITO
===================================================== */

function configurarBotonCarrito() {

    const boton =
        document.getElementById(
            "btnCarrito"
        );


    if (!boton) {

        return;

    }


    boton.addEventListener(
        "click",
        () => {

            /*
             * Si estamos dentro de carrito.html,
             * no hacemos nada.
             */

            if (
                window.location.pathname
                    .endsWith(
                        "carrito.html"
                    )
            ) {

                return;

            }


            window.location.href =
                "carrito.html";

        }
    );


    actualizarContadorCarrito();

}


/* =====================================================
   FINALIZAR COMPRA
===================================================== */

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

                alert(
                    "Tu carrito está vacío."
                );

                return;

            }


            /*
             * Por ahora mostramos
             * el pedido en pantalla.
             *
             * Más adelante podemos
             * conectarlo con WhatsApp.
             */

            let mensaje =
                "Hola, quiero realizar el siguiente pedido:%0A%0A";


            carrito.forEach(
                producto => {

                    mensaje +=
                        `• ${producto.nombre} x${producto.cantidad} - ${formatearPrecio(producto.precio * producto.cantidad)}%0A`;

                }
            );


            const total =
                carrito.reduce(
                    (
                        suma,
                        producto
                    ) =>
                        suma +
                        (
                            Number(
                                producto.precio
                            ) *
                            Number(
                                producto.cantidad
                            )
                        ),
                    0
                );


            mensaje +=
                `%0ATotal: ${formatearPrecio(total)}`;


            /*
             * MÁS ADELANTE
             * reemplazamos esto por
             * el número real de WhatsApp.
             */

            alert(
                "El pedido está listo. Próximamente lo conectaremos con WhatsApp."
            );

        }
    );

}


/* =====================================================
   MENSAJE DE PRODUCTO AGREGADO
===================================================== */

function mostrarMensajeCarrito(
    nombre
) {

    let mensaje =
        document.getElementById(
            "mensajeCarrito"
        );


    if (!mensaje) {

        mensaje =
            document.createElement(
                "div"
            );

        mensaje.id =
            "mensajeCarrito";

        mensaje.className =
            "mensaje-carrito";

        document.body.appendChild(
            mensaje
        );

    }


    mensaje.innerHTML = `

        <strong>
            Producto agregado
        </strong>

        <span>
            ${escaparHTML(nombre)}
            fue agregado al carrito.
        </span>

        <button
            type="button"
            onclick="window.location.href='carrito.html'"
        >
            VER CARRITO
        </button>

    `;


    requestAnimationFrame(
        () => {

            mensaje.classList.add(
                "visible"
            );

        }
    );


    setTimeout(
        () => {

            mensaje.classList.remove(
                "visible"
            );

        },
        3500
    );

}


/* =====================================================
   CATEGORÍA
===================================================== */

function obtenerNombreCategoria(
    categoria
) {

    const categorias = {

        ninas: "Niñas",

        ninos: "Niños",

        bebes: "Bebés",

        accesorios: "Accesorios"

    };


    return (
        categorias[categoria] ||
        "Ropa infantil"
    );

}


/* =====================================================
   PRECIO
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
        Number(precio) || 0
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
   ACTUALIZACIÓN ENTRE PÁGINAS
===================================================== */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key !==
            CLAVE_CARRITO
        ) {

            return;

        }


        cargarCarrito();

        mostrarCarrito();

        actualizarContadorCarrito();

    }
);


/* =====================================================
   FUNCIONES PÚBLICAS
===================================================== */

window.agregarAlCarrito =
    agregarAlCarrito;

window.cambiarCantidad =
    cambiarCantidad;

window.eliminarDelCarrito =
    eliminarDelCarrito;

window.mostrarCarrito =
    mostrarCarrito;

window.actualizarContadorCarrito =
    actualizarContadorCarrito;

