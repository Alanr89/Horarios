// Referencias específicas de Horarios
const btnExportarHorarios = document.getElementById('btn-exportar-horarios');
const buscadorFecha = document.getElementById('buscar-fecha');
const tablaHorariosBody = document.getElementById('tabla-horarios-body');

// Referencias al Modal de Exportación
const modalExportar = document.getElementById('modal-exportar');
const fechaDesdeExport = document.getElementById('exportar-desde');
const fechaHastaExport = document.getElementById('exportar-hasta');
const btnConfirmarExport = document.getElementById('btn-confirmar-exportar');
const btnCancelarExport = document.getElementById('btn-cancelar-exportar');

// Global data arrays (duplicated for simplicity in this modularization)
let choferesRegistrados = JSON.parse(localStorage.getItem('choferes')) || [];
let movilesRegistrados = JSON.parse(localStorage.getItem('moviles')) || [];
let horariosRegistrados = JSON.parse(localStorage.getItem('horarios')) || [];
let rendicionesRegistradas = JSON.parse(localStorage.getItem('rendiciones')) || [];

// Función para cargar datos desde MySQL al iniciar
function cargarDatosDesdeServidor() {
    const url = `../PHP/obtener_datos.php?t=${new Date().getTime()}`;
    fetch(url, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            if (data) {
                choferesRegistrados = data.choferes || [];
                movilesRegistrados = data.moviles || [];
                horariosRegistrados = data.horarios || [];
                rendicionesRegistradas = data.rendiciones || [];
                actualizarLocalStorage();
                actualizarDatalists();
                if (tablaHorariosBody) cargarTablaHorarios();
            }
        })
        .catch(err => console.log("Usando datos locales (Servidor no disponible)"));
}

function actualizarLocalStorage() {
    localStorage.setItem('choferes', JSON.stringify(choferesRegistrados));
    localStorage.setItem('moviles', JSON.stringify(movilesRegistrados));
    localStorage.setItem('horarios', JSON.stringify(horariosRegistrados));
    localStorage.setItem('rendiciones', JSON.stringify(rendicionesRegistradas || []));
}

function actualizarDatalists() {
    const dlChoferes = document.getElementById('lista-choferes-datalist');
    const dlMoviles = document.getElementById('lista-moviles-datalist');
    if(!dlChoferes || !dlMoviles) return;

    dlChoferes.innerHTML = choferesRegistrados.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    dlMoviles.innerHTML = movilesRegistrados.map(m => `<option value="${m.numero}">${m.numero}</option>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDesdeServidor();

    // Listener para el buscador de fecha
    if (buscadorFecha) {
        const hoy = new Date().toISOString().split('T')[0];
        buscadorFecha.value = hoy;
        buscadorFecha.addEventListener('change', cargarTablaHorarios);
        buscadorFecha.addEventListener('click', function() {
            if (this.showPicker) this.showPicker();
        });
        cargarTablaHorarios(); // Initial load
    }

    // Funcionalidad para el checkbox "seleccionar todo"
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const allRowCheckboxes = document.querySelectorAll('.row-checkbox');
            allRowCheckboxes.forEach(checkbox => checkbox.checked = isChecked);
        });
    }

    // Exportar Horarios
    if (btnExportarHorarios) {
        btnExportarHorarios.addEventListener('click', () => {
            const seleccionados = document.querySelectorAll('.row-checkbox:checked');
            if (seleccionados.length === 0) {
                alert("Elija por lo menos una opción (chofer) para exportar.");
                return;
            }
            if (modalExportar) modalExportar.classList.remove('oculto');
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

            const datosFiltrados = horariosRegistrados.filter(h => 
                h.fecha >= desde && 
                h.fecha <= hasta && 
                seleccionados.includes(h.chofer)
            );

            if (datosFiltrados.length === 0) {
                alert("No hay registros para los criterios seleccionados.");
                return;
            }

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
                    const ent = (reg.entrada && reg.entrada !== '--:--' && reg.entrada !== '00:00') ? reg.entrada : "NULL";
                    const sal = (reg.salida && reg.salida !== '--:--' && reg.salida !== '00:00') ? reg.salida : "NULL";
                    csvContent += `${reg.chofer};${reg.movil};${ent};${sal}\n`;
                });
                csvContent += `\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Reporte_Horarios_${desde}_a_${hasta}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            modalExportar.classList.add('oculto');
        });
    }
});

