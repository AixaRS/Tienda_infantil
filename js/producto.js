const CLAVE_PRODUCTOS = "tienda_productos";
const CLAVE_CARRITO = "carrito";

/* =========================================================
   INICIAR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    cargarProducto();
});


/* =========================================================
   OBTENER ID DEL PRODUCTO DESDE LA URL
========================================================= */

function obtenerIdProducto() {

    const parametros = new URLSearchParams(window.location.search);

    return parametros.get("id");
}


/* =========================================================
   OBTENER PRODUCTOS
========================================================= */

function obtenerProductos() {

    try {

        const productosGuardados =
            localStorage.getItem(CLAVE_PRODUCTOS);

        if (!productosGuardados) {
            return [];
        }

        const productos = JSON.parse(productosGuardados);

        return Array.isArray(productos) ? productos : [];

    } catch (error) {

        console.error(
            "Error al obtener los productos:",
            error
        );

        return [];
    }
}


/* =========================================================
   CARGAR PRODUCTO
========================================================= */

function cargarProducto() {

    const contenedor =
        document.getElementById("productoDetalle");

    if (!contenedor) {
        console.error(
            "No se encontró #productoDetalle"
        );
        return;
    }

    const idProducto = obtenerIdProducto();

    if (!idProducto) {

        mostrarErrorProducto(
            "No se especificó ningún producto."
        );

        return;
    }


    const productos = obtenerProductos();

    const producto = productos.find(
        producto =>
            String(producto.id) === String(idProducto)
    );


    if (!producto) {

        mostrarErrorProducto(
            "El producto no existe o fue eliminado."
        );

        return;
    }


    mostrarProducto(
        producto,
        contenedor
    );
}


/* =========================================================
   MOSTRAR PRODUCTO
========================================================= */

