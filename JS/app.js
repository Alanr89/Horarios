// Referencias a los botones y las listas
const btnChofer = document.getElementById('btn-agregar-chofer');
const btnMovil = document.getElementById('btn-agregar-movil');
const listaChoferes = document.getElementById('lista-choferes-datalist');
const listaMoviles = document.getElementById('lista-moviles-datalist');
const btnExportar = document.getElementById('btn-exportar');
const btnExportarHorarios = document.getElementById('btn-exportar-horarios');
const buscadorFecha = document.getElementById('buscar-fecha');

// Referencias al Modal
const modal = document.getElementById('modal-contenedor');
const modalTitulo = document.getElementById('modal-titulo');
const btnConfirmar = document.getElementById('btn-modal-confirmar');
const btnCancelar = document.getElementById('btn-modal-cancelar');

const btnNuevaFila = document.getElementById('btn-nueva-fila');

// Referencias al Modal de Modificar Chofer
const btnModificarChofer = document.getElementById('btn-modificar-chofer');
const modalModChofer = document.getElementById('modal-modificar-chofer');
const selectChoferEdit = document.getElementById('select-chofer-edit');
const formModChoferCampos = document.getElementById('form-modificar-chofer-campos');
const btnConfirmarModChofer = document.getElementById('btn-confirmar-mod-chofer');
const btnCancelarModChofer = document.getElementById('btn-cancelar-mod-chofer');
const btnBorrarChoferDB = document.getElementById('btn-borrar-chofer-db');
let choferIDSeleccionado = null;

// Referencias al Modal de Modificar Móvil
const btnModificarMovil = document.getElementById('btn-modificar-movil');
const modalModMovil = document.getElementById('modal-modificar-movil');
const buscarMovilEdit = document.getElementById('buscar-movil-edit');
const formModMovilCampos = document.getElementById('form-modificar-movil-campos');
const btnConfirmarModMovil = document.getElementById('btn-confirmar-mod-movil');
const btnCancelarModMovil = document.getElementById('btn-cancelar-mod-movil');

// Referencias a los formularios internos
const formChofer = document.getElementById('form-chofer');
const formMovil = document.getElementById('form-movil');

// Referencias al Modal de Exportación
const modalExportar = document.getElementById('modal-exportar');
const fechaDesdeExport = document.getElementById('exportar-desde');
const fechaHastaExport = document.getElementById('exportar-hasta');
const btnConfirmarExport = document.getElementById('btn-confirmar-exportar');
const btnCancelarExport = document.getElementById('btn-cancelar-exportar');

// Referencia al cuerpo de la tabla para insertar filas
const listaCuerpo = document.getElementById('lista-cuerpo');
const tablaHorariosBody = document.getElementById('tabla-horarios-body');

// Almacenamiento de datos para exportación
let choferesRegistrados = JSON.parse(localStorage.getItem('choferes')) || [];
let movilesRegistrados = JSON.parse(localStorage.getItem('moviles')) || [];
let horariosRegistrados = JSON.parse(localStorage.getItem('horarios')) || [];

let listaDestinoActual = null; // Para saber si estamos agregando a choferes o móviles
let tipoActual = ''; // 'chofer' o 'movil'
let editIndex = null; // Indice del elemento que se está editando

// Función para cargar datos desde MySQL al iniciar
function cargarDatosDesdeServidor() {
    fetch('../PHP/obtener_datos.php')
        .then(res => res.json())
        .then(data => {
            if (data) {
                choferesRegistrados = data.choferes || [];
                movilesRegistrados = data.moviles || [];
                horariosRegistrados = data.horarios || [];
                actualizarLocalStorage();
                actualizarDatalists();
                // Si estamos en la página de DatosChoferes, recargamos la tabla
                if (listaCuerpo) cargarTablaChoferes();
                // Si estamos en Horarios, recargamos los móviles
                if (tablaHorariosBody) cargarTablaHorarios();
            }
        })
        .catch(err => console.log("Usando datos locales (Servidor no disponible)"));
}

