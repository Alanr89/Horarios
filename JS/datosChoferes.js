// Arreglos de datos
let choferesRegistrados = JSON.parse(localStorage.getItem('choferes')) || [];
let movilesRegistrados = JSON.parse(localStorage.getItem('moviles')) || [];
let horariosRegistrados = JSON.parse(localStorage.getItem('horarios')) || [];

// Referencias DOM
const listaCuerpo = document.getElementById('lista-cuerpo');
const btnChofer = document.getElementById('btn-agregar-chofer');
const btnMovil = document.getElementById('btn-agregar-movil');
const btnModificarChofer = document.getElementById('btn-modificar-chofer');
const btnModificarMovil = document.getElementById('btn-modificar-movil');

// Modales
const modalGral = document.getElementById('modal-contenedor');
const modalModChofer = document.getElementById('modal-modificar-chofer');
const modalModMovil = document.getElementById('modal-modificar-movil');

let tipoActual = '';
let editIndex = null;
let choferIDSeleccionado = null;

function cargarDatosDesdeServidor() {
    fetch('../PHP/obtener_datos.php')
        .then(res => res.json())
        .then(data => {
            choferesRegistrados = data.choferes || [];
            movilesRegistrados = data.moviles || [];
            horariosRegistrados = data.horarios || [];
            actualizarLocalStorage();
            actualizarDatalists();
            cargarTablaChoferes();
        })
        .catch(err => console.error("Error cargando datos:", err));
}

function actualizarLocalStorage() {
    localStorage.setItem('choferes', JSON.stringify(choferesRegistrados));
    localStorage.setItem('moviles', JSON.stringify(movilesRegistrados));
    localStorage.setItem('horarios', JSON.stringify(horariosRegistrados));
}

function actualizarDatalists() {
    const dlChoferes = document.getElementById('lista-choferes-datalist');
    const dlMoviles = document.getElementById('lista-moviles-datalist');
    const selectChofer = document.getElementById('select-chofer-edit');
    const selectMovil = document.getElementById('buscar-movil-edit');

    if (dlChoferes) dlChoferes.innerHTML = choferesRegistrados.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    if (dlMoviles) dlMoviles.innerHTML = movilesRegistrados.map(m => `<option value="${m.numero}">${m.numero}</option>`).join('');
    
    if (selectChofer) {
        selectChofer.innerHTML = '<option value="">-- Seleccione un chofer --</option>' + 
            choferesRegistrados.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
    if (selectMovil) {
        selectMovil.innerHTML = '<option value="">-- Seleccione un móvil --</option>' + 
            movilesRegistrados.map(m => `<option value="${m.numero}">${m.numero}</option>`).join('');
    }
}

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
    const cuerpo = document.getElementById('cuerpo-planilla');
    horariosRegistrados.forEach(reg => agregarFilaAsignacion(cuerpo, reg));
    const minFilas = 4;
    while (cuerpo.children.length < minFilas) {
        agregarFilaAsignacion(cuerpo);
    }
}

function agregarFilaAsignacion(contenedor, datos = null) {
    const fila = document.createElement('div');
    fila.classList.add('fila');
    if (datos && datos.id) fila.dataset.id = datos.id;

    const chofer = datos ? datos.chofer : '';
    const movil = datos ? datos.movil : '';
    const ent = (datos && datos.entrada && datos.entrada !== '--:--') ? datos.entrada : '';
    const sal = (datos && datos.salida && datos.salida !== '--:--') ? datos.salida : '';
    const activo = (datos && datos.activo == 1) ? 'checked' : '';

    fila.innerHTML = `
        <div class="columna-nombre" style="flex: 1.5; position: relative;">
            <input type="text" class="input-tabla input-p-chofer" list="lista-choferes-datalist" value="${chofer}" autocomplete="off" onfocus="if(this.showPicker) this.showPicker();" onclick="if(this.showPicker) this.showPicker();">
        </div>
        <div class="columna-movil" style="position: relative;">
            <input type="text" class="input-tabla input-p-movil" list="lista-moviles-datalist" value="${movil}" autocomplete="off" onfocus="if(this.showPicker) this.showPicker();" onclick="if(this.showPicker) this.showPicker();">
        </div>
        <div class="columna-activo"><input type="checkbox" class="input-p-activo" ${activo}></div>
        <div class="columna-horario">
            <input type="time" class="input-time input-p-entrada" value="${ent}"> <span>a</span> 
            <input type="time" class="input-time input-p-salida" value="${sal}">
        </div>
        <div class="columna-acciones">
            <button class="btn-guardar" onclick="guardarFilaManual(this)">Guardar</button>
            <button class="btn-borrar" onclick="eliminarFilaPlanilla(this)">Borrar</button>
        </div>
    `;
    contenedor.appendChild(fila);
}