function mostrarProducto(producto, contenedor) {

    const imagenPrincipal =
        obtenerImagenPrincipal(producto);

    const imagenes =
        obtenerImagenes(producto);

    const precio =
        obtenerPrecio(producto);

    const stock =
        obtenerStock(producto);


    document.title =
        `${producto.nombre || "Producto"} | Chamaquitos`;


    contenedor.innerHTML = `

        <div class="producto-imagenes">

            <div class="producto-imagen-principal">

                <img
                    id="imagenProductoPrincipal"
                    src="${escaparHTML(imagenPrincipal)}"
                    alt="${escaparHTML(producto.nombre || "Producto")}"
                    onerror="this.src='img/sin-imagen.jpg'"
                >

            </div>


            ${
                imagenes.length > 1
                    ? `
                        <div class="producto-miniaturas">

                            ${imagenes.map((imagen, index) => `

                                <button
                                    type="button"
                                    class="producto-miniatura ${index === 0 ? "activa" : ""}"
                                    onclick="cambiarImagenProducto('${escaparHTML(imagen)}', this)"
                                    aria-label="Ver imagen ${index + 1}"
                                >

                                    <img
                                        src="${escaparHTML(imagen)}"
                                        alt="${escaparHTML(producto.nombre || "Producto")} ${index + 1}"
                                        onerror="this.style.display='none'"
                                    >

                                </button>

                            `).join("")}

                        </div>
                    `
                    : ""
            }

        </div>



        <div class="producto-informacion">

            <div class="producto-categoria">

                ${escaparHTML(
                    producto.categoria || "Ropa infantil"
                )}

            </div>


            <h1 class="producto-titulo">

                ${escaparHTML(
                    producto.nombre || "Producto sin nombre"
                )}

            </h1>


            <div class="producto-precio">

                ${formatearPrecio(precio)}

            </div>


            ${
                producto.descripcion
                    ? `
                        <div class="producto-descripcion">

                            <h2>
                                Descripción
                            </h2>

                            <p>
                                ${escaparHTML(producto.descripcion)}
                            </p>

                        </div>
                    `
                    : ""
            }


            ${
                obtenerTalles(producto).length > 0
                    ? `
                        <div class="producto-opcion">

                            <div class="producto-opcion-titulo">

                                <span>
                                    Talle
                                </span>

                                <span
                                    id="talleSeleccionadoTexto"
                                    class="opcion-seleccionada"
                                >
                                    Seleccioná un talle
                                </span>

                            </div>


                            <div
                                id="selectorTalles"
                                class="selector-talles"
                            >

                                ${generarTalles(producto)}

                            </div>

                        </div>
                    `
                    : ""
            }


            ${
                obtenerColores(producto).length > 0
                    ? `
                        <div class="producto-opcion">

                            <div class="producto-opcion-titulo">

                                <span>
                                    Color
                                </span>

                                <span
                                    id="colorSeleccionadoTexto"
                                    class="opcion-seleccionada"
                                >
                                    Seleccioná un color
                                </span>

                            </div>


                            <div
                                id="selectorColores"
                                class="selector-colores"
                            >

                                ${generarColores(producto)}

                            </div>

                        </div>
                    `
                    : ""
            }


            <div class="producto-opcion">

                <div class="producto-opcion-titulo">

                    <span>
                        Cantidad
                    </span>

                </div>


                <div class="selector-cantidad">

                    <button
                        type="button"
                        id="btnRestarCantidad"
                        class="cantidad-btn"
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>


                    <span
                        id="cantidadProducto"
                        class="cantidad-valor"
                    >
                        1
                    </span>


                    <button
                        type="button"
                        id="btnSumarCantidad"
                        class="cantidad-btn"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>

                </div>

            </div>


            <div
                id="mensajeProducto"
                class="mensaje-producto"
                role="alert"
            ></div>


            ${
                stock > 0
                    ? `
                        <button
                            type="button"
                            id="btnAgregarCarrito"
                            class="btn-agregar-carrito"
                        >
                            Agregar al carrito
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="btn-agregar-carrito agotado"
                            disabled
                        >
                            Producto agotado
                        </button>
                    `
            }


            <a
                href="categoria.html"
                class="btn-volver-tienda"
            >
                ← Volver a la tienda
            </a>


            <div class="producto-info-extra">

                <div class="producto-info-item">

                    <span class="info-icono">
                        🚚
                    </span>

                    <div>

                        <strong>
                            Envíos
                        </strong>

                        <small>
                            Consultá las opciones disponibles
                        </small>

                    </div>

                </div>


                <div class="producto-info-item">

                    <span class="info-icono">
                        🔒
                    </span>

                    <div>

                        <strong>
                            Compra segura
                        </strong>

                        <small>
                            Tus datos están protegidos
                        </small>

                    </div>

                </div>


                <div class="producto-info-item">

                    <span class="info-icono">
                        💬
                    </span>

                    <div>

                        <strong>
                            ¿Tenés dudas?
                        </strong>

                        <small>
                            Estamos para ayudarte
                        </small>

                    </div>

                </div>

            </div>

        </div>

    `;


    inicializarProducto(
        producto,
        stock
    );
}


/* =========================================================
   INICIALIZAR PRODUCTO
========================================================= */