function actualizarDatalists() {
    const dlChoferes = document.getElementById('lista-choferes-datalist');
    const dlMoviles = document.getElementById('lista-moviles-datalist');
    if(!dlChoferes || !dlMoviles) return;

    // Actualizar Datalists (para búsqueda por concatenación en la planilla)
    dlChoferes.innerHTML = choferesRegistrados.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    dlMoviles.innerHTML = movilesRegistrados.map(m => `<option value="${m.numero}">${m.numero}</option>`).join('');

    // Actualizar Selects de los modales (desplegables fijos)
    if (selectChoferEdit) {
        selectChoferEdit.innerHTML = '<option value="">-- Seleccione un chofer --</option>' + 
            choferesRegistrados.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
    if (buscarMovilEdit) {
        buscarMovilEdit.innerHTML = '<option value="">-- Seleccione un móvil --</option>' + 
            movilesRegistrados.map(m => `<option value="${m.numero}">${m.numero}</option>`).join('');
    }
}

// Llamar a la carga inicial
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDesdeServidor();
});

function abrirModal(titulo, listaDestino, tipo, index = null) {
    modalTitulo.textContent = titulo;
    listaDestinoActual = listaDestino;
    tipoActual = tipo;
    editIndex = index;

    // Reset de formularios
    formChofer.classList.add('oculto');
    formMovil.classList.add('oculto');

    if(tipo === 'chofer') {
        formChofer.classList.remove('oculto');
        // Limpiar campos de chofer
        document.getElementById('chofer-nombre').value = "";
        document.getElementById('chofer-direccion').value = "";
        document.getElementById('chofer-cod-area').value = "";
        document.getElementById('chofer-nro-tel').value = "";
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

// Lógica para abrir el buscador de móviles
if (btnModificarMovil) {
    btnModificarMovil.addEventListener('click', () => {
        buscarMovilEdit.value = "";
        formModMovilCampos.classList.add('oculto');
        modalModMovil.classList.remove('oculto');
    });
}

// Lógica para Modificar Chofer
if (btnModificarChofer) {
    btnModificarChofer.addEventListener('click', () => {
        actualizarDatalists();
        formModChoferCampos.classList.add('oculto');
        modalModChofer.classList.remove('oculto');
    });
}

if (selectChoferEdit) {
    selectChoferEdit.addEventListener('change', () => {
        const id = selectChoferEdit.value;
        const chofer = choferesRegistrados.find(c => c.id == id);
        
        if (chofer) {
            choferIDSeleccionado = id;
            formModChoferCampos.classList.remove('oculto');
            
            const telParts = (chofer.telefono || "").split(" "); // Asumimos espacio como separador
            document.getElementById('edit-chofer-nombre').value = chofer.nombre;
            document.getElementById('edit-chofer-direccion').value = chofer.direccion;
            document.getElementById('edit-chofer-cod-area').value = telParts[0] || "";
            document.getElementById('edit-chofer-nro-tel').value = telParts[1] || "";
            document.getElementById('edit-chofer-dni').value = chofer.dni;
            document.getElementById('edit-chofer-licencia-desde').value = chofer.licencia_desde || chofer.licenciaDesde || "";
            document.getElementById('edit-chofer-licencia-hasta').value = chofer.licencia_hasta || chofer.licenciaHasta || "";
        } else {
            formModChoferCampos.classList.add('oculto');
        }
    });
}

if (btnCancelarModChofer) {
    btnCancelarModChofer.addEventListener('click', () => modalModChofer.classList.add('oculto'));
}

if (btnConfirmarModChofer) {
    btnConfirmarModChofer.addEventListener('click', () => {
        const codArea = document.getElementById('edit-chofer-cod-area').value.trim();
        const nroTel = document.getElementById('edit-chofer-nro-tel').value.trim();
        
        const datos = {
            id: choferIDSeleccionado,
            nombre: document.getElementById('edit-chofer-nombre').value.trim(),
            direccion: document.getElementById('edit-chofer-direccion').value.trim(),
            telefono: `${codArea} ${nroTel}`.trim(),
            dni: document.getElementById('edit-chofer-dni').value.trim(),
            licenciaDesde: document.getElementById('edit-chofer-licencia-desde').value,
            licenciaHasta: document.getElementById('edit-chofer-licencia-hasta').value
        };

        fetch('../PHP/actualizar_chofer.php', {
            method: 'POST',
            body: JSON.stringify(datos),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                alert("Chofer actualizado correctamente.");
                cargarDatosDesdeServidor();
                modalModChofer.classList.add('oculto');
            }
        });
    });
}

if (btnBorrarChoferDB) {
    btnBorrarChoferDB.addEventListener('click', () => {
        if (confirm("Usted desea borrar definitivamente")) {
            fetch('../PHP/borrar_chofer.php', {
                method: 'POST',
                body: JSON.stringify({ id: choferIDSeleccionado }),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    alert("Chofer eliminado.");
                    cargarDatosDesdeServidor();
                    modalModChofer.classList.add('oculto');
                } else {
                    alert("Error al eliminar: " + data.error);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error de comunicación con el servidor.");
            });
        }
    });
}

// Buscar datos del móvil al escribir en el modal de edición
if (buscarMovilEdit) {
    buscarMovilEdit.addEventListener('change', () => {
        const nro = buscarMovilEdit.value.trim();
        const movil = movilesRegistrados.find(m => m.numero === nro);
        
        if (movil) {
            formModMovilCampos.classList.remove('oculto');
            document.getElementById('edit-movil-numero').value = movil.numero;
            document.getElementById('edit-movil-marca').value = movil.marca;
            document.getElementById('edit-movil-modelo').value = movil.modelo;
            document.getElementById('edit-movil-patente').value = movil.patente;
        } else {
            formModMovilCampos.classList.add('oculto');
        }
    });
}

if (btnCancelarModMovil) {
    btnCancelarModMovil.addEventListener('click', () => {
        modalModMovil.classList.add('oculto');
    });
}

// Función para cargar la tabla de horarios según la fecha seleccionada
function cargarTablaHorarios() {
    if (!tablaHorariosBody) return;

    const fechaSeleccionada = buscadorFecha.value;
    // Limpiar filas actuales (manteniendo el header)
    const filas = tablaHorariosBody.querySelectorAll('.fila:not(.fila-header)');
    filas.forEach(f => f.remove());

    if (!fechaSeleccionada) return;

    choferesRegistrados.forEach(chofer => {
        const registro = horariosRegistrados.find(h => h.chofer === chofer.nombre && h.fecha === fechaSeleccionada);
        
        const nuevaFila = document.createElement('div');
        nuevaFila.classList.add('fila');
        
        const movilAsignado = registro ? registro.movil : '';
        const entradaHora = registro ? registro.entrada : '--:--';
        const salidaHora = registro ? registro.salida : '--:--';
        const entradaDisabled = (entradaHora !== '--:--') ? 'disabled' : '';
        const salidaDisabled = (salidaHora !== '--:--') ? 'disabled' : '';

        nuevaFila.innerHTML = `
            <div class="columna-check">
                <input type="checkbox" class="row-checkbox" data-chofer="${chofer.nombre}">
            </div>
            <div class="columna-movil">
                <p class="texto-movil" style="font-size: 1.4rem;">${chofer.nombre}</p>
            </div>
            <div class="columna-movil">
                <input type="text" class="input-tabla input-movil-asignado" list="lista-moviles-datalist" value="${movilAsignado}" 
                       placeholder="Móvil" ${entradaDisabled} autocomplete="off"
                       onfocus="if(this.showPicker) this.showPicker();" 
                       onclick="if(this.showPicker) this.showPicker();">
            </div>
            <div class="columna-entrada">
                <button class="btn-entrada" ${entradaDisabled} onclick="registrarEvento(this, 'entrada')">Entrada</button>
            </div>
            <div class="columna-hora">
                <input type="text" class="input-tabla hora-entrada" value="${entradaHora}" readonly>
            </div>
            <div class="columna-salida">
                <button class="btn-salida" ${salidaDisabled} onclick="registrarEvento(this, 'salida')">Salida</button>
            </div>
            <div class="columna-hora">
                <input type="text" class="input-tabla hora-salida" value="${salidaHora}" readonly>
            </div>
        `;
        tablaHorariosBody.appendChild(nuevaFila);
    });
}

// Lógica para Seleccionar Todos
document.addEventListener('change', (e) => {
    if (e.target.id === 'select-all') {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    }
});

// Listener para el buscador de fecha
if (buscadorFecha) {
    // Poner fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    buscadorFecha.value = hoy;
    buscadorFecha.addEventListener('change', cargarTablaHorarios);
    // Carga inicial
    cargarTablaHorarios();
}

// Función para agregar una fila de asignación manual
function agregarFilaAsignacion(contenedor, datos = null) {
    const nuevaFila = document.createElement('div');
    nuevaFila.classList.add('fila');
    
    // Si vienen datos de la DB, los usamos, si no, vacío
    if (datos && datos.id) nuevaFila.dataset.id = datos.id;
    const chofer = datos ? datos.chofer : '';
    const movil = datos ? datos.movil : '';
    const entrada = (datos && datos.entrada && datos.entrada !== '--:--') ? datos.entrada : '';
    const salida = (datos && datos.salida && datos.salida !== '--:--') ? datos.salida : '';
    const activoChecked = (datos && datos.activo == 1) ? 'checked' : '';

    nuevaFila.innerHTML = `
        <div class="columna-nombre" style="flex: 1.5;">
            <input type="text" class="input-tabla input-p-chofer" list="lista-choferes-datalist" value="${chofer}" 
                   placeholder="Seleccionar Chofer..." autocomplete="off" 
                   onfocus="if(this.showPicker) this.showPicker();" 
                   onclick="if(this.showPicker) this.showPicker();">
        </div>
        <div class="columna-movil">
            <input type="text" class="input-tabla input-p-movil" list="lista-moviles-datalist" value="${movil}" 
                   placeholder="Seleccionar Móvil..." autocomplete="off" 
                   onfocus="if(this.showPicker) this.showPicker();" 
                   onclick="if(this.showPicker) this.showPicker();">
        </div>
        <div class="columna-activo"><input type="checkbox" class="input-p-activo" ${activoChecked}></div>
        <div class="columna-horario">
            <input type="time" class="input-time input-p-entrada" value="${entrada}"> <span>a</span> 
            <input type="time" class="input-time input-p-salida" value="${salida}">
        </div>
        <div class="columna-acciones">
            <button class="btn-guardar">Guardar</button>
            <button class="btn-borrar" onclick="eliminarFilaPlanilla(this)">Borrar</button>
        </div>
    `;

    // Evento para el botón Guardar
    nuevaFila.querySelector('.btn-guardar').addEventListener('click', () => guardarFilaPlanilla(nuevaFila));

    contenedor.appendChild(nuevaFila);
}

function eliminarFilaPlanilla(boton) {
    const fila = boton.closest('.fila');
    const id = fila.dataset.id;

    if (confirm('¿Eliminar esta asignación permanentemente?')) {
        if (id) {
            fetch('../PHP/borrar_fila_planilla.php', {
                method: 'POST',
                body: JSON.stringify({ id: id }),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Eliminar también del array local para que no reaparezca sin F5
                    horariosRegistrados = horariosRegistrados.filter(h => h.id != id);
                    actualizarLocalStorage();
                    fila.remove();
                    cargarTablaChoferes(); // Recargar para mantener el mínimo de 4 filas
                }
            })
            .catch(err => alert("Error al conectar con el servidor para borrar"));
        } else {
            fila.remove();
        }
    }
}

