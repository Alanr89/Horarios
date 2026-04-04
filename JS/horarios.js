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
let turnosEnCurso = JSON.parse(localStorage.getItem('turnosEnCurso')) || [];

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
        const ahora = new Date();
        const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
        buscadorFecha.value = hoy;
        buscadorFecha.addEventListener('change', cargarTablaHorarios);
        buscadorFecha.addEventListener('click', function() {
            if (this.showPicker) this.showPicker();
        });
        cargarTablaHorarios(); // Initial load
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
                seleccionados.includes(h.chofer) &&
                ((typeof h.entrada === 'string' && h.entrada.length > 5) || (typeof h.salida === 'string' && h.salida.length > 5))
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
                csvContent += `Chofer;Móvil;Entrada;Salida;Horas Trabajadas\n`;
                agrupadosPorFecha[fecha].forEach(reg => {
                    const ent = (reg.entrada && reg.entrada !== '--:--' && reg.entrada !== '00:00' && reg.entrada !== '00:00:00') ? reg.entrada : "NULL";
                    const sal = (reg.salida && reg.salida !== '--:--' && reg.salida !== '00:00' && reg.salida !== '00:00:00') ? reg.salida : "NULL";
                    const horas = calcularHorasTrabajadas(ent, sal);
                    csvContent += `${reg.chofer};${reg.movil};${ent};${sal};${horas}\n`;
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

    // Asegurar que exista el título "Planilla de Horarios" arriba de la tabla
    if (!document.getElementById('titulo-planilla-horarios')) {
        const titulo = document.createElement('h2');
        titulo.id = 'titulo-planilla-horarios';
        titulo.className = 'titulo-planilla';
        titulo.textContent = 'Planilla de Horarios';
        
        const contenedorTabla = tablaHorariosBody.closest('.tabla-choferes') || tablaHorariosBody.parentElement;
        if (contenedorTabla && contenedorTabla.parentNode) {
            contenedorTabla.parentNode.insertBefore(titulo, contenedorTabla);
        }
    }

    const fechaSeleccionada = buscadorFecha.value;
    const filas = tablaHorariosBody.querySelectorAll('.fila:not(.fila-header)');
    filas.forEach(f => f.remove());

    if (!fechaSeleccionada) return;

    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    const esPasado = fechaSeleccionada < hoy;

    // Obtener todas las asignaciones tildadas como activas para la fecha
    // Se filtran solo los registros base
    const asignacionesActivas = horariosRegistrados.filter(h => 
        h.activo == 1 && 
        h.fecha === fechaSeleccionada &&
        !(typeof h.entrada === 'string' && (h.entrada.length > 5 || h.entrada.includes('/'))) &&
        !(typeof h.salida === 'string' && (h.salida.length > 5 || h.salida.includes('/')))
    );
    
    // Evitar duplicados si un chofer se cargó dos veces por accidente en la planilla
    const choferesUnicos = [];
    const asignacionesUnicas = [];
    asignacionesActivas.forEach(a => {
        if (!choferesUnicos.includes(a.chofer)) {
            choferesUnicos.push(a.chofer);
            asignacionesUnicas.push(a);
        }
    });

    asignacionesUnicas.forEach(asignacion => {
        const nombreChofer = asignacion.chofer;
        const movilAsignado = asignacion.movil || '';
        
        // Buscar si el chofer ya tiene un turno en curso guardado localmente para que sobreviva al F5
        const turnoPendiente = turnosEnCurso.find(t => t.chofer === nombreChofer && t.fecha === fechaSeleccionada);

        const nuevaFila = document.createElement('div');
        nuevaFila.classList.add('fila');
        
        // Recuperar la hora si existe en la BD, si no, dejarlos vacíos
        const entradaHora = (turnoPendiente && turnoPendiente.entrada) ? turnoPendiente.entrada : '--:--';
        const salidaHora = (turnoPendiente && turnoPendiente.salida) ? turnoPendiente.salida : '--:--';
        
        const entradaDisabled = (entradaHora !== '--:--') ? 'disabled' : '';
        const salidaDisabled = (entradaHora === '--:--' || salidaHora !== '--:--') ? 'disabled' : '';

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
}

// Registro de Horarios (Entrada/Salida)
function registrarEvento(boton, tipo) {
    const fila = boton.closest('.fila');
    const nombreChofer = fila.querySelector('.columna-nombre p').textContent;
    const nroMovil = fila.querySelector('.input-movil-asignado').value.trim();
    const fechaSeleccionada = buscadorFecha.value;
    const ahora = new Date();
    
    const dia = ahora.getDate().toString().padStart(2, '0');
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const anio = ahora.getFullYear();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const segundos = ahora.getSeconds().toString().padStart(2, '0');
    const timestampCompleto = `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;

    let entrada = fila.querySelector('.hora-entrada').value;
    let salida = fila.querySelector('.hora-salida').value;

    let turnoPendiente = turnosEnCurso.find(t => t.chofer === nombreChofer && t.fecha === fechaSeleccionada);
    if (!turnoPendiente) {
        turnoPendiente = { chofer: nombreChofer, fecha: fechaSeleccionada, movil: nroMovil, entrada: '--:--', salida: '--:--' };
        turnosEnCurso.push(turnoPendiente);
    }

    if (tipo === 'entrada') {
        entrada = timestampCompleto;
        turnoPendiente.entrada = entrada;
        fila.querySelector('.hora-entrada').value = entrada;
        fila.querySelector('.btn-salida').disabled = false;
        boton.disabled = true;
    } else {
        salida = timestampCompleto;
        turnoPendiente.salida = salida;
        fila.querySelector('.hora-salida').value = salida;
        boton.disabled = true;
    }

    localStorage.setItem('turnosEnCurso', JSON.stringify(turnosEnCurso));
}

function terminarTurno(boton) {
    const fila = boton.closest('.fila');
    const nombreChofer = fila.querySelector('.columna-nombre p').textContent;
    const nroMovil = fila.querySelector('.input-movil-asignado').value.trim();
    const fechaSeleccionada = buscadorFecha.value;
    const entrada = fila.querySelector('.hora-entrada').value;
    const salida = fila.querySelector('.hora-salida').value;

    if (!entrada || entrada === '--:--' || entrada === 'NULL') {
        alert("Debe registrar la entrada antes de terminar el turno.");
        return;
    }
    if (!salida || salida === '--:--' || salida === 'NULL') {
        alert("Debe registrar la salida antes de terminar el turno.");
        return;
    }

    fetch('../PHP/guardar_horario.php', {
        method: 'POST',
        body: JSON.stringify({
            id: null,
            chofer: nombreChofer,
            movil: nroMovil,
            fecha: fechaSeleccionada,
            entrada: entrada,
            salida: salida,
            activo: 3 // 3 = Turno Finalizado. Evita rotundamente que Planilla Choferes lo absorba de vuelta.
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Turno guardado correctamente en la base de datos.");
            
            // Limpiar del LocalStorage
            turnosEnCurso = turnosEnCurso.filter(t => !(t.chofer === nombreChofer && t.fecha === fechaSeleccionada));
            localStorage.setItem('turnosEnCurso', JSON.stringify(turnosEnCurso));

            // Resetear los cuadros para un nuevo turno
            fila.querySelector('.hora-entrada').value = '--:--';
            fila.querySelector('.hora-salida').value = '--:--';
            fila.querySelector('.btn-entrada').disabled = false;
            fila.querySelector('.btn-salida').disabled = true;

            // Refrescar los datos de fondo para reportes
            cargarDatosDesdeServidor(); 
        } else {
            alert("Error al guardar horario: " + data.error);
        }
    })
    .catch(err => alert("Error de conexión al guardar el turno."));
}

// Utilidad para calcular las horas trabajadas en el reporte Excel
function calcularHorasTrabajadas(entradaStr, salidaStr) {
    if (!entradaStr || !salidaStr || entradaStr === 'NULL' || salidaStr === 'NULL' || !entradaStr.includes('/') || !salidaStr.includes('/')) {
        return "0";
    }
    
    const parseFecha = (str) => {
        const partes = str.split(' ');
        if (partes.length !== 2) return null;
        const [dia, mes, anio] = partes[0].split('/');
        const hora = partes[1];
        return new Date(`${anio}-${mes}-${dia}T${hora}`);
    };

    const fEntrada = parseFecha(entradaStr);
    const fSalida = parseFecha(salidaStr);
    
    if (!fEntrada || !fSalida || isNaN(fEntrada) || isNaN(fSalida)) return "0";
    
    const diffMs = fSalida - fEntrada;
    if (diffMs <= 0) return "0";
    
    let horas = (diffMs / (1000 * 60 * 60)).toFixed(2);
    if (horas.endsWith('.00')) horas = horas.replace('.00', '');
    return horas;
}