function inicializarProducto(producto, stock) {

    let cantidad = 1;


    const cantidadElemento =
        document.getElementById("cantidadProducto");

    const btnRestar =
        document.getElementById("btnRestarCantidad");

    const btnSumar =
        document.getElementById("btnSumarCantidad");

    const btnAgregar =
        document.getElementById("btnAgregarCarrito");


    /* =====================================================
       CANTIDAD -
    ===================================================== */

    if (btnRestar) {

        btnRestar.addEventListener(
            "click",
            () => {

                if (cantidad > 1) {

                    cantidad--;

                    actualizarCantidad();

                }

            }
        );

    }


    /* =====================================================
       CANTIDAD +
    ===================================================== */

    if (btnSumar) {

        btnSumar.addEventListener(
            "click",
            () => {

                if (cantidad < stock) {

                    cantidad++;

                    actualizarCantidad();

                } else {

                    mostrarMensaje(
                        `Solo hay ${stock} unidad${stock === 1 ? "" : "es"} disponible${stock === 1 ? "" : "s"}.`,
                        "advertencia"
                    );

                }

            }
        );

    }


    /* =====================================================
       ACTUALIZAR CANTIDAD
    ===================================================== */

    function actualizarCantidad() {

        if (cantidadElemento) {

            cantidadElemento.textContent =
                cantidad;

        }

    }


    /* =====================================================
       AGREGAR AL CARRITO
    ===================================================== */

    if (btnAgregar) {

        btnAgregar.addEventListener(
            "click",
            () => {

                agregarAlCarrito(
                    producto,
                    cantidad
                );

            }
        );

    }


    /* =====================================================
       TALLE
    ===================================================== */

    const botonesTalle =
        document.querySelectorAll(
            ".btn-talle"
        );


    botonesTalle.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    botonesTalle.forEach(
                        btn =>
                            btn.classList.remove("seleccionado")
                    );


                    boton.classList.add(
                        "seleccionado"
                    );


                    const texto =
                        document.getElementById(
                            "talleSeleccionadoTexto"
                        );


                    if (texto) {

                        texto.textContent =
                            boton.dataset.talle;

                    }

                }
            );

        }
    );


    /* =====================================================
       COLOR
    ===================================================== */

    const botonesColor =
        document.querySelectorAll(
            ".btn-color"
        );


    botonesColor.forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    if (
                        boton.disabled ||
                        boton.classList.contains("agotado")
                    ) {
                        return;
                    }


                    botonesColor.forEach(
                        btn =>
                            btn.classList.remove(
                                "seleccionado"
                            )
                    );


                    boton.classList.add(
                        "seleccionado"
                    );


                    const texto =
                        document.getElementById(
                            "colorSeleccionadoTexto"
                        );


                    if (texto) {

                        texto.textContent =
                            boton.dataset.color;

                    }

                }
            );

        }
    );
}


/* =========================================================
   GENERAR TALLES
========================================================= */

function generarTalles(producto) {

    const talles =
        obtenerTalles(producto);


    return talles.map(
        talle => `

            <button
                type="button"
                class="btn-talle"
                data-talle="${escaparHTML(talle)}"
            >

                ${escaparHTML(talle)}

            </button>

        `
    ).join("");
}


/* =========================================================
   GENERAR COLORES
========================================================= */

function generarColores(producto) {

    const colores =
        obtenerColores(producto);


    return colores.map(
        color => {

            const nombre =
                typeof color === "string"
                    ? color
                    : color.nombre || color.name || "";


            const codigo =
                typeof color === "string"
                    ? obtenerCodigoColor(color)
                    : color.codigo ||
                      color.hex ||
                      obtenerCodigoColor(nombre);


            const agotado =
                typeof color === "object" &&
                (
                    color.stock === 0 ||
                    color.agotado === true
                );


            return `

                <button
                    type="button"
                    class="btn-color ${agotado ? "agotado" : ""}"
                    data-color="${escaparHTML(nombre)}"
                    title="${escaparHTML(nombre)}"
                    aria-label="Color ${escaparHTML(nombre)}"
                    ${agotado ? "disabled" : ""}
                >

                    <span
                        class="bolita-color"
                        style="background-color: ${escaparHTML(codigo)}"
                    ></span>

                    ${
                        agotado
                            ? `
                                <span class="color-agotado">
                                    ×
                                </span>
                            `
                            : ""
                    }

                </button>

            `;

        }
    ).join("");
}


/* =========================================================
   AGREGAR AL CARRITO
========================================================= */

