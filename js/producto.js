
const CLAVE_PRODUCTOS = "tienda_productos";
const CLAVE_CARRITO = "tienda_carrito";

/* =========================================================
   INICIAR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    cargarProducto();
});

/* =========================================================
   OBTENER ID DE LA URL
========================================================= */

function obtenerIdProducto() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    return parametros.get("id");
}

/* =========================================================
   CARGAR PRODUCTO
========================================================= */

function cargarProducto() {

    const contenedor = document.getElementById(
        "productoDetalle"
    );

    if (!contenedor) {
        console.error("No existe #productoDetalle");
        return;
    }

    const id = obtenerIdProducto();

    if (!id) {
        mostrarError(
            "No se especificó ningún producto."
        );
        return;
    }

    const productos = obtenerProductos();

    const producto = productos.find(
        item =>
            String(item.id) === String(id)
    );

    if (!producto) {
        mostrarError(
            "El producto no existe o fue eliminado."
        );
        return;
    }

    if (producto.estado === "oculto") {
        mostrarError(
            "Este producto no está disponible."
        );
        return;
    }

    mostrarProducto(producto);
}

/* =========================================================
   OBTENER PRODUCTOS
========================================================= */

function obtenerProductos() {

    const datos = localStorage.getItem(
        CLAVE_PRODUCTOS
    );

    if (!datos) {
        return [];
    }

    try {

        const productos = JSON.parse(datos);

        return Array.isArray(productos)
            ? productos
            : [];

    } catch (error) {

        console.error(
            "Error al leer los productos:",
            error
        );

        return [];
    }
}

/* =========================================================
   MOSTRAR PRODUCTO
========================================================= */

function mostrarProducto(producto) {

    const contenedor = document.getElementById(
        "productoDetalle"
    );

    if (!contenedor) {
        return;
    }

    const nombre = escaparHTML(
        producto.nombre ||
        "Producto sin nombre"
    );

    const descripcion = escaparHTML(
        producto.descripcion ||
        "Prenda infantil de excelente calidad."
    );

    const categoria = obtenerNombreCategoria(
        producto.categoria
    );

    const precio = formatearPrecio(
        producto.precio
    );

    const stock = Number(
        producto.stock || 0
    );

    const imagenes = obtenerImagenes(
        producto
    );

    /* =====================================================
       IMAGEN PRINCIPAL
    ===================================================== */

    let imagenHTML = "";

    if (imagenes.length > 0) {

        imagenHTML = `
            <img
                src="${escaparAtributo(imagenes[0])}"
                alt="${nombre}"
                class="producto-imagen-principal"
                loading="eager"
                onerror="imagenProductoError(this)"
            >
        `;

    } else {

        imagenHTML = `
            <div class="producto-placeholder">
                FOTO
            </div>
        `;
    }

    /* =====================================================
       PRECIO ANTERIOR
    ===================================================== */

    let precioAnteriorHTML = "";

    const precioAnterior = Number(
        producto.precioAnterior || 0
    );

    const precioActual = Number(
        producto.precio || 0
    );

    if (
        precioAnterior > precioActual &&
        precioActual > 0
    ) {

        precioAnteriorHTML = `
            <span class="producto-precio-anterior">
                ${formatearPrecio(precioAnterior)}
            </span>
        `;
    }

    /* =====================================================
       ETIQUETA
    ===================================================== */

    let etiquetaHTML = "";

    if (producto.etiqueta) {

        etiquetaHTML = `
            <div class="tag producto-tag">
                ${escaparHTML(producto.etiqueta)}
            </div>
        `;
    }

    /* =====================================================
       STOCK
    ===================================================== */

    let stockHTML = "";

    if (stock > 0) {

        stockHTML = `
            <div class="stock disponible">
                ● Stock disponible
            </div>
        `;

    } else {

        stockHTML = `
            <div class="stock agotado">
                Producto agotado
            </div>
        `;
    }

    /* =====================================================
       TALLES
    ===================================================== */

    const tallesHTML = generarTallesHTML(
        producto
    );

    /* =====================================================
       COLORES
    ===================================================== */

    const coloresHTML = generarColoresHTML(
        producto
    );

    /* =====================================================
       BOTÓN CARRITO
    ===================================================== */

    let botonHTML = "";

    if (stock > 0) {

        botonHTML = `
            <button
                type="button"
                class="btn-agregar-carrito"
                onclick="agregarAlCarrito('${escaparAtributo(producto.id)}')"
            >
                AGREGAR AL CARRITO
            </button>
        `;

    } else {

        botonHTML = `
            <button
                type="button"
                class="btn-agregar-carrito deshabilitado"
                disabled
            >
                PRODUCTO AGOTADO
            </button>
        `;
    }

    /* =====================================================
       HTML COMPLETO
    ===================================================== */

    contenedor.innerHTML = `

        <div class="producto-galeria">

            <div class="producto-imagen">

                ${etiquetaHTML}

                ${imagenHTML}

            </div>

        </div>


        <div class="producto-informacion">

            <div class="producto-categoria">
                ${categoria}
            </div>

            <h1>
                ${nombre}
            </h1>

            <div class="producto-precio">

                ${precio}

                ${precioAnteriorHTML}

            </div>

            <div class="producto-descripcion">
                ${descripcion}
            </div>

            ${tallesHTML}

            ${coloresHTML}

            ${stockHTML}

            <div class="producto-compra">

                ${crearSelectorCantidad(stock)}

                ${botonHTML}

            </div>

            <div class="producto-info-extra">

                <div>
                    🚚 Envíos a todo el país
                </div>

                <div>
                    ↩ Cambios y devoluciones
                </div>

                <div>
                    💬 Consultas por WhatsApp
                </div>

            </div>

        </div>

    `;

    document.title =
        `${producto.nombre || "Producto"} | Chamaquitos`;
}

