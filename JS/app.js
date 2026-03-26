// Referencias a los botones y las listas
const btnChofer = document.getElementById('btn-agregar-chofer');
const btnMovil = document.getElementById('btn-agregar-movil');
const listaChoferes = document.getElementById('lista-choferes');
const listaMoviles = document.getElementById('lista-moviles');

// Referencias al Modal
const modal = document.getElementById('modal-contenedor');
const modalTitulo = document.getElementById('modal-titulo');
const btnConfirmar = document.getElementById('btn-modal-confirmar');
const btnCancelar = document.getElementById('btn-modal-cancelar');

// Referencias a los formularios internos
const formChofer = document.getElementById('form-chofer');
const formMovil = document.getElementById('form-movil');

// Referencia al cuerpo de la tabla para insertar filas
const listaCuerpo = document.getElementById('lista-cuerpo');

let listaDestinoActual = null; // Para saber si estamos agregando a choferes o móviles
let tipoActual = ''; // 'chofer' o 'movil'

function abrirModal(titulo, listaDestino, tipo) {
    modalTitulo.textContent = titulo;
    listaDestinoActual = listaDestino;
    tipoActual = tipo;

    // Ocultar ambos y mostrar el que corresponde
    formChofer.classList.add('oculto');
    formMovil.classList.add('oculto');

    if(tipo === 'chofer') {
        formChofer.classList.remove('oculto');
        // Limpiar campos de chofer
        document.getElementById('chofer-nombre').value = "";
        document.getElementById('chofer-direccion').value = "";
        document.getElementById('chofer-telefono').value = "";
        document.getElementById('chofer-dni').value = "";
        document.getElementById('chofer-licencia-desde').value = "";
        document.getElementById('chofer-licencia-hasta').value = "";
    } else if(tipo === 'movil') {
        formMovil.classList.remove('oculto');
        // Limpiar campos de movil
        document.getElementById('movil-numero').value = "";
        document.getElementById('movil-marca').value = "";
        document.getElementById('movil-modelo').value = "";
        document.getElementById('movil-patente').value = "";
    }

    modal.classList.remove('oculto');
}

function cerrarModal() {
    modal.classList.add('oculto');
}

// Eventos de click con comprobación de existencia
if (btnChofer) {
    btnChofer.addEventListener('click', () => abrirModal("Datos Personales del Chofer", listaChoferes, 'chofer'));
}

if (btnMovil) {
    btnMovil.addEventListener('click', () => abrirModal("Datos del Móvil", listaMoviles, 'movil'));
}

// Función para crear una nueva fila en la tabla
function agregarFilaATabla(movil, nombre) {
    const nuevaFila = document.createElement('div');
    nuevaFila.classList.add('fila');
    
    nuevaFila.innerHTML = `
        <div class="columna-movil">
            <input type="text" class="input-tabla" list="lista-moviles" value="${movil}" placeholder="Móvil...">
        </div>
        <div class="columna-nombre">
            <input type="text" class="input-tabla" list="lista-choferes" value="${nombre}" placeholder="Chofer...">
        </div>
        <div class="columna-activo">
            <input type="checkbox" checked>
        </div>
        <div class="columna-horario">
            <input type="time" class="input-time">
            <span>a</span>
            <input type="time" class="input-time">
        </div>
        <div class="columna-acciones">
            <button class="btn-borrar">Borrar</button>
        </div>
    `;
    
    listaCuerpo.appendChild(nuevaFila);
}

// Delegación de eventos para borrar filas (funciona para filas nuevas y viejas)
listaCuerpo.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-borrar')) {
        const fila = e.target.closest('.fila');
        if (confirm('¿Está seguro de eliminar este registro?')) {
            fila.remove();
        }
    }
});

btnCancelar.addEventListener('click', cerrarModal);

btnConfirmar.addEventListener('click', () => {
    const nombreChofer = document.getElementById('chofer-nombre').value.trim();
    const numMovil = document.getElementById('movil-numero').value.trim();

    const valorPrincipal = (tipoActual === 'chofer') ? nombreChofer : numMovil;

    if (valorPrincipal !== "" && listaDestinoActual) {
        // Actualizar Datalist
        const option = document.createElement('option');
        option.value = valorPrincipal;
        listaDestinoActual.appendChild(option);

        // Si estamos agregando datos, creamos la fila de una vez
        if (tipoActual === 'chofer' || tipoActual === 'movil') {
            agregarFilaATabla(numMovil, nombreChofer);
        }

        cerrarModal();
    } else {
        alert("Por favor, ingrese un dato válido.");
    }
});