function agregarAlCarrito(
    producto,
    cantidad
) {

    const talleElemento =
        document.querySelector(
            ".btn-talle.seleccionado"
        );


    const colorElemento =
        document.querySelector(
            ".btn-color.seleccionado"
        );


    const talles =
        obtenerTalles(producto);


    const colores =
        obtenerColores(producto);


    /* =====================================================
       VALIDAR TALLE
    ===================================================== */

    if (talles.length > 0 && !talleElemento) {

        mostrarMensaje(
            "Seleccioná un talle antes de agregar el producto.",
            "error"
        );

        return;
    }


    /* =====================================================
       VALIDAR COLOR
    ===================================================== */

    if (colores.length > 0 && !colorElemento) {

        mostrarMensaje(
            "Seleccioná un color antes de agregar el producto.",
            "error"
        );

        return;
    }


    const talle =
        talleElemento
            ? talleElemento.dataset.talle
            : "";


    const color =
        colorElemento
            ? colorElemento.dataset.color
            : "";


    const precio =
        obtenerPrecio(producto);


    let carrito = [];


    try {

        const carritoGuardado =
            localStorage.getItem(CLAVE_CARRITO);


        if (carritoGuardado) {

            carrito =
                JSON.parse(carritoGuardado);

        }


        if (!Array.isArray(carrito)) {

            carrito = [];

        }

    } catch (error) {

        console.error(
            "Error al leer el carrito:",
            error
        );

        carrito = [];

    }


    /* =====================================================
       BUSCAR PRODUCTO IGUAL
    ===================================================== */

    const productoExistente =
        carrito.find(item =>

            String(item.id) ===
                String(producto.id)

            &&

            String(item.talle || "") ===
                String(talle)

            &&

            String(item.color || "") ===
                String(color)

        );


    if (productoExistente) {

        productoExistente.cantidad =
            Number(productoExistente.cantidad || 0) +
            cantidad;

    } else {

        carrito.push({

            id: producto.id,

            nombre:
                producto.nombre || "",

            precio:
                precio,

            imagen:
                obtenerImagenPrincipal(producto),

            talle:
                talle,

            color:
                color,

            cantidad:
                cantidad

        });

    }


    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );


    mostrarMensaje(
        "¡Producto agregado al carrito!",
        "exito"
    );


    actualizarContadorCarrito();


    /* =====================================================
       CAMBIAR BOTÓN
    ===================================================== */

    const boton =
        document.getElementById(
            "btnAgregarCarrito"
        );


    if (boton) {

        const textoOriginal =
            boton.textContent;


        boton.textContent =
            "✓ Agregado al carrito";


        boton.classList.add(
            "agregado"
        );


        setTimeout(
            () => {

                boton.textContent =
                    textoOriginal;

                boton.classList.remove(
                    "agregado"
                );

            },
            1800
        );

    }

}


/* =========================================================
   ACTUALIZAR CONTADOR DEL CARRITO
========================================================= */

