let choferesRegistrados = [];
let horariosRegistrados = [];

const tablaHorariosBody = document.getElementById('tabla-horarios-body');
const buscadorFecha = document.getElementById('buscar-fecha');
const modalExportar = document.getElementById('modal-exportar');

function cargarDatosDesdeServidor() {
    fetch('../PHP/obtener_datos.php')
        .then(res => res.json())
        .then(data => {
            choferesRegistrados = data.choferes || [];
            horariosRegistrados = data.horarios || [];
            cargarTablaHorarios();
        });
}

function cargarTablaHorarios() {
    if (!tablaHorariosBody || !buscadorFecha) return;
    const fechaSel = buscadorFecha.value;
    const header = tablaHorariosBody.querySelector('.fila-header');
    tablaHorariosBody.innerHTML = '';
    tablaHorariosBody.appendChild(header);

    const hoy = new Date().toISOString().split('T')[0];
    const esPasado = fechaSel < hoy;

    // Filtrar choferes que están marcados como activos (activo == 1 en la tabla horarios)
    const activos = horariosRegistrados.filter(h => h.activo == 1 && h.fecha == fechaSel);

    activos.forEach(reg => {
        const fila = document.createElement('div');
        fila.classList.add('fila');
        if (reg.id) fila.dataset.id = reg.id;

        const ent = (reg.entrada && reg.entrada !== '--:--') ? reg.entrada : (esPasado ? 'NULL' : '--:--');
        const sal = (reg.salida && reg.salida !== '--:--') ? reg.salida : (esPasado ? 'NULL' : '--:--');

        fila.innerHTML = `
            <div class="columna-check"><input type="checkbox" class="row-checkbox" data-chofer="${reg.chofer}"></div>
            <div class="columna-nombre"><p class="texto-movil">${reg.chofer}</p></div>
            <div class="columna-movil"><input type="text" class="input-tabla input-movil-asignado" value="${reg.movil}" disabled></div>
            <div class="columna-entrada"><button class="btn-entrada" onclick="registrarEvento(this, 'entrada')" ${(ent !== '--:--' && ent !== 'NULL') ? 'disabled' : ''}>Entrada</button></div>
            <div class="columna-hora"><input type="text" class="input-tabla hora-entrada" value="${ent}" readonly style="${ent === 'NULL' ? 'color:red;font-weight:bold' : ''}"></div>
            <div class="columna-salida"><button class="btn-salida" onclick="registrarEvento(this, 'salida')" ${(sal !== '--:--' && sal !== 'NULL') ? 'disabled' : ''}>Salida</button></div>
            <div class="columna-hora"><input type="text" class="input-tabla hora-salida" value="${sal}" readonly style="${sal === 'NULL' ? 'color:red;font-weight:bold' : ''}"></div>
            <div class="columna-acciones"><button class="btn-terminar" onclick="terminarTurno(this)">Terminar Turno</button></div>
        `;
        tablaHorariosBody.appendChild(fila);
    });
}

window.registrarEvento = function(btn, tipo) {
    const fila = btn.closest('.fila');
    const ahora = new Date();
    const timestamp = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()}`;
    const input = tipo === 'entrada' ? fila.querySelector('.hora-entrada') : fila.querySelector('.hora-salida');
    input.value = timestamp;
    btn.disabled = true;
};

window.terminarTurno = function(btn) {
    const fila = btn.closest('.fila');
    const id = fila.dataset.id;
    const ent = fila.querySelector('.hora-entrada').value;
    const sal = fila.querySelector('.hora-salida').value;

    if (ent === '--:--' || sal === '--:--') return alert("Debe registrar entrada y salida");

    fetch('../PHP/guardar_horario.php', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            chofer: fila.querySelector('.texto-movil').textContent,
            movil: fila.querySelector('.input-movil-asignado').value,
            fecha: buscadorFecha.value,
            entrada: ent,
            salida: sal
        }),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then(data => {
        if (data.success) {
            alert("Turno terminado");
            fila.querySelector('.hora-entrada').value = '--:--';
            fila.querySelector('.hora-salida').value = '--:--';
            cargarDatosDesdeServidor();
        }
    });
};

document.getElementById('btn-exportar-horarios')?.addEventListener('click', () => {
    if (document.querySelectorAll('.row-checkbox:checked').length === 0) return alert("Elija por lo menos una opción");
    modalExportar.classList.remove('oculto');
});

document.getElementById('btn-cancelar-exportar')?.addEventListener('click', () => modalExportar.classList.add('oculto'));

document.getElementById('btn-confirmar-exportar')?.addEventListener('click', () => {
    const desde = document.getElementById('exportar-desde').value;
    const hasta = document.getElementById('exportar-hasta').value;
    const seleccionados = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => cb.dataset.chofer);

    const filtrados = horariosRegistrados.filter(h => h.fecha >= desde && h.fecha <= hasta && seleccionados.includes(h.chofer));
    
    let csv = "\uFEFFFecha;Chofer;Móvil;Entrada;Salida\n";
    filtrados.forEach(h => {
        const e = h.entrada || "NULL";
        const s = h.salida || "NULL";
        csv += `${h.fecha};${h.chofer};${h.movil};${e};${s}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Horarios_${desde}_${hasta}.csv`;
    link.click();
    modalExportar.classList.add('oculto');
});

if (buscadorFecha) {
    buscadorFecha.value = new Date().toISOString().split('T')[0];
    buscadorFecha.addEventListener('change', cargarTablaHorarios);
    buscadorFecha.addEventListener('click', function() { if(this.showPicker) this.showPicker(); });
}

document.addEventListener('DOMContentLoaded', cargarDatosDesdeServidor);