window.guardarFilaManual = function(btn) {
    const fila = btn.closest('.fila');
    const id = fila.dataset.id || null;
    const chofer = fila.querySelector('.input-p-chofer').value.trim();
    const movil = fila.querySelector('.input-p-movil').value.trim();
    const ent = fila.querySelector('.input-p-entrada').value;
    const sal = fila.querySelector('.input-p-salida').value;
    const activo = fila.querySelector('.input-p-activo').checked ? 1 : 0;
    const fecha = new Date().toISOString().split('T')[0];

    if (!chofer) return alert("Ingrese el nombre del chofer");

    fetch('../PHP/guardar_planilla.php', {
        method: 'POST',
        body: JSON.stringify({ id, chofer, movil, entrada: ent, salida: sal, activo, fecha }),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            alert("Guardado correctamente");
            cargarDatosDesdeServidor();
        }
    });
};

window.eliminarFilaPlanilla = function(btn) {
    const fila = btn.closest('.fila');
    const id = fila.dataset.id;
    if (!id) return fila.remove();
    if (confirm("¿Eliminar permanentemente?")) {
        fetch('../PHP/borrar_fila_planilla.php', {
            method: 'POST',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
        }).then(() => cargarDatosDesdeServidor());
    }
};

// Eventos Modales
if (btnChofer) btnChofer.addEventListener('click', () => {
    tipoActual = 'chofer';
    document.getElementById('modal-titulo').textContent = "Agregar Chofer";
    document.getElementById('form-chofer').classList.remove('oculto');
    document.getElementById('form-movil').classList.add('oculto');
    modalGral.classList.remove('oculto');
});

if (btnMovil) btnMovil.addEventListener('click', () => {
    tipoActual = 'movil';
    document.getElementById('modal-titulo').textContent = "Agregar Móvil";
    document.getElementById('form-movil').classList.remove('oculto');
    document.getElementById('form-chofer').classList.add('oculto');
    modalGral.classList.remove('oculto');
});

document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => modalGral.classList.add('oculto'));

document.getElementById('btn-modal-confirmar')?.addEventListener('click', () => {
    if (tipoActual === 'chofer') {
        const datos = {
            nombre: document.getElementById('chofer-nombre').value.trim(),
            direccion: document.getElementById('chofer-direccion').value.trim(),
            telefono: `${document.getElementById('chofer-cod-area').value} ${document.getElementById('chofer-nro-tel').value}`.trim(),
            dni: document.getElementById('chofer-dni').value.trim(),
            licenciaDesde: document.getElementById('chofer-licencia-desde').value,
            licenciaHasta: document.getElementById('chofer-licencia-hasta').value
        };
        fetch('../PHP/guardar_chofer.php', {
            method: 'POST',
            body: JSON.stringify(datos),
            headers: { 'Content-Type': 'application/json' }
        }).then(() => { modalGral.classList.add('oculto'); cargarDatosDesdeServidor(); });
    } else {
        const datos = {
            numero: document.getElementById('movil-numero').value.trim(),
            marca: document.getElementById('movil-marca').value.trim(),
            modelo: document.getElementById('movil-modelo').value.trim(),
            patente: document.getElementById('movil-patente').value.trim()
        };
        fetch('../PHP/guardar_movil.php', {
            method: 'POST',
            body: JSON.stringify(datos),
            headers: { 'Content-Type': 'application/json' }
        }).then(() => { modalGral.classList.add('oculto'); cargarDatosDesdeServidor(); });
    }
});