/* =========================================================
   SELECTOR DE CANTIDAD
========================================================= */

function crearSelectorCantidad(stock) {

    if (stock <= 0) {
        return "";
    }

    return `
        <div class="cantidad">

            <button
                type="button"
                onclick="cambiarCantidad(-1)"
                aria-label="Disminuir cantidad"
            >
                −
            </button>

            <input
                type="number"
                id="cantidadProducto"
                value="1"
                min="1"
                max="${stock}"
                readonly
            >

            <button
                type="button"
                onclick="cambiarCantidad(1)"
                aria-label="Aumentar cantidad"
            >
                +
            </button>

        </div>
    `;
}

/* =========================================================
   CAMBIAR CANTIDAD
========================================================= */

function cambiarCantidad(cambio) {

    const input = document.getElementById(
        "cantidadProducto"
    );

    if (!input) {
        return;
    }

    const minimo = Number(
        input.min || 1
    );

    const maximo = Number(
        input.max || 999
    );

    let cantidad = Number(
        input.value || 1
    );

    cantidad += cambio;

    if (cantidad < minimo) {
        cantidad = minimo;
    }

    if (cantidad > maximo) {
        cantidad = maximo;
    }

    input.value = cantidad;
}

/* =========================================================
   GENERAR TALLES
========================================================= */

function generarTallesHTML(producto) {

    const talles = producto.talles;

    if (
        !Array.isArray(talles) ||
        talles.length === 0
    ) {
        return "";
    }

    return `
        <div class="producto-opcion">

            <div class="producto-opcion-titulo">
                Talle
            </div>

            <div
                class="producto-opciones"
                id="selectorTalle"
            >

                ${talles.map((talle) => {

                    const valor =
                        typeof talle === "object"
                            ? talle.nombre
                            : talle;

                    const disponible =
                        typeof talle === "object"
                            ? Number(
                                talle.stock ?? 1
                              ) > 0
                            : true;

                    return `

                        <button
                            type="button"
                            class="opcion-talle ${
                                !disponible
                                    ? "opcion-agotada"
                                    : ""
                            }"
                            ${
                                !disponible
                                    ? "disabled"
                                    : ""
                            }
                            data-talle="${escaparAtributo(valor)}"
                            onclick="seleccionarTalle(this)"
                        >

                            ${escaparHTML(valor)}

                        </button>

                    `;

                }).join("")}

            </div>

        </div>
    `;
}

/* =========================================================
   GENERAR COLORES
========================================================= */

function generarColoresHTML(producto) {

    const colores = producto.colores;

    if (
        !Array.isArray(colores) ||
        colores.length === 0
    ) {
        return "";
    }

    return `
        <div class="producto-opcion">

            <div class="producto-opcion-titulo">
                Color
            </div>

            <div
                class="producto-colores"
                id="selectorColor"
            >

                ${colores.map((color) => {

                    const valor =
                        typeof color === "object"
                            ? color.nombre
                            : color;

                    const disponible =
                        typeof color === "object"
                            ? Number(
                                color.stock ?? 1
                              ) > 0
                            : true;

                    const colorCSS =
                        obtenerColorCSS(valor);

                    return `

                        <button
                            type="button"
                            class="opcion-color ${
                                !disponible
                                    ? "opcion-agotada"
                                    : ""
                            }"
                            ${
                                !disponible
                                    ? "disabled"
                                    : ""
                            }
                            data-color="${escaparAtributo(valor)}"
                            title="${escaparAtributo(valor)}"
                            style="--color-producto: ${escaparAtributo(colorCSS)};"
                            onclick="seleccionarColor(this)"
                        >

                            <span
                                class="color-circulo"
                            ></span>

                        </button>

                    `;

                }).join("")}

            </div>

        </div>
    `;
}

