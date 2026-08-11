
const CLAVE_PRODUCTOS = "tienda_productos";

let productos = [];
let categoriaActual = "";


/* =========================================
   INICIAR TIENDA
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();

    mostrarProductos();

    configurarCategorias();

    configurarVerTodo();

});


/* =========================================
   CARGAR PRODUCTOS
========================================= */

function cargarProductos() {

    const datos =
        localStorage.getItem(
            CLAVE_PRODUCTOS
        );


    if (!datos) {

        productos = [];

        return;

    }


    try {

        const productosGuardados =
            JSON.parse(datos);


        if (
            Array.isArray(
                productosGuardados
            )
        ) {

            productos =
                productosGuardados;

        } else {

            productos = [];

        }

    } catch (error) {

        console.error(
            "Error al cargar los productos:",
            error
        );

        productos = [];

    }

}


/* =========================================
   OBTENER PRODUCTOS VISIBLES
========================================= */

function obtenerProductosVisibles() {

    return productos.filter(
        producto => {

            const activo =
                producto.estado !== "oculto";


            const tieneStock =
                Number(
                    producto.stock || 0
                ) > 0;


            return (
                activo &&
                tieneStock
            );

        }
    );

}


/* =========================================
   MOSTRAR PRODUCTOS
========================================= */

function mostrarProductos(
    lista = null
) {

    const contenedor =
        document.getElementById(
            "listaProductos"
        );


    if (!contenedor) {

        console.warn(
            "No existe #listaProductos en inicio.html"
        );

        return;

    }


    const listaBase =
        lista !== null
            ? lista
            : obtenerProductosVisibles();


    if (
        listaBase.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="sin-productos">

                <div class="sin-productos-icon">
                    🛍️
                </div>

                <h3>
                    No encontramos productos
                </h3>

                <p>
                    Próximamente tendremos
                    nuevos productos.
                </p>

            </div>

        `;

        return;

    }


    contenedor.innerHTML =
        listaBase
            .map(
                producto =>
                    crearTarjetaProducto(
                        producto
                    )
            )
            .join("");

}


/* =========================================
   CREAR TARJETA DE PRODUCTO
========================================= */

function crearTarjetaProducto(
    producto
) {

    const nombre =
        escaparHTML(
            producto.nombre
        );


    const etiqueta =
        producto.etiqueta
            ? `

                <span class="tag">

                    ${escaparHTML(
                        producto.etiqueta
                    )}

                </span>

              `
            : "";


    /* -------------------------------------
       IMAGEN
    ------------------------------------- */

    let imagenHTML = "";


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
                class="producto-img"
                loading="lazy"
                onerror="mostrarPlaceholder(this)"
            >

        `;

    }


    /*
       Compatibilidad con productos
       que tengan una sola imagen
    */

    if (
        !imagenHTML &&
        producto.imagen
    ) {

        imagenHTML = `

            <img
                src="${escaparAtributo(
                    producto.imagen
                )}"
                alt="${nombre}"
                class="producto-img"
                loading="lazy"
                onerror="mostrarPlaceholder(this)"
            >

        `;

    }


    const placeholder =
        !imagenHTML
            ? `

                <div class="foto-placeholder">

                    FOTO

                </div>

              `
            : "";


    /* -------------------------------------
       PRECIO ANTERIOR
    ------------------------------------- */

    let precioAnteriorHTML = "";


    if (
        Number(
            producto.precioAnterior || 0
        ) >
        Number(
            producto.precio || 0
        )
    ) {

        precioAnteriorHTML = `

            <span class="old-price">

                ${formatearPrecio(
                    producto.precioAnterior
                )}

            </span>

        `;

    }


    /* -------------------------------------
       CATEGORÍA
    ------------------------------------- */

    const categoria =
        obtenerNombreCategoria(
            producto.categoria
        );


    /* -------------------------------------
       TARJETA
    ------------------------------------- */

    return `

        <article
            class="product-card"
            data-id="${escaparAtributo(
                producto.id
            )}"
        >

            <a
                href="administrador/producto.html?id=${encodeURIComponent(
                    producto.id
                )}"
                class="product-link"
            >

                <div class="product-image">

                    ${etiqueta}

                    ${imagenHTML}

                    ${placeholder}

                </div>


                <div class="product-info">

                    <div class="product-category">

                        ${categoria}

                    </div>


                    <div class="product-name">

                        ${nombre}

                    </div>


                    <div class="price-container">

                        <span class="price">

                            ${formatearPrecio(
                                producto.precio
                            )}

                        </span>

                        ${precioAnteriorHTML}

                    </div>

                </div>

            </a>

        </article>

    `;

}


