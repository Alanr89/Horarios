// Referencias a botones y elementos del DOM
const btnChofer = document.getElementById('btn-agregar-chofer');
const btnMovil = document.getElementById('btn-agregar-movil');
const btnExportar = document.getElementById('btn-exportar');
const btnNuevaFila = document.getElementById('btn-nueva-fila');
const listaCuerpo = document.getElementById('lista-cuerpo');
const listaChoferesDatalist = document.getElementById('lista-choferes-datalist');
const listaMovilesDatalist = document.getElementById('lista-moviles-datalist');

// Referencias Modales
const modal = document.getElementById('modal-contenedor');
const modalTitulo = document.getElementById('modal-titulo');
const formChofer = document.getElementById('form-chofer');
const formMovil = document.getElementById('form-movil');
const btnConfirmar = document.getElementById('btn-modal-confirmar');
const btnCancelar = document.getElementById('btn-modal-cancelar');

// Referencias Modificar Chofer
const modalModChofer = document.getElementById('modal-modificar-chofer');
const btnModificarChofer = document.getElementById('btn-modificar-chofer');
const selectChoferEdit = document.getElementById('select-chofer-edit');
const formModChoferCampos = document.getElementById('form-modificar-chofer-campos');
const btnConfirmarModChofer = document.getElementById('btn-confirmar-mod-chofer');
const btnCancelarModChofer = document.getElementById('btn-cancelar-mod-chofer');
const btnBorrarChoferDB = document.getElementById('btn-borrar-chofer-db');

// Referencias Modificar Móvil
const modalModMovil = document.getElementById('modal-modificar-movil');
const btnModificarMovil = document.getElementById('btn-modificar-movil');
const buscarMovilEdit = document.getElementById('buscar-movil-edit');
const formModMovilCampos = document.getElementById('form-modificar-movil-campos');
const btnConfirmarModMovil = document.getElementById('btn-confirmar-mod-movil');
const btnCancelarModMovil = document.getElementById('btn-cancelar-mod-movil');
const btnBorrarMovilDB = document.getElementById('btn-borrar-movil-db');

// Variables Globales
let choferesRegistrados = [];
let movilesRegistrados = [];
let horariosRegistrados = [];
let tipoActual = ''; 
let choferIDSeleccionado = null;
let movilIDSeleccionado = null;

// ==========================================
// 1. CARGA INICIAL DE DATOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDesdeServidor();
});

function cargarDatosDesdeServidor() {
    const url = `../PHP/obtener_datos.php?t=${new Date().getTime()}`;
    fetch(url, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            if (data) {
                choferesRegistrados = data.choferes || [];
                movilesRegistrados = data.moviles || [];
                horariosRegistrados = data.horarios || [];
                
                actualizarDatalists();
                if (listaCuerpo) cargarTablaChoferes();
            }
        })
        .catch(err => console.error("Error al cargar datos desde el servidor:", err));
}