function cargarTablaHorarios() {
    if (!tablaHorariosBody) return;

    const fechaSeleccionada = buscadorFecha.value;
    const filas = tablaHorariosBody.querySelectorAll('.fila:not(.fila-header)');
    filas.forEach(f => f.remove());

    if (!fechaSeleccionada) return;

    const hoy = new Date().toISOString().split('T')[0];
    const esPasado = fechaSeleccionada < hoy;

    // Corrección: La lista de choferes a mostrar debe basarse en si el CHOFER está activo, no si su asignación de horario lo está.
    const choferesActivos = choferesRegistrados.filter(c => c.activo == 1).map(c => c.nombre);

    choferesActivos.forEach(nombreChofer => {
        // Se remueve "&& h.id" para recolectar todos los turnos del chofer
        let turnosEnDB = horariosRegistrados.filter(h => h.chofer === nombreChofer && h.fecha === fechaSeleccionada);
        const tieneTurnoAbierto = turnosEnDB.some(t => t.entrada !== '--:--' && (t.salida === '--:--'));
        let filasAMostrar = [...turnosEnDB];
        
        if (!tieneTurnoAbierto) {
            filasAMostrar.push({ id: null, chofer: nombreChofer, movil: '', entrada: '--:--', salida: '--:--' });
        }

        filasAMostrar.forEach((registro) => {
            const nuevaFila = document.createElement('div');
            nuevaFila.classList.add('fila');
            if (registro.id) nuevaFila.dataset.id = registro.id;
            
            const movilAsignado = registro.movil || '';
            const entradaHora = (registro.entrada && registro.entrada !== '--:--') ? registro.entrada : (esPasado ? 'NULL' : '--:--');
            const salidaHora = (registro.salida && registro.salida !== '--:--') ? registro.salida : (esPasado ? 'NULL' : '--:--');
            
            const entradaDisabled = (entradaHora !== '--:--' && entradaHora !== 'NULL') ? 'disabled' : '';
            const salidaDisabled = (entradaHora === '--:--' || entradaHora === 'NULL' || (salidaHora !== '--:--' && salidaHora !== 'NULL')) ? 'disabled' : '';

            nuevaFila.innerHTML = `
                <div class="columna-check">
                    <input type="checkbox" class="row-checkbox" data-chofer="${nombreChofer}">
                </div>
                <div class="columna-nombre">
                    <p class="texto-movil" style="font-size: 1.4rem;">${nombreChofer}</p>
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
                    <input type="text" class="input-tabla hora-entrada" value="${entradaHora}" style="font-size: 1.1rem; ${entradaHora === 'NULL' ? 'color: red; font-weight: bold;' : ''}" readonly>
                </div>
                <div class="columna-salida">
                    <button class="btn-salida" ${salidaDisabled} onclick="registrarEvento(this, 'salida')">Salida</button>
                </div>
                <div class="columna-hora">
                    <input type="text" class="input-tabla hora-salida" value="${salidaHora}" style="font-size: 1.1rem; ${salidaHora === 'NULL' ? 'color: red; font-weight: bold;' : ''}" readonly>
                </div>
                <div class="columna-acciones">
                    <button class="btn-terminar" onclick="terminarTurno(this)">Terminar Turno</button>
                </div>
            `;
            tablaHorariosBody.appendChild(nuevaFila);
        });
    });
}

// Registro de Horarios (Entrada/Salida)
function registrarEvento(boton, tipo) {
    const fila = boton.closest('.fila');
    const id = fila.dataset.id || null;
    const nombreChofer = fila.querySelector('.texto-movil').textContent;
    const nroMovil = fila.querySelector('.input-movil-asignado').value.trim();
    const fechaSeleccionada = buscadorFecha.value;
    const ahora = new Date();
    
    const dia = ahora.getDate().toString().padStart(2, '0');
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const anio = ahora.getFullYear();
    const tiempo = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timestampCompleto = `${dia}/${mes}/${anio} ${tiempo}`;

    if (!nroMovil) { alert("Debe asignar un número de móvil primero."); return; }

    // Diferenciamos los registros por su ID para permitir turnos múltiples en el mismo día
    let registro = id 
        ? horariosRegistrados.find(h => h.id == id) 
        : horariosRegistrados.find(h => h.chofer === nombreChofer && h.fecha === fechaSeleccionada && !h.id);

    if (!registro) {
        registro = { chofer: nombreChofer, movil: nroMovil, fecha: fechaSeleccionada, entrada: '--:--', salida: '--:--' };
        horariosRegistrados.push(registro);
    }

    if (tipo === 'entrada') {
        registro.entrada = timestampCompleto;
        fila.querySelector('.hora-entrada').value = timestampCompleto;
        fila.querySelector('.btn-salida').disabled = false;
    } else {
        registro.salida = timestampCompleto;
        fila.querySelector('.hora-salida').value = timestampCompleto;
    }

    actualizarLocalStorage();
    boton.disabled = true;
    fila.querySelector('.input-movil-asignado').disabled = true;
}

function terminarTurno(boton) {
    const fila = boton.closest('.fila');
    const id = fila.dataset.id || null;
    const nombreChofer = fila.querySelector('.columna-nombre p').textContent;
    const nroMovil = fila.querySelector('.input-movil-asignado').value.trim();
    const fechaSeleccionada = buscadorFecha.value;
    const entrada = fila.querySelector('.hora-entrada').value;
    const salida = fila.querySelector('.hora-salida').value;

    if (entrada === '--:--') {
        alert("Debe registrar la entrada antes de terminar el turno.");
        return;
    }
    if (salida === '--:--') {
        alert("Debe registrar la salida antes de terminar el turno.");
        return;
    }

    fetch('../PHP/guardar_horario.php', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            chofer: nombreChofer,
            movil: nroMovil,
            fecha: fechaSeleccionada,
            entrada: entrada,
            salida: salida
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Turno guardado correctamente en la base de datos.");
            // Se quita la manipulación manual del DOM, ya que la siguiente función recarga y redibuja toda la tabla.
            cargarDatosDesdeServidor(); 
        } else {
            alert("Error al guardar horario: " + data.error);
        }
    });
}