/* =========================================
   ABRIR PRODUCTO
========================================= */

function verProducto(id) {

    const producto =
        productos.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!producto) {

        console.error(
            "No se encontró el producto:",
            id
        );

        return;

    }


    /*
       producto.html está dentro
       de la carpeta administrador
    */

    window.location.href =
        `administrador/producto.html?id=${encodeURIComponent(
            producto.id
        )}`;

}


/* =========================================
   CONFIGURAR CATEGORÍAS
========================================= */

function configurarCategorias() {

    const enlaces =
        document.querySelectorAll(
            ".category"
        );


    const categorias = [

        "ninas",

        "ninos",

        "bebes",

        "accesorios"

    ];


    enlaces.forEach(
        (enlace, indice) => {

            enlace.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const categoria =
                        categorias[indice];


                    filtrarCategoria(
                        categoria
                    );


                    desplazarANovedades();

                }
            );

        }
    );

}


/* =========================================
   FILTRAR CATEGORÍA
========================================= */

function filtrarCategoria(
    categoria
) {

    categoriaActual =
        categoria;


    const productosVisibles =
        obtenerProductosVisibles();


    const filtrados =
        productosVisibles.filter(
            producto =>
                producto.categoria ===
                categoria
        );


    mostrarProductos(
        filtrados
    );

}


/* =========================================
   MOSTRAR TODOS
========================================= */

function mostrarTodosLosProductos() {

    categoriaActual = "";

    mostrarProductos();

}


/* =========================================
   CONFIGURAR "VER TODO"
========================================= */

function configurarVerTodo() {

    const enlaces =
        document.querySelectorAll(
            ".link"
        );


    enlaces.forEach(
        enlace => {

            enlace.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    mostrarTodosLosProductos();


                    desplazarANovedades();

                }
            );

        }
    );

}


/* =========================================
   DESPLAZAR A NOVEDADES
========================================= */

function desplazarANovedades() {

    const novedades =
        document.getElementById(
            "novedades"
        );


    if (!novedades) {

        return;

    }


    novedades.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* =========================================
   NOMBRE DE CATEGORÍA
========================================= */

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


/* =========================================
   FORMATEAR PRECIO
========================================= */

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


/* =========================================
   PLACEHOLDER DE IMAGEN
========================================= */

function mostrarPlaceholder(
    imagen
) {

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
            ".foto-placeholder"
        )
    ) {

        return;

    }


    const placeholder =
        document.createElement(
            "div"
        );


    placeholder.className =
        "foto-placeholder";


    placeholder.textContent =
        "FOTO";


    contenedor.appendChild(
        placeholder
    );

}


/* =========================================
   ESCAPAR HTML
========================================= */

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


/* =========================================
   ESCAPAR ATRIBUTOS
========================================= */

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


/* =========================================
   ACTUALIZACIÓN AUTOMÁTICA
========================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key !==
            CLAVE_PRODUCTOS
        ) {

            return;

        }


        cargarProductos();


        if (categoriaActual) {

            filtrarCategoria(
                categoriaActual
            );

        } else {

            mostrarProductos();

        }

    }
);


/* =========================================
   ACTUALIZACIÓN MANUAL
========================================= */

function actualizarTienda() {

    cargarProductos();


    if (categoriaActual) {

        filtrarCategoria(
            categoriaActual
        );

    } else {

        mostrarProductos();

    }

}


/* =========================================
   HACER FUNCIONES DISPONIBLES
========================================= */

window.verProducto =
    verProducto;

window.filtrarCategoria =
    filtrarCategoria;

window.mostrarTodosLosProductos =
    mostrarTodosLosProductos;

window.actualizarTienda =
    actualizarTienda;