if (btnModificarChofer) btnModificarChofer.addEventListener('click', () => {
    actualizarDatalists();
    modalModChofer.classList.remove('oculto');
});

document.getElementById('select-chofer-edit')?.addEventListener('change', (e) => {
    const chofer = choferesRegistrados.find(c => c.id == e.target.value);
    if (chofer) {
        choferIDSeleccionado = chofer.id;
        document.getElementById('form-modificar-chofer-campos').classList.remove('oculto');
        document.getElementById('edit-chofer-nombre').value = chofer.nombre;
        const tel = (chofer.telefono || "").split(" ");
        document.getElementById('edit-chofer-cod-area').value = tel[0] || "";
        document.getElementById('edit-chofer-nro-tel').value = tel[1] || "";
        document.getElementById('edit-chofer-dni').value = chofer.dni;
        document.getElementById('edit-chofer-licencia-desde').value = chofer.licencia_desde || "";
        document.getElementById('edit-chofer-licencia-hasta').value = chofer.licencia_hasta || "";
    }
});

document.getElementById('btn-confirmar-mod-chofer')?.addEventListener('click', () => {
    const datos = {
        id: choferIDSeleccionado,
        nombre: document.getElementById('edit-chofer-nombre').value.trim(),
        direccion: document.getElementById('edit-chofer-direccion').value.trim(),
        telefono: `${document.getElementById('edit-chofer-cod-area').value} ${document.getElementById('edit-chofer-nro-tel').value}`.trim(),
        dni: document.getElementById('edit-chofer-dni').value.trim(),
        licenciaDesde: document.getElementById('edit-chofer-licencia-desde').value,
        licenciaHasta: document.getElementById('edit-chofer-licencia-hasta').value
    };
    fetch('../PHP/actualizar_chofer.php', {
        method: 'POST',
        body: JSON.stringify(datos),
        headers: { 'Content-Type': 'application/json' }
    }).then(() => { modalModChofer.classList.add('oculto'); cargarDatosDesdeServidor(); });
});

document.getElementById('btn-cancelar-mod-chofer')?.addEventListener('click', () => modalModChofer.classList.add('oculto'));

document.getElementById('btn-borrar-chofer-db')?.addEventListener('click', () => {
    if (confirm("Usted desea borrar definitivamente")) {
        fetch('../PHP/borrar_chofer.php', {
            method: 'POST',
            body: JSON.stringify({ id: choferIDSeleccionado }),
            headers: { 'Content-Type': 'application/json' }
        }).then(() => { modalModChofer.classList.add('oculto'); cargarDatosDesdeServidor(); });
    }
});

document.getElementById('btn-nueva-fila')?.addEventListener('click', () => {
    const cuerpo = document.getElementById('cuerpo-planilla');
    if (cuerpo) agregarFilaAsignacion(cuerpo);
});

document.getElementById('btn-exportar')?.addEventListener('click', () => {
    let csv = "\uFEFFNombre;Dirección;Teléfono;DNI;Licencia Desde;Licencia Hasta\n";
    choferesRegistrados.forEach(c => csv += `${c.nombre};${c.direccion};${c.telefono};${c.dni};${c.licencia_desde};${c.licencia_hasta}\n`);
    
    const cuerpo = document.getElementById('cuerpo-planilla');
    if (cuerpo) {
        csv += "\nPLANILLA ACTUAL\nChofer;Móvil;Activo;Inicio;Fin\n";
        cuerpo.querySelectorAll('.fila').forEach(f => {
            const ch = f.querySelector('.input-p-chofer').value;
            const mv = f.querySelector('.input-p-movil').value;
            const ac = f.querySelector('.input-p-activo').checked ? "Si" : "No";
            const ini = f.querySelector('.input-p-entrada').value;
            const fin = f.querySelector('.input-p-salida').value;
            if (ch) csv += `${ch};${mv};${ac};${ini};${fin}\n`;
        });
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Sistema_Limite_Export.csv";
    link.click();
});

document.addEventListener('DOMContentLoaded', cargarDatosDesdeServidor);