/* =========================================================
   CONVERTIR COLOR
========================================================= */

function obtenerColorCSS(color) {

    const colores = {

        rojo: "#e53935",

        bordo: "#800020",
        bordó: "#800020",
        bordeaux: "#800020",

        rosa: "#f48fb1",
        rosado: "#f48fb1",

        fucsia: "#d81b60",

        naranja: "#ff9800",

        amarillo: "#fdd835",

        verde: "#43a047",
        verde_claro: "#81c784",
        verde_oscuro: "#1b5e20",

        celeste: "#81d4fa",

        azul: "#1e88e5",
        azul_claro: "#64b5f6",
        azul_oscuro: "#0d47a1",

        violeta: "#8e24aa",

        lila: "#ce93d8",

        marron: "#795548",
        marrón: "#795548",

        beige: "#d7ccc8",

        gris: "#9e9e9e",
        gris_claro: "#eeeeee",
        gris_oscuro: "#424242",

        negro: "#111111",

        blanco: "#ffffff",

        natural: "#e6d3b1"
    };

    const nombre = String(color)
        .toLowerCase()
        .trim();

    return colores[nombre] || nombre;
}

/* =========================================================
   SELECCIONAR TALLE
========================================================= */

function seleccionarTalle(boton) {

    if (!boton || boton.disabled) {
        return;
    }

    document
        .querySelectorAll(".opcion-talle")
        .forEach(item => {

            item.classList.remove(
                "seleccionado"
            );

        });

    boton.classList.add(
        "seleccionado"
    );
}

/* =========================================================
   SELECCIONAR COLOR
========================================================= */

function seleccionarColor(boton) {

    if (!boton || boton.disabled) {
        return;
    }

    document
        .querySelectorAll(".opcion-color")
        .forEach(item => {

            item.classList.remove(
                "seleccionado"
            );

        });

    boton.classList.add(
        "seleccionado"
    );
}

/* =========================================================
   OBTENER TALLE
========================================================= */

function obtenerTalleSeleccionado() {

    const boton = document.querySelector(
        ".opcion-talle.seleccionado"
    );

    return boton
        ? boton.dataset.talle || ""
        : "";
}

/* =========================================================
   OBTENER COLOR
========================================================= */

function obtenerColorSeleccionado() {

    const boton = document.querySelector(
        ".opcion-color.seleccionado"
    );

    return boton
        ? boton.dataset.color || ""
        : "";
}

/* =========================================================
   AGREGAR AL CARRITO
========================================================= */

function agregarAlCarrito(id) {

    const productos = obtenerProductos();

    const producto = productos.find(
        item =>
            String(item.id) ===
            String(id)
    );

    if (!producto) {

        alert(
            "No se encontró el producto."
        );

        return;
    }

    const stock = Number(
        producto.stock || 0
    );

    if (stock <= 0) {

        alert(
            "Este producto está agotado."
        );

        return;
    }

    /* =====================================================
       TALLE
    ===================================================== */

    const tieneTalles =
        Array.isArray(producto.talles) &&
        producto.talles.length > 0;

    const talle =
        obtenerTalleSeleccionado();

    if (
        tieneTalles &&
        !talle
    ) {

        alert(
            "Por favor, seleccioná un talle."
        );

        return;
    }

    /* =====================================================
       COLOR
    ===================================================== */

    const tieneColores =
        Array.isArray(producto.colores) &&
        producto.colores.length > 0;

    const color =
        obtenerColorSeleccionado();

    if (
        tieneColores &&
        !color
    ) {

        alert(
            "Por favor, seleccioná un color."
        );

        return;
    }

    /* =====================================================
       CANTIDAD
    ===================================================== */

    const inputCantidad =
        document.getElementById(
            "cantidadProducto"
        );

    const cantidad =
        Math.max(
            1,
            Number(
                inputCantidad?.value || 1
            )
        );

    /* =====================================================
       CARGAR CARRITO
    ===================================================== */

    let carrito = [];

    try {

        carrito = JSON.parse(
            localStorage.getItem(
                CLAVE_CARRITO
            ) || "[]"
        );

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

    const existente = carrito.find(
        item =>
            String(item.id) ===
                String(producto.id) &&

            String(item.talle || "") ===
                String(talle || "") &&

            String(item.color || "") ===
                String(color || "")
    );

    if (existente) {

        const nuevaCantidad =
            Number(
                existente.cantidad || 0
            ) + cantidad;

        existente.cantidad =
            Math.min(
                nuevaCantidad,
                stock
            );

    } else {

        carrito.push({

            id: producto.id,

            nombre:
                producto.nombre,

            precio:
                Number(
                    producto.precio
                ) || 0,

            imagen:
                obtenerImagenes(producto)[0] ||
                "",

            talle:
                talle,

            color:
                color,

            cantidad:
                Math.min(
                    cantidad,
                    stock
                )
        });
    }

    /* =====================================================
       GUARDAR
    ===================================================== */

    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );

    mostrarMensajeCarrito(
        producto.nombre
    );
}