function actualizarContadorCarrito() {

    const carrito =
        obtenerCarrito();


    const cantidad =
        carrito.reduce(
            (total, producto) =>
                total +
                Number(producto.cantidad || 0),
            0
        );


    const elementos =
        document.querySelectorAll(
            ".contador-carrito"
        );


    elementos.forEach(
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
   OBTENER CARRITO
========================================================= */

function obtenerCarrito() {

    try {

        const carrito =
            localStorage.getItem(
                CLAVE_CARRITO
            );


        if (!carrito) {
            return [];
        }


        const datos =
            JSON.parse(carrito);


        return Array.isArray(datos)
            ? datos
            : [];

    } catch (error) {

        return [];

    }
}


/* =========================================================
   CAMBIAR IMAGEN
========================================================= */

function cambiarImagenProducto(
    imagen,
    boton
) {

    const imagenPrincipal =
        document.getElementById(
            "imagenProductoPrincipal"
        );


    if (!imagenPrincipal) {
        return;
    }


    imagenPrincipal.src =
        imagen;


    document
        .querySelectorAll(
            ".producto-miniatura"
        )
        .forEach(
            miniatura =>
                miniatura.classList.remove(
                    "activa"
                )
        );


    if (boton) {

        boton.classList.add(
            "activa"
        );

    }

}


/* =========================================================
   OBTENER IMAGEN PRINCIPAL
========================================================= */

function obtenerImagenPrincipal(producto) {

    if (
        producto.imagen &&
        typeof producto.imagen === "string"
    ) {

        return producto.imagen;

    }


    if (
        producto.imagenes &&
        Array.isArray(producto.imagenes) &&
        producto.imagenes.length > 0
    ) {

        return producto.imagenes[0];

    }


    if (
        producto.fotos &&
        Array.isArray(producto.fotos) &&
        producto.fotos.length > 0
    ) {

        return producto.fotos[0];

    }


    return "img/sin-imagen.jpg";
}


/* =========================================================
   OBTENER TODAS LAS IMÁGENES
========================================================= */

function obtenerImagenes(producto) {

    let imagenes = [];


    if (
        producto.imagenes &&
        Array.isArray(producto.imagenes)
    ) {

        imagenes =
            producto.imagenes;

    }


    else if (
        producto.fotos &&
        Array.isArray(producto.fotos)
    ) {

        imagenes =
            producto.fotos;

    }


    else if (
        producto.imagen
    ) {

        imagenes = [
            producto.imagen
        ];

    }


    return imagenes.filter(
        imagen =>
            typeof imagen === "string" &&
            imagen.trim() !== ""
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


    return isNaN(precio)
        ? 0
        : precio;
}


/* =========================================================
   OBTENER STOCK
========================================================= */

function obtenerStock(producto) {

    const stock =
        Number(
            producto.stock ??
            producto.cantidad ??
            0
        );


    return isNaN(stock)
        ? 0
        : Math.max(0, stock);
}


/* =========================================================
   OBTENER TALLES
========================================================= */

function obtenerTalles(producto) {

    if (
        Array.isArray(producto.talles)
    ) {

        return producto.talles
            .map(talle => {

                if (
                    typeof talle === "object"
                ) {

                    return (
                        talle.nombre ||
                        talle.talle ||
                        talle.valor ||
                        ""
                    );

                }

                return String(talle);

            })
            .filter(Boolean);

    }


    if (
        typeof producto.talles === "string"
    ) {

        return producto.talles
            .split(",")
            .map(talle => talle.trim())
            .filter(Boolean);

    }


    if (
        Array.isArray(producto.talle)
    ) {

        return producto.talle
            .map(talle => String(talle))
            .filter(Boolean);

    }


    return [];
}


/* =========================================================
   OBTENER COLORES
========================================================= */

function obtenerColores(producto) {

    if (
        Array.isArray(producto.colores)
    ) {

        return producto.colores;

    }


    if (
        typeof producto.colores === "string"
    ) {

        return producto.colores
            .split(",")
            .map(color => color.trim())
            .filter(Boolean);

    }


    if (
        Array.isArray(producto.coloresDisponibles)
    ) {

        return producto.coloresDisponibles;

    }


    return [];
}


/* =========================================================
   OBTENER CÓDIGO HEX DEL COLOR
========================================================= */

function obtenerCodigoColor(nombre) {

    const colores = {

        rojo: "#e53935",

        azul: "#1e88e5",

        celeste: "#4fc3f7",

        verde: "#43a047",

        amarillo: "#fdd835",

        naranja: "#fb8c00",

        rosa: "#ec407a",

        rosado: "#ec407a",

        violeta: "#8e44ad",

        morado: "#8e44ad",

        lila: "#ce93d8",

        negro: "#171717",

        blanco: "#ffffff",

        gris: "#9e9e9e",

        marron: "#795548",

        café: "#795548",

        beige: "#d7ccc8",

        natural: "#d7ccc8",

        bordo: "#880e4f",

        bordó: "#880e4f",

        turquesa: "#26a69a",

        dorado: "#d4af37",

        plateado: "#bdbdbd"

    };


    const clave =
        String(nombre)
            .toLowerCase()
            .trim();


    return colores[clave] || "#cccccc";
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
    ).format(precio);
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
            "mensajeProducto"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.className =
        `mensaje-producto ${tipo}`;


    clearTimeout(
        mostrarMensaje.timeout
    );


    mostrarMensaje.timeout =
        setTimeout(
            () => {

                elemento.textContent =
                    "";

                elemento.className =
                    "mensaje-producto";

            },
            3000
        );
}


/* =========================================================
   ERROR DE PRODUCTO
========================================================= */

function mostrarErrorProducto(
    mensaje
) {

    const contenedor =
        document.getElementById(
            "productoDetalle"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `

        <div class="producto-error">

            <div class="producto-error-icono">
                😕
            </div>

            <h1>
                Producto no encontrado
            </h1>

            <p>
                ${escaparHTML(mensaje)}
            </p>

            <a
                href="categoria.html"
                class="btn-volver-tienda"
            >
                ← Volver a la tienda
            </a>

        </div>

    `;
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   EXPONER FUNCIÓN PARA LAS MINIATURAS
========================================================= */

window.cambiarImagenProducto =
    cambiarImagenProducto;