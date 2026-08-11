
const CLAVE_PRODUCTOS = "tienda_productos";

let productos = [];
let productoEditando = null;
let imagenesActuales = [];


/* =========================================
   INICIAR
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();

    configurarEventos();

    mostrarProductos();

    actualizarPanel();

});


/* =========================================
   CARGAR PRODUCTOS
========================================= */

function cargarProductos() {

    const datos =
        localStorage.getItem(CLAVE_PRODUCTOS);

    if (!datos) {

        productos = [];

        return;
    }

    try {

        productos = JSON.parse(datos);

        if (!Array.isArray(productos)) {
            productos = [];
        }

    } catch (error) {

        console.error(
            "No se pudieron cargar los productos:",
            error
        );

        productos = [];
    }
}


/* =========================================
   GUARDAR PRODUCTOS
========================================= */

function guardarProductos() {

    try {

        localStorage.setItem(
            CLAVE_PRODUCTOS,
            JSON.stringify(productos)
        );

        return true;

    } catch (error) {

        console.error(
            "No se pudieron guardar los productos:",
            error
        );

        alert(
            "No hay suficiente espacio para guardar las imágenes. " +
            "Para una tienda real utilizaremos almacenamiento en servidor."
        );

        return false;
    }
}


/* =========================================
   CONFIGURAR EVENTOS
========================================= */

function configurarEventos() {


    /* Nuevo producto */

    const btnNuevo =
        document.getElementById(
            "btnNuevoProducto"
        );

    if (btnNuevo) {

        btnNuevo.addEventListener(
            "click",
            abrirFormularioNuevo
        );

    }


    /* Primer producto */

    const btnPrimerProducto =
        document.getElementById(
            "btnPrimerProducto"
        );

    if (btnPrimerProducto) {

        btnPrimerProducto.addEventListener(
            "click",
            abrirFormularioNuevo
        );

    }


    /* Cancelar */

    const btnCancelar =
        document.getElementById(
            "btnCancelarProducto"
        );

    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            cerrarFormulario
        );

    }


    /* Formulario */

    const formulario =
        document.getElementById(
            "formProducto"
        );

    if (formulario) {

        formulario.addEventListener(
            "submit",
            guardarProducto
        );

    }


    /* Imágenes */

    const inputImagenes =
        document.getElementById(
            "imagenesProducto"
        );

    if (inputImagenes) {

        inputImagenes.addEventListener(
            "change",
            cargarImagenes
        );

    }


    /* Buscador */

    const buscador =
        document.getElementById(
            "buscarProducto"
        );

    if (buscador) {

        buscador.addEventListener(
            "input",
            aplicarFiltros
        );

    }


    /* Categoría */

    const filtroCategoria =
        document.getElementById(
            "filtroCategoria"
        );

    if (filtroCategoria) {

        filtroCategoria.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    /* Estado */

    const filtroEstado =
        document.getElementById(
            "filtroEstado"
        );

    if (filtroEstado) {

        filtroEstado.addEventListener(
            "change",
            aplicarFiltros
        );

    }

}


/* =========================================
   ABRIR FORMULARIO
========================================= */