/* =========================================================
   MENSAJE DE CARRITO
========================================================= */

function mostrarMensajeCarrito(nombre) {

    const anterior =
        document.querySelector(
            ".mensaje-carrito"
        );

    if (anterior) {
        anterior.remove();
    }

    const mensaje =
        document.createElement("div");

    mensaje.className =
        "mensaje-carrito visible";

    mensaje.innerHTML = `

        <strong>
            Producto agregado
        </strong>

        <span>
            ${escaparHTML(nombre)}
        </span>

        <button
            type="button"
            onclick="window.location.href='${obtenerRutaCarrito()}'"
        >
            VER CARRITO
        </button>

    `;

    document.body.appendChild(
        mensaje
    );

    setTimeout(() => {

        mensaje.classList.remove(
            "visible"
        );

        setTimeout(() => {
            mensaje.remove();
        }, 300);

    }, 4000);
}

/* =========================================================
   RUTA CARRITO
========================================================= */

function obtenerRutaCarrito() {

    const ruta =
        window.location.pathname;

    if (
        ruta.includes("/administrador/")
    ) {
        return "../carrito.html";
    }

    return "carrito.html";
}

/* =========================================================
   OBTENER IMÁGENES
========================================================= */

function obtenerImagenes(producto) {

    if (
        Array.isArray(
            producto.imagenes
        )
    ) {

        return producto.imagenes.filter(
            imagen =>
                typeof imagen === "string" &&
                imagen.trim() !== ""
        );
    }

    if (
        producto.imagen &&
        typeof producto.imagen === "string"
    ) {

        return [
            producto.imagen
        ];
    }

    return [];
}

/* =========================================================
   ERROR DE IMAGEN
========================================================= */

function imagenProductoError(imagen) {

    if (!imagen) {
        return;
    }

    imagen.style.display =
        "none";

    const contenedor =
        imagen.parentElement;

    if (!contenedor) {
        return;
    }

    if (
        contenedor.querySelector(
            ".producto-placeholder"
        )
    ) {
        return;
    }

    const placeholder =
        document.createElement(
            "div"
        );

    placeholder.className =
        "producto-placeholder";

    placeholder.textContent =
        "FOTO";

    contenedor.appendChild(
        placeholder
    );
}

/* =========================================================
   ERROR
========================================================= */

function mostrarError(mensaje) {

    const contenedor =
        document.getElementById(
            "productoDetalle"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `

        <div class="producto-error">

            <div class="producto-error-icon">
                !
            </div>

            <h1>
                Producto no disponible
            </h1>

            <p>
                ${escaparHTML(mensaje)}
            </p>

            <a
                href="${obtenerRutaInicio()}"
                class="btn"
            >
                VOLVER A LA TIENDA
            </a>

        </div>

    `;
}

/* =========================================================
   RUTA INICIO
========================================================= */

function obtenerRutaInicio() {

    const ruta =
        window.location.pathname;

    if (
        ruta.includes("/administrador/")
    ) {
        return "../inicio.html";
    }

    return "inicio.html";
}

/* =========================================================
   CATEGORÍA
========================================================= */

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

/* =========================================================
   PRECIO
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
   SEGURIDAD HTML
========================================================= */

function escaparHTML(texto) {

    return String(
        texto ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   SEGURIDAD ATRIBUTOS
========================================================= */

function escaparAtributo(texto) {

    return String(
        texto ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* =========================================================
   FUNCIONES GLOBALES
========================================================= */

window.agregarAlCarrito =
    agregarAlCarrito;

window.imagenProductoError =
    imagenProductoError;

window.seleccionarTalle =
    seleccionarTalle;

window.seleccionarColor =
    seleccionarColor;

window.cambiarCantidad =
    cambiarCantidad;