function guardarFilaPlanilla(fila) {
    const id = fila.dataset.id || null;
    const chofer = fila.querySelector('.input-p-chofer').value.trim();
    const movil = fila.querySelector('.input-p-movil').value.trim();
    const entrada = fila.querySelector('.input-p-entrada').value;
    const salida = fila.querySelector('.input-p-salida').value;
    const activo = fila.querySelector('.input-p-activo').checked ? 1 : 0;
    const fecha = new Date().toISOString().split('T')[0]; // Hoy

    // Solo guardamos si hay un nombre de chofer para evitar conflictos en la DB
    if (chofer === "") return;

    fetch('../PHP/guardar_planilla.php', {
        method: 'POST',
        body: JSON.stringify({
            id, chofer, movil, entrada, salida, fecha, activo
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.new_id) {
            alert("Cambios guardados en la fila.");
            fila.dataset.id = data.new_id;
            const nuevoRegistro = { id: data.new_id, chofer, movil, entrada, salida, activo, fecha };
            
            // Buscamos si ya existe por ID para actualizarlo en la memoria local (F5 preventivo)
            let index = horariosRegistrados.findIndex(h => h.id == data.new_id);
            
            if (index === -1) {
                // Si no lo encuentra por ID, quizás es nuevo pero ya existe el chofer para hoy
                index = horariosRegistrados.findIndex(h => h.chofer === chofer && h.fecha === fecha);
            }

            if (index !== -1) {
                horariosRegistrados[index] = nuevoRegistro;
            } else {
                horariosRegistrados.push(nuevoRegistro);
            }
            actualizarLocalStorage();
        } else if (!data.success) {
            alert("Error al guardar: " + (data.error || "Datos duplicados para este chofer hoy."));
        }
    })
    .catch(err => console.error("Error de conexión:", err));
}

// Delegación de eventos para la tabla de Choferes (Borrar y Editar)
if (listaCuerpo) {
    listaCuerpo.addEventListener('click', (e) => {
        const fila = e.target.closest('.fila');
        const tipo = fila.dataset.tipo;
        const index = fila.dataset.index;

        if (e.target.classList.contains('btn-borrar')) {
            if (confirm('¿Está seguro de eliminar este registro?')) {
                if (tipo === 'chofer') choferesRegistrados.splice(index, 1);
                else if (tipo === 'movil') movilesRegistrados.splice(index, 1);
                
                actualizarLocalStorage();
                cargarTablaChoferes();
            }
        } else if (e.target.classList.contains('btn-editar')) {
            prepararEdicion(tipo, index);
        }
    });
}

function prepararEdicion(tipo, index) {
    const datos = (tipo === 'chofer') ? choferesRegistrados[index] : movilesRegistrados[index];
    abrirModal(tipo === 'chofer' ? "Editar Datos del Chofer" : "Editar Datos del Móvil", 
               tipo === 'chofer' ? listaChoferes : listaMoviles, 
               tipo, index);

    if (tipo === 'chofer') {
        const telParts = (datos.telefono || "").split(" "); 
        document.getElementById('chofer-nombre').value = datos.nombre;
        document.getElementById('chofer-direccion').value = datos.direccion;
        document.getElementById('chofer-cod-area').value = telParts[0] || "";
        document.getElementById('chofer-nro-tel').value = telParts[1] || "";
        document.getElementById('chofer-dni').value = datos.dni;
        document.getElementById('chofer-licencia-desde').value = datos.licencia_desde || datos.licenciaDesde || "";
        document.getElementById('chofer-licencia-hasta').value = datos.licencia_hasta || datos.licenciaHasta || "";
    } else {
        document.getElementById('movil-numero').value = datos.numero;
        document.getElementById('movil-marca').value = datos.marca;
        document.getElementById('movil-modelo').value = datos.modelo;
        document.getElementById('movil-patente').value = datos.patente;
    }
}

// Registro de Horarios (Entrada/Salida)
function registrarEvento(boton, tipo) {
    const fila = boton.closest('.fila');
    const nombreChofer = fila.querySelector('.texto-movil').textContent;
    const nroMovil = fila.querySelector('.input-movil-asignado').value.trim();
    const fechaSeleccionada = buscadorFecha.value;
    const ahora = new Date();
    const horaActual = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!nroMovil) { alert("Debe asignar un número de móvil primero."); return; }

    let registro = horariosRegistrados.find(h => h.chofer === nombreChofer && h.fecha === fechaSeleccionada);

    if (!registro) {
        registro = { chofer: nombreChofer, movil: nroMovil, fecha: fechaSeleccionada, entrada: '--:--', salida: '--:--' };
        horariosRegistrados.push(registro);
    }

    if (tipo === 'entrada') {
        registro.entrada = horaActual;
        fila.querySelector('.hora-entrada').value = horaActual;
    } else {
        registro.salida = horaActual;
        fila.querySelector('.hora-salida').value = horaActual;
    }

    // Enviar al servidor para que todos lo vean
    fetch('../PHP/guardar_horario.php', {
        method: 'POST',
        body: JSON.stringify({
            chofer: nombreChofer,
            movil: nroMovil,
            fecha: fechaSeleccionada,
            hora: horaActual,
            tipo: tipo
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            fila.querySelector('.input-movil-asignado').disabled = true;
            boton.disabled = true;
            localStorage.setItem('horarios', JSON.stringify(horariosRegistrados));
        } else {
            alert("Error al guardar horario: " + data.error);
        }
    });
}

btnCancelar.addEventListener('click', cerrarModal);

btnConfirmar.addEventListener('click', () => {
    if (tipoActual === 'chofer') {
        const codArea = document.getElementById('chofer-cod-area').value.trim();
        const nroTel = document.getElementById('chofer-nro-tel').value.trim();

        const datos = {
            nombre: document.getElementById('chofer-nombre').value.trim(),
            direccion: document.getElementById('chofer-direccion').value.trim(),
            telefono: `${codArea} ${nroTel}`.trim(),
            dni: document.getElementById('chofer-dni').value.trim(),
            licenciaDesde: document.getElementById('chofer-licencia-desde').value,
            licenciaHasta: document.getElementById('chofer-licencia-hasta').value
        };

        if (datos.nombre !== "") {
            if (editIndex !== null) {
                // Lógica de Actualización
                choferesRegistrados[editIndex] = datos;
                actualizarLocalStorage();
                cargarTablaChoferes();
                cerrarModal();
                return;
            }

            // Enviar a PHP
            fetch('../PHP/guardar_chofer.php', {
                method: 'POST',
                body: JSON.stringify(datos),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    choferesRegistrados.push(datos);
                    actualizarLocalStorage();
                    actualizarDatalists(); // Solo actualizamos las sugerencias
                    cerrarModal();
                } else {
                    alert("Error del servidor: " + (data.error || "Desconocido"));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("No se pudo conectar con el servidor PHP. Asegúrate de estar usando XAMPP.");
            });
        } else {
            alert("El nombre es obligatorio");
        }
    } else if (tipoActual === 'movil') {
        const datos = {
            numero: document.getElementById('movil-numero').value.trim(),
            marca: document.getElementById('movil-marca').value.trim(),
            modelo: document.getElementById('movil-modelo').value.trim(),
            patente: document.getElementById('movil-patente').value.trim()
        };

        if (datos.numero !== "") {
            if (editIndex !== null) {
                // Lógica de Actualización
                movilesRegistrados[editIndex] = datos;
                actualizarLocalStorage();
                cargarTablaChoferes();
                cerrarModal();
                return;
            }

            fetch('../PHP/guardar_movil.php', {
                method: 'POST',
                body: JSON.stringify(datos),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    movilesRegistrados.push(datos);
                    actualizarLocalStorage();
                    actualizarDatalists(); // Solo actualizamos las sugerencias
                    cerrarModal();
                } else {
                    alert("Error del servidor: " + (data.error || "Desconocido"));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("No se pudo conectar con el servidor PHP. Asegúrate de estar usando XAMPP.");
            });
        } else {
            alert("El número de móvil es obligatorio");
        }
    }
});

if (btnConfirmarModMovil) {
    btnConfirmarModMovil.addEventListener('click', () => {
        const nro = document.getElementById('edit-movil-numero').value;
        const index = movilesRegistrados.findIndex(m => m.numero === nro);

        if (index !== -1) {
            movilesRegistrados[index] = {
                numero: nro,
                marca: document.getElementById('edit-movil-marca').value.trim(),
                modelo: document.getElementById('edit-movil-modelo').value.trim(),
                patente: document.getElementById('edit-movil-patente').value.trim()
            };
            actualizarLocalStorage();
            actualizarDatalists();
            modalModMovil.classList.add('oculto');
            alert("Móvil actualizado correctamente.");
        }
    });
}

function actualizarLocalStorage() {
    localStorage.setItem('choferes', JSON.stringify(choferesRegistrados));
    localStorage.setItem('moviles', JSON.stringify(movilesRegistrados));
    localStorage.setItem('horarios', JSON.stringify(horariosRegistrados));
    localStorage.setItem('rendiciones', JSON.stringify(rendicionesRegistradas));
}

function cargarTablaChoferes() {
    if (!listaCuerpo) return;
    
    // 1. Re-generar la estructura base
    listaCuerpo.innerHTML = `
        <div class="seccion-tabla">
            <h2 class="titulo-planilla">Planilla de Choferes</h2>
            <div class="tabla-choferes">
                <div class="fila fila-header">
                    <p style="flex: 1.5;">Chofer</p>
                    <p>Móvil</p>
                    <p>Activo</p>
                    <p>Horario</p>
                    <p>Acciones</p>
                </div>
                <div id="cuerpo-planilla"></div>
            </div>
        </div>
    `;

    const cuerpoPlanilla = document.getElementById('cuerpo-planilla');
    
    // 2. Cargar registros reales de la DB (Si hay 6, cargará 6)
    horariosRegistrados.forEach(reg => agregarFilaAsignacion(cuerpoPlanilla, reg));

    // 3. Rellenar con filas vacías solo hasta alcanzar el mínimo de 4
    const filasActuales = cuerpoPlanilla.children.length;
    const minimoFilas = 4;
    
    for(let i = filasActuales; i < minimoFilas; i++) {
        agregarFilaAsignacion(cuerpoPlanilla);
    }
}

// Evento para el botón "+"
if (btnNuevaFila) {
    btnNuevaFila.addEventListener('click', () => {
        const cuerpoPlanilla = document.getElementById('cuerpo-planilla');
        if (cuerpoPlanilla) agregarFilaAsignacion(cuerpoPlanilla);
    });
}

// Carga inicial de datos en la tabla de DatosChoferes
if (listaCuerpo) {
    cargarTablaChoferes();
}

if (btnExportar) {
    btnExportar.addEventListener('click', () => {
        if (choferesRegistrados.length === 0 && movilesRegistrados.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        let csvContent = "\uFEFF"; // BOM para que Excel detecte UTF-8 (acentos)
        
        // Sección Choferes
        csvContent += "--- DATOS DE CHOFERES ---\n";
        csvContent += "Nombre;Dirección;Teléfono;DNI;Licencia Desde;Licencia Hasta\n";
        choferesRegistrados.forEach(c => {
            csvContent += `${c.nombre};${c.direccion};${c.telefono};${c.dni};${c.licenciaDesde};${c.licenciaHasta}\n`;
        });

        csvContent += "\n"; // Espacio entre tablas

        // Sección Móviles
        csvContent += "--- DATOS DE MÓVILES ---\n";
        csvContent += "Número;Marca;Modelo;Patente\n";
        movilesRegistrados.forEach(m => {
            csvContent += `${m.numero};${m.marca};${m.modelo};${m.patente}\n`;
        });

        // Sección Planilla de Asignación Actual
        const cuerpoPlanilla = document.getElementById('cuerpo-planilla');
        if (cuerpoPlanilla) {
            csvContent += "\n--- PLANILLA DE ASIGNACIÓN ACTUAL ---\n";
            csvContent += "Chofer;Móvil;Activo;Inicio;Fin\n";
            const filas = cuerpoPlanilla.querySelectorAll('.fila');
            filas.forEach(f => {
                const chofer = f.querySelector('.input-p-chofer')?.value || "";
                const movil = f.querySelector('.input-p-movil')?.value || "";
                const activo = f.querySelector('.input-p-activo')?.checked ? "Si" : "No";
                const inicio = f.querySelector('.input-p-entrada')?.value || "";
                const fin = f.querySelector('.input-p-salida')?.value || "";
                
                // Solo exportar si la fila tiene al menos un chofer o un móvil asignado
                if (chofer !== "" || movil !== "") {
                    csvContent += `${chofer};${movil};${activo};${inicio};${fin}\n`;
                }
            });
        }

        // Crear el archivo y descargarlo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "Informacion_Sistema_Limite.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Exportar Horarios
if (btnExportarHorarios) {
    btnExportarHorarios.addEventListener('click', () => {
        modalExportar.classList.remove('oculto');
    });
}

if (btnCancelarExport) {
    btnCancelarExport.addEventListener('click', () => modalExportar.classList.add('oculto'));
}

if (btnConfirmarExport) {
    btnConfirmarExport.addEventListener('click', () => {
        const desde = fechaDesdeExport.value;
        const hasta = fechaHastaExport.value;
        const seleccionados = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => cb.dataset.chofer);

        if (!desde || !hasta || seleccionados.length === 0) {
            alert("Debe seleccionar fechas y al menos un chofer.");
            return;
        }

        // Filtrar datos
        const datosFiltrados = horariosRegistrados.filter(h => 
            h.fecha >= desde && 
            h.fecha <= hasta && 
            seleccionados.includes(h.chofer)
        );

        if (datosFiltrados.length === 0) {
            alert("No hay registros para los criterios seleccionados.");
            return;
        }

        // Agrupar por fecha
        const agrupadosPorFecha = datosFiltrados.reduce((acc, curr) => {
            if (!acc[curr.fecha]) acc[curr.fecha] = [];
            acc[curr.fecha].push(curr);
            return acc;
        }, {});

        let csvContent = "\uFEFF"; // BOM para Excel UTF-8
        
        Object.keys(agrupadosPorFecha).sort().forEach(fecha => {
            csvContent += `FECHA DEL REGISTRO: ${fecha}\n`;
            csvContent += `Chofer;Móvil;Entrada;Salida\n`;
            agrupadosPorFecha[fecha].forEach(reg => {
                csvContent += `${reg.chofer};${reg.movil};${reg.entrada};${reg.salida}\n`;
            });
            csvContent += `\n`; // Espacio entre "hojas"/fechas
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Reporte_Agrupado_${desde}_a_${hasta}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        modalExportar.classList.add('oculto');
    });
}