function actualizarDatalists() {
    if (listaChoferesDatalist) {
        listaChoferesDatalist.innerHTML = choferesRegistrados.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    }
    if (listaMovilesDatalist) {
        listaMovilesDatalist.innerHTML = movilesRegistrados.map(m => `<option value="${m.numero}">${m.numero}</option>`).join('');
    }
    if (selectChoferEdit) {
        selectChoferEdit.innerHTML = '<option value="">-- Seleccione un chofer --</option>' + 
            choferesRegistrados.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
    if (buscarMovilEdit) {
        buscarMovilEdit.innerHTML = '<option value="">-- Seleccione un móvil --</option>' + 
            movilesRegistrados.map(m => `<option value="${m.numero}">${m.numero}</option>`).join('');
    }
}

// ==========================================
// 2. PLANILLA DE ASIGNACIONES (TABLA)
// ==========================================
function cargarTablaChoferes() {
    if (!listaCuerpo) return;
    
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
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    
    const registrosHoy = horariosRegistrados.filter(reg => reg.fecha === hoy);
    registrosHoy.forEach(reg => agregarFilaAsignacion(cuerpoPlanilla, reg));

    const minimoFilas = 4;
    const filasActuales = cuerpoPlanilla.children.length;
    for(let i = filasActuales; i < minimoFilas; i++) {
        agregarFilaAsignacion(cuerpoPlanilla);
    }
}

function agregarFilaAsignacion(contenedor, datos = null) {
    const nuevaFila = document.createElement('div');
    nuevaFila.classList.add('fila');
    
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
            <button class="btn-borrar">Borrar</button>
        </div>
    `;

    nuevaFila.querySelector('.btn-guardar').addEventListener('click', () => guardarFilaPlanilla(nuevaFila));
    nuevaFila.querySelector('.btn-borrar').addEventListener('click', () => eliminarFilaPlanilla(nuevaFila));

    contenedor.appendChild(nuevaFila);
}

if (btnNuevaFila) {
    btnNuevaFila.addEventListener('click', () => {
        const cuerpoPlanilla = document.getElementById('cuerpo-planilla');
        if (cuerpoPlanilla) agregarFilaAsignacion(cuerpoPlanilla);
    });
}

function guardarFilaPlanilla(fila) {
    const id = fila.dataset.id || null;
    const chofer = fila.querySelector('.input-p-chofer').value.trim();
    const movil = fila.querySelector('.input-p-movil').value.trim();
    const entrada = fila.querySelector('.input-p-entrada').value;
    const salida = fila.querySelector('.input-p-salida').value;
    const activo = fila.querySelector('.input-p-activo').checked ? 1 : 0;
    
    const ahora = new Date();
    const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;

    if (chofer === "") {
        if (id) {
            alert("Para borrar un registro guardado y dejar la fila en blanco, utilice el botón 'Borrar'.");
        } else {
            alert("Debe seleccionar un chofer antes de guardar.");
        }
        return;
    }

    // VALIDACIÓN: Avisa que el usuario está duplicando al chofer, pero permite continuar si acepta.
    const choferDuplicado = horariosRegistrados.find(h => h.chofer === chofer && h.fecha === fecha && h.id != id);
    if (choferDuplicado) {
        const confirmarDuplicado = confirm(`ALERTA: El chofer "${chofer}" ya está asignado hoy en otra fila.\n\n¿Desea asignarlo nuevamente para otro turno o móvil?`);
        if (!confirmarDuplicado) {
            return; // Detiene el guardado si el usuario cancela
        }
    }

    fetch('../PHP/guardar_planilla.php', {
        method: 'POST',
        body: JSON.stringify({ id, chofer, movil, entrada, salida, fecha, activo }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Fila guardada exitosamente en la base de datos.");
            cargarDatosDesdeServidor();
        } else {
            alert("Error al guardar: " + (data.error || "Datos duplicados."));
        }
    })
    .catch(err => alert("Error de conexión al guardar."));
}

function eliminarFilaPlanilla(fila) {
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
                    cargarDatosDesdeServidor();
                }
            })
            .catch(err => alert("Error al conectar con el servidor para borrar"));
        } else {
            fila.remove();
            cargarTablaChoferes();
        }
    }
}

// ==========================================
// 3. LÓGICA DE MODALES (CREAR/EDITAR)
// ==========================================
function cerrarModal() { 
    if (modal) modal.classList.add('oculto'); 
    if (modalModChofer) modalModChofer.classList.add('oculto');
    if (modalModMovil) modalModMovil.classList.add('oculto');
}

if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
if (btnCancelarModChofer) btnCancelarModChofer.addEventListener('click', cerrarModal);
if (btnCancelarModMovil) btnCancelarModMovil.addEventListener('click', cerrarModal);

function abrirModalNuevo(titulo, tipo) {
    modalTitulo.textContent = titulo;
    tipoActual = tipo;

    formChofer.classList.add('oculto');
    formMovil.classList.add('oculto');

    if(tipo === 'chofer') {
        formChofer.classList.remove('oculto');
        document.getElementById('chofer-nombre').value = "";
        document.getElementById('chofer-direccion').value = "";
        document.getElementById('chofer-cod-area').value = "";
        document.getElementById('chofer-nro-tel').value = "";
        document.getElementById('chofer-dni').value = "";
        document.getElementById('chofer-licencia-desde').value = "";
        document.getElementById('chofer-licencia-hasta').value = "";
    } else if(tipo === 'movil') {
        formMovil.classList.remove('oculto');
        document.getElementById('movil-numero').value = "";
        document.getElementById('movil-marca').value = "";
        document.getElementById('movil-modelo').value = "";
        document.getElementById('movil-patente').value = "";
    }
    modal.classList.remove('oculto');
}

if (btnChofer) btnChofer.addEventListener('click', () => abrirModalNuevo("Datos Personales del Chofer", 'chofer'));
if (btnMovil) btnMovil.addEventListener('click', () => abrirModalNuevo("Datos del Móvil", 'movil'));

if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => {
        if (tipoActual === 'chofer') {
            const datos = {
                nombre: document.getElementById('chofer-nombre').value.trim(),
                direccion: document.getElementById('chofer-direccion').value.trim(),
                telefono: `${document.getElementById('chofer-cod-area').value.trim()} ${document.getElementById('chofer-nro-tel').value.trim()}`.trim(),
                dni: document.getElementById('chofer-dni').value.trim(),
                licenciaDesde: document.getElementById('chofer-licencia-desde').value,
                licenciaHasta: document.getElementById('chofer-licencia-hasta').value
            };

            if (datos.nombre !== "") {
                fetch('../PHP/guardar_chofer.php', { method: 'POST', body: JSON.stringify(datos), headers: { 'Content-Type': 'application/json' }})
                .then(res => res.json()).then(data => {
                    if(data.success) { cargarDatosDesdeServidor(); cerrarModal(); } 
                    else { alert("Error del servidor: " + (data.error || "Desconocido")); }
                });
            } else { alert("El nombre es obligatorio"); }
        } else if (tipoActual === 'movil') {
            const datos = {
                numero: document.getElementById('movil-numero').value.trim(),
                marca: document.getElementById('movil-marca').value.trim(),
                modelo: document.getElementById('movil-modelo').value.trim(),
                patente: document.getElementById('movil-patente').value.trim()
            };

            if (datos.numero !== "") {
                fetch('../PHP/guardar_movil.php', { method: 'POST', body: JSON.stringify(datos), headers: { 'Content-Type': 'application/json' }})
                .then(res => res.json()).then(data => {
                    if(data.success) { cargarDatosDesdeServidor(); cerrarModal(); } 
                    else { alert("Error del servidor: " + (data.error || "Desconocido")); }
                });
            } else { alert("El número de móvil es obligatorio"); }
        }
    });
}

// ==========================================
// 4. EDICIÓN / BORRADO DE CHOFERES
// ==========================================
if (btnModificarChofer) {
    btnModificarChofer.addEventListener('click', () => {
        selectChoferEdit.value = "";
        formModChoferCampos.classList.add('oculto');
        choferIDSeleccionado = null;
        modalModChofer.classList.remove('oculto');
    });
}

if (selectChoferEdit) {
    selectChoferEdit.addEventListener('change', () => {
        const chofer = choferesRegistrados.find(c => c.id == selectChoferEdit.value);
        if (chofer) {
            choferIDSeleccionado = chofer.id;
            formModChoferCampos.classList.remove('oculto');
            const telParts = (chofer.telefono || "").split(" ");
            document.getElementById('edit-chofer-nombre').value = chofer.nombre;
            document.getElementById('edit-chofer-direccion').value = chofer.direccion;
            document.getElementById('edit-chofer-cod-area').value = telParts[0] || "";
            document.getElementById('edit-chofer-nro-tel').value = telParts[1] || "";
            document.getElementById('edit-chofer-dni').value = chofer.dni;
            document.getElementById('edit-chofer-licencia-desde').value = chofer.licencia_desde || chofer.licenciaDesde || "";
            document.getElementById('edit-chofer-licencia-hasta').value = chofer.licencia_hasta || chofer.licenciaHasta || "";
        } else {
            choferIDSeleccionado = null;
            formModChoferCampos.classList.add('oculto');
        }
    });
}

if (btnConfirmarModChofer) {
    btnConfirmarModChofer.addEventListener('click', () => {
        const datos = {
            id: choferIDSeleccionado,
            nombre: document.getElementById('edit-chofer-nombre').value.trim(),
            direccion: document.getElementById('edit-chofer-direccion').value.trim(),
            telefono: `${document.getElementById('edit-chofer-cod-area').value.trim()} ${document.getElementById('edit-chofer-nro-tel').value.trim()}`.trim(),
            dni: document.getElementById('edit-chofer-dni').value.trim(),
            licenciaDesde: document.getElementById('edit-chofer-licencia-desde').value,
            licenciaHasta: document.getElementById('edit-chofer-licencia-hasta').value
        };

        fetch('../PHP/actualizar_chofer.php', { method: 'POST', body: JSON.stringify(datos), headers: { 'Content-Type': 'application/json' }})
        .then(res => res.json()).then(data => {
            if(data.success) { alert("Chofer actualizado"); cargarDatosDesdeServidor(); cerrarModal(); }
        });
    });
}

if (btnBorrarChoferDB) {
    btnBorrarChoferDB.addEventListener('click', (e) => {
        e.preventDefault();
        if (!choferIDSeleccionado) { alert("Seleccione un chofer primero."); return; }
        if (confirm("¿Borrar definitivamente a este chofer?")) {
            fetch('../PHP/borrar_chofer.php', { method: 'POST', body: JSON.stringify({ id: choferIDSeleccionado }), headers: { 'Content-Type': 'application/json' }})
            .then(res => res.json()).then(data => {
                if(data.success) { alert("Chofer eliminado."); cargarDatosDesdeServidor(); cerrarModal(); } 
                else { alert("Error: " + data.error); }
            });
        }
    });
}

// ==========================================
// 5. EDICIÓN / BORRADO DE MÓVILES
// ==========================================
if (btnModificarMovil) {
    btnModificarMovil.addEventListener('click', () => {
        buscarMovilEdit.value = "";
        formModMovilCampos.classList.add('oculto');
        movilIDSeleccionado = null;
        modalModMovil.classList.remove('oculto');
    });
}

if (buscarMovilEdit) {
    buscarMovilEdit.addEventListener('change', () => {
        const movil = movilesRegistrados.find(m => m.numero === buscarMovilEdit.value.trim());
        if (movil) {
            movilIDSeleccionado = movil.id;
            formModMovilCampos.classList.remove('oculto');
            document.getElementById('edit-movil-numero').value = movil.numero;
            document.getElementById('edit-movil-marca').value = movil.marca;
            document.getElementById('edit-movil-modelo').value = movil.modelo;
            document.getElementById('edit-movil-patente').value = movil.patente;
        } else {
            movilIDSeleccionado = null;
            formModMovilCampos.classList.add('oculto');
        }
    });
}

if (btnConfirmarModMovil) {
    btnConfirmarModMovil.addEventListener('click', () => {
        if (!movilIDSeleccionado) return;
        const datos = {
            id: movilIDSeleccionado,
            marca: document.getElementById('edit-movil-marca').value.trim(),
            modelo: document.getElementById('edit-movil-modelo').value.trim(),
            patente: document.getElementById('edit-movil-patente').value.trim()
        };
        fetch('../PHP/actualizar_movil.php', { method: 'POST', body: JSON.stringify(datos), headers: { 'Content-Type': 'application/json' }})
        .then(res => res.json()).then(data => {
            if (data.success) { alert("Móvil actualizado"); cargarDatosDesdeServidor(); cerrarModal(); }
        });
    });
}

if (btnBorrarMovilDB) {
    btnBorrarMovilDB.addEventListener('click', () => {
        if (!movilIDSeleccionado) return;
        if (confirm("¿Borrar definitivamente este móvil?")) {
            fetch('../PHP/borrar_movil.php', { method: 'POST', body: JSON.stringify({ id: movilIDSeleccionado }), headers: { 'Content-Type': 'application/json' }})
            .then(res => res.json()).then(data => {
                if(data.success) { alert("Móvil eliminado"); cargarDatosDesdeServidor(); cerrarModal(); }
            });
        }
    });
}

// ==========================================
// 6. EXPORTACIÓN DE DATOS
// ==========================================
if (btnExportar) {
    btnExportar.addEventListener('click', () => {
        let csvContent = "\uFEFF--- DATOS DE CHOFERES ---\nNombre;Dirección;Teléfono;DNI;Licencia Desde;Licencia Hasta\n";
        choferesRegistrados.forEach(c => csvContent += `${c.nombre};${c.direccion};${c.telefono};${c.dni};${c.licencia_desde};${c.licencia_hasta}\n`);
        
        csvContent += "\n--- DATOS DE MÓVILES ---\nNúmero;Marca;Modelo;Patente\n";
        movilesRegistrados.forEach(m => csvContent += `${m.numero};${m.marca};${m.modelo};${m.patente}\n`);
        
        csvContent += "\n--- PLANILLA DE ASIGNACIÓN ACTUAL ---\nChofer;Móvil;Activo;Inicio;Fin\n";
        document.querySelectorAll('.fila:not(.fila-header)').forEach(f => {
            const ch = f.querySelector('.input-p-chofer')?.value || "";
            const mo = f.querySelector('.input-p-movil')?.value || "";
            if (ch || mo) {
                const act = f.querySelector('.input-p-activo')?.checked ? "Si" : "No";
                const ini = f.querySelector('.input-p-entrada')?.value || "";
                const fin = f.querySelector('.input-p-salida')?.value || "";
                csvContent += `${ch};${mo};${act};${ini};${fin}\n`;
            }
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
        link.download = "Informacion_Sistema_Limite.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}