function abrirFormularioNuevo() {

    productoEditando = null;

    imagenesActuales = [];

    const formulario =
        document.getElementById(
            "formularioProducto"
        );

    const form =
        document.getElementById(
            "formProducto"
        );

    const titulo =
        document.getElementById(
            "tituloFormulario"
        );

    if (!formulario || !form) {
        return;
    }


    form.reset();


    limpiarVistaPrevia();


    if (titulo) {

        titulo.textContent =
            "Nuevo producto";

    }


    formulario.hidden = false;


    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   CERRAR FORMULARIO
========================================= */

function cerrarFormulario() {

    const formulario =
        document.getElementById(
            "formularioProducto"
        );

    if (!formulario) {
        return;
    }


    formulario.hidden = true;

    productoEditando = null;

    imagenesActuales = [];

}


/* =========================================
   GUARDAR PRODUCTO
========================================= */

async function guardarProducto(event) {

    event.preventDefault();


    /* -----------------------------------------
       OBTENER CAMPOS
    ----------------------------------------- */

    const nombre =
        obtenerValor("nombreProducto");

    const codigo =
        obtenerValor("codigoProducto");

    const categoria =
        obtenerValor("categoriaProducto");

    const subcategoria =
        obtenerValor("subcategoriaProducto");

    const descripcion =
        obtenerValor("descripcionProducto");

    const precio =
        obtenerNumero("precioProducto");

    const precioAnterior =
        obtenerNumero("precioAnterior");

    const stock =
        obtenerNumero("stockProducto");

    const stockMinimo =
        obtenerNumero("stockMinimo");

    const colores =
        obtenerValor("coloresProducto");

    const estado =
        obtenerValor("estadoProducto") || "activo";

    const etiqueta =
        obtenerValor("etiquetaProducto");


    /* -----------------------------------------
       VALIDACIONES
    ----------------------------------------- */

    if (!nombre) {

        alert(
            "Ingresá el nombre del producto."
        );

        return;
    }


    if (!categoria) {

        alert(
            "Seleccioná una categoría."
        );

        return;
    }


    if (precio < 0) {

        alert(
            "El precio no puede ser negativo."
        );

        return;
    }


    if (stock < 0) {

        alert(
            "El stock no puede ser negativo."
        );

        return;
    }


    /* -----------------------------------------
       TALLES
    ----------------------------------------- */

    const talles =
        Array.from(
            document.querySelectorAll(
                'input[name="talles"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );


    /* -----------------------------------------
       CREAR DATOS
    ----------------------------------------- */

    const datosProducto = {

        nombre: nombre,

        codigo: codigo,

        categoria: categoria,

        subcategoria: subcategoria,

        descripcion: descripcion,

        precio: precio,

        precioAnterior: precioAnterior,

        stock: stock,

        stockMinimo: stockMinimo,

        talles: talles,

        colores: colores,

        estado: estado,

        etiqueta: etiqueta,

        imagenes: imagenesActuales,

        fechaActualizacion:
            new Date().toISOString()

    };


    /* =========================================
       EDITAR
    ========================================= */

    if (productoEditando !== null) {

        const indice =
            productos.findIndex(
                producto =>
                    Number(producto.id) ===
                    Number(productoEditando)
            );


        if (indice !== -1) {

            productos[indice] = {

                ...productos[indice],

                ...datosProducto

            };

        }

    }


    /* =========================================
       NUEVO
    ========================================= */

    else {

        const nuevoProducto = {

            id: Date.now(),

            ...datosProducto,

            fechaCreacion:
                new Date().toISOString()

        };


        productos.push(
            nuevoProducto
        );

    }


    /* -----------------------------------------
       GUARDAR
    ----------------------------------------- */

    const guardado =
        guardarProductos();


    if (!guardado) {
        return;
    }


    /* -----------------------------------------
       ACTUALIZAR
    ----------------------------------------- */

    mostrarProductos();

    actualizarPanel();

    cerrarFormulario();


    alert(
        productoEditando !== null
            ? "Producto actualizado correctamente."
            : "Producto agregado correctamente."
    );

}


/* =========================================
   CARGAR IMÁGENES
========================================= */

async function cargarImagenes(event) {

    const archivos =
        Array.from(
            event.target.files
        );


    if (!archivos.length) {
        return;
    }


    /*
       Máximo 5 imágenes
    */

    const archivosPermitidos =
        archivos.slice(0, 5);


    imagenesActuales = [];


    for (
        const archivo of archivosPermitidos
    ) {

        if (
            !archivo.type.startsWith(
                "image/"
            )
        ) {

            continue;

        }


        try {

            const imagen =
                await convertirImagenBase64(
                    archivo
                );


            imagenesActuales.push(
                imagen
            );

        } catch (error) {

            console.error(
                "Error al cargar imagen:",
                error
            );

        }

    }


    mostrarVistaPrevia();

}


/* =========================================
   CONVERTIR IMAGEN A BASE64
========================================= */

function convertirImagenBase64(archivo) {

    return new Promise(
        (resolve, reject) => {

            const lector =
                new FileReader();


            lector.onload = () => {

                resolve(
                    lector.result
                );

            };


            lector.onerror = () => {

                reject(
                    lector.error
                );

            };


            lector.readAsDataURL(
                archivo
            );

        }
    );

}


/* =========================================
   MOSTRAR VISTA PREVIA
========================================= */

function mostrarVistaPrevia() {

    const contenedor =
        document.getElementById(
            "vistaPreviaImagenes"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    imagenesActuales.forEach(
        (imagen, indice) => {

            const contenedorImagen =
                document.createElement(
                    "div"
                );


            contenedorImagen.style.position =
                "relative";


            const img =
                document.createElement(
                    "img"
                );


            img.src = imagen;

            img.alt =
                `Imagen ${indice + 1}`;


            const boton =
                document.createElement(
                    "button"
                );


            boton.type = "button";

            boton.textContent = "×";


            boton.style.position =
                "absolute";

            boton.style.top = "5px";

            boton.style.right = "5px";

            boton.style.border = "none";

            boton.style.borderRadius =
                "50%";

            boton.style.width = "25px";

            boton.style.height = "25px";

            boton.style.cursor =
                "pointer";


            boton.addEventListener(
                "click",
                () => {

                    eliminarImagen(indice);

                }
            );


            contenedorImagen.appendChild(
                img
            );

            contenedorImagen.appendChild(
                boton
            );


            contenedor.appendChild(
                contenedorImagen
            );

        }
    );

}


/* =========================================
   ELIMINAR IMAGEN DE PREVISUALIZACIÓN
========================================= */

function eliminarImagen(indice) {

    imagenesActuales.splice(
        indice,
        1
    );


    mostrarVistaPrevia();

}


/* =========================================
   LIMPIAR IMÁGENES
========================================= */

function limpiarVistaPrevia() {

    imagenesActuales = [];


    const contenedor =
        document.getElementById(
            "vistaPreviaImagenes"
        );


    if (contenedor) {

        contenedor.innerHTML = "";

    }

}


/* =========================================
   MOSTRAR PRODUCTOS EN TABLA
========================================= */

function mostrarProductos(
    lista = productos
) {

    const tabla =
        document.getElementById(
            "listaProductos"
        );


    if (!tabla) {
        return;
    }


    /* -----------------------------------------
       SIN PRODUCTOS
    ----------------------------------------- */

    if (lista.length === 0) {

        tabla.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-table"
                >

                    <span>📦</span>

                    <p>
                        No hay productos.
                    </p>

                    <button
                        type="button"
                        id="btnSinProductos"
                    >
                        Agregar producto
                    </button>

                </td>

            </tr>

        `;


        const boton =
            document.getElementById(
                "btnSinProductos"
            );


        if (boton) {

            boton.addEventListener(
                "click",
                abrirFormularioNuevo
            );

        }


        return;
    }


    /* -----------------------------------------
       PRODUCTOS
    ----------------------------------------- */

    tabla.innerHTML =
        lista.map(
            producto => {

                const imagen =
                    producto.imagenes &&
                    producto.imagenes.length
                        ? producto.imagenes[0]
                        : "";


                return `

                    <tr>

                        <td>

                            <div
                                class="product-table-info"
                            >

                                ${
                                    imagen
                                        ? `
                                            <img
                                                src="${imagen}"
                                                alt=""
                                                class="product-table-image"
                                            >
                                          `
                                        : `
                                            <div
                                                class="product-table-image"
                                            ></div>
                                          `
                                }


                                <div>

                                    <strong>
                                        ${escaparHTML(
                                            producto.nombre
                                        )}
                                    </strong>

                                    <small>
                                        ${
                                            producto.codigo ||
                                            "Sin código"
                                        }
                                    </small>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${obtenerNombreCategoria(
                                producto.categoria
                            )}
                        </td>


                        <td>
                            ${formatearPrecio(
                                producto.precio
                            )}
                        </td>


                        <td>
                            ${producto.stock}
                        </td>


                        <td>
                            ${crearEstado(
                                producto.estado,
                                producto.stock
                            )}
                        </td>


                        <td>

                            <div
                                class="table-actions"
                            >

                                <button
                                    type="button"
                                    class="table-action"
                                    onclick="editarProducto(${producto.id})"
                                >
                                    Editar
                                </button>


                                <button
                                    type="button"
                                    class="table-action"
                                    onclick="eliminarProducto(${producto.id})"
                                >
                                    Eliminar
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================
   EDITAR PRODUCTO
========================================= */

function editarProducto(id) {

    const producto =
        productos.find(
            producto =>
                Number(producto.id) ===
                Number(id)
        );


    if (!producto) {
        return;
    }


    productoEditando =
        producto.id;


    /* -----------------------------------------
       CARGAR DATOS
    ----------------------------------------- */

    establecerValor(
        "nombreProducto",
        producto.nombre
    );

    establecerValor(
        "codigoProducto",
        producto.codigo
    );

    establecerValor(
        "categoriaProducto",
        producto.categoria
    );

    establecerValor(
        "subcategoriaProducto",
        producto.subcategoria
    );

    establecerValor(
        "descripcionProducto",
        producto.descripcion
    );

    establecerValor(
        "precioProducto",
        producto.precio
    );

    establecerValor(
        "precioAnterior",
        producto.precioAnterior
    );

    establecerValor(
        "stockProducto",
        producto.stock
    );

    establecerValor(
        "stockMinimo",
        producto.stockMinimo
    );

    establecerValor(
        "coloresProducto",
        producto.colores
    );

    establecerValor(
        "estadoProducto",
        producto.estado
    );

    establecerValor(
        "etiquetaProducto",
        producto.etiqueta
    );


    /* -----------------------------------------
       TALLES
    ----------------------------------------- */

    document
        .querySelectorAll(
            'input[name="talles"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    Array.isArray(
                        producto.talles
                    ) &&
                    producto.talles.includes(
                        checkbox.value
                    );

            }
        );


    /* -----------------------------------------
       IMÁGENES
    ----------------------------------------- */

    imagenesActuales =
        Array.isArray(
            producto.imagenes
        )
            ? [...producto.imagenes]
            : [];


    mostrarVistaPrevia();


    /* -----------------------------------------
       TÍTULO
    ----------------------------------------- */

    const titulo =
        document.getElementById(
            "tituloFormulario"
        );


    if (titulo) {

        titulo.textContent =
            "Editar producto";

    }


    /* -----------------------------------------
       MOSTRAR FORMULARIO
    ----------------------------------------- */

    const formulario =
        document.getElementById(
            "formularioProducto"
        );


    if (formulario) {

        formulario.hidden = false;


        formulario.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================
   ELIMINAR PRODUCTO
========================================= */

function eliminarProducto(id) {

    const producto =
        productos.find(
            producto =>
                Number(producto.id) ===
                Number(id)
        );


    if (!producto) {
        return;
    }


    const confirmar =
        confirm(
            `¿Querés eliminar "${producto.nombre}"?`
        );


    if (!confirmar) {
        return;
    }


    productos =
        productos.filter(
            producto =>
                Number(producto.id) !==
                Number(id)
        );


    if (!guardarProductos()) {
        return;
    }


    mostrarProductos();

    actualizarPanel();

}


/* =========================================
   FILTROS
========================================= */

function aplicarFiltros() {

    const buscador =
        document.getElementById(
            "buscarProducto"
        );

    const filtroCategoria =
        document.getElementById(
            "filtroCategoria"
        );

    const filtroEstado =
        document.getElementById(
            "filtroEstado"
        );


    const texto =
        buscador
            ? buscador.value
                .toLowerCase()
                .trim()
            : "";


    const categoria =
        filtroCategoria
            ? filtroCategoria.value
            : "";


    const estado =
        filtroEstado
            ? filtroEstado.value
            : "";


    const resultado =
        productos.filter(
            producto => {

                const nombre =
                    (
                        producto.nombre ||
                        ""
                    ).toLowerCase();


                const codigo =
                    (
                        producto.codigo ||
                        ""
                    ).toLowerCase();


                const coincideTexto =
                    !texto ||
                    nombre.includes(texto) ||
                    codigo.includes(texto);


                const coincideCategoria =
                    !categoria ||
                    producto.categoria ===
                    categoria;


                const coincideEstado =
                    !estado ||
                    producto.estado ===
                    estado;


                return (
                    coincideTexto &&
                    coincideCategoria &&
                    coincideEstado
                );

            }
        );


    mostrarProductos(resultado);

}


/* =========================================
   ACTUALIZAR PANEL
========================================= */

function actualizarPanel() {

    const tarjetas =
        document.querySelectorAll(
            ".dashboard-card strong"
        );


    if (!tarjetas.length) {
        return;
    }


    /* Productos */

    if (tarjetas[0]) {

        tarjetas[0].textContent =
            productos.length;

    }


    
    const stockTotal =
        productos.reduce(
            (
                total,
                producto
            ) => {

                return (
                    total +
                    Number(
                        producto.stock || 0
                    )
                );

            },
            0
        );


    if (tarjetas[1]) {

        tarjetas[1].textContent =
            stockTotal;

    }


    /* Productos con poco stock */

    const pocoStock =
        productos.filter(
            producto => {

                const stock =
                    Number(
                        producto.stock || 0
                    );

                const minimo =
                    Number(
                        producto.stockMinimo || 0
                    );


                return (
                    stock > 0 &&
                    stock <= minimo
                );

            }
        ).length;


    if (tarjetas[2]) {

        tarjetas[2].textContent =
            pocoStock;

    }


    /* Agotados */

    const agotados =
        productos.filter(
            producto =>
                Number(
                    producto.stock || 0
                ) === 0
        ).length;


    if (tarjetas[3]) {

        tarjetas[3].textContent =
            agotados;

    }

}



function crearEstado(
    estado,
    stock
) {

    if (
        Number(stock) === 0
    ) {

        return `
            <span class="status status-out">
                Agotado
            </span>
        `;

    }


    if (
        estado === "oculto"
    ) {

        return `
            <span class="status status-hidden">
                Oculto
            </span>
        `;

    }


    return `
        <span class="status status-active">
            Activo
        </span>
    `;

}




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
        "Sin categoría"
    );

}




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




function obtenerValor(id) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {
        return "";
    }


    return elemento.value.trim();

}




function obtenerNumero(id) {

    const valor =
        document.getElementById(id);


    if (!valor) {
        return 0;
    }


    const numero =
        Number(valor.value);


    return isNaN(numero)
        ? 0
        : numero;

}


function establecerValor(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.value =
            valor ?? "";

    }

}




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

