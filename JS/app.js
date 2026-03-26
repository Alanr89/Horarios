// Referencias a los botones y las listas
const btnChofer = document.getElementById('btn-agregar-chofer');
const btnMovil = document.getElementById('btn-agregar-movil');
const listaChoferes = document.getElementById('lista-choferes');
const listaMoviles = document.getElementById('lista-moviles');
const btnExportar = document.getElementById('btn-exportar');
const btnExportarHorarios = document.getElementById('btn-exportar-horarios');
const buscadorFecha = document.getElementById('buscar-fecha');

// Referencias al Modal
const modal = document.getElementById('modal-contenedor');
const modalTitulo = document.getElementById('modal-titulo');
const btnConfirmar = document.getElementById('btn-modal-confirmar');
const btnCancelar = document.getElementById('btn-modal-cancelar');

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

function abrirModal(titulo, listaDestino, tipo) {
    modalTitulo.textContent = titulo;
    listaDestinoActual = listaDestino;
    tipoActual = tipo;

    // Reset de formularios
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

// Función para cargar la tabla de horarios según la fecha seleccionada
function cargarTablaHorarios() {
    if (!tablaHorariosBody) return;

    const fechaSeleccionada = buscadorFecha.value;
    // Limpiar filas actuales (manteniendo el header)
    const filas = tablaHorariosBody.querySelectorAll('.fila:not(.fila-header)');
    filas.forEach(f => f.remove());

    if (!fechaSeleccionada) return;

    movilesRegistrados.forEach(movil => {
        const registro = horariosRegistrados.find(h => h.movil === movil.numero && h.fecha === fechaSeleccionada);
        
        const nuevaFila = document.createElement('div');
        nuevaFila.classList.add('fila');
        
        const entradaHora = registro ? registro.entrada : '--:--';
        const salidaHora = registro ? registro.salida : '--:--';
        const entradaDisabled = (entradaHora !== '--:--') ? 'disabled' : '';
        const salidaDisabled = (salidaHora !== '--:--') ? 'disabled' : '';

        nuevaFila.innerHTML = `
            <div class="columna-check">
                <input type="checkbox" class="row-checkbox" data-movil="${movil.numero}">
            </div>
            <div class="columna-movil">
                <p class="texto-movil">${movil.numero}</p>
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

// Registro de Horarios (Entrada/Salida)
function registrarEvento(boton, tipo) {
    const fila = boton.closest('.fila');
    const nroMovil = fila.querySelector('.texto-movil').textContent;
    const fechaSeleccionada = buscadorFecha.value;
    const ahora = new Date();
    const horaActual = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let registro = horariosRegistrados.find(h => h.movil === nroMovil && h.fecha === fechaSeleccionada);

    if (!registro) {
        registro = { movil: nroMovil, fecha: fechaSeleccionada, entrada: '--:--', salida: '--:--' };
        horariosRegistrados.push(registro);
    }

    if (tipo === 'entrada') {
        registro.entrada = horaActual;
        fila.querySelector('.hora-entrada').value = horaActual;
    } else {
        registro.salida = horaActual;
        fila.querySelector('.hora-salida').value = horaActual;
    }

    boton.disabled = true; // Bloquear el botón para que no se pueda borrar/re-escribir
    localStorage.setItem('horarios', JSON.stringify(horariosRegistrados));
}

btnCancelar.addEventListener('click', cerrarModal);

btnConfirmar.addEventListener('click', () => {
    if (tipoActual === 'chofer') {
        const datos = {
            nombre: document.getElementById('chofer-nombre').value.trim(),
            direccion: document.getElementById('chofer-direccion').value.trim(),
            telefono: document.getElementById('chofer-telefono').value.trim(),
            dni: document.getElementById('chofer-dni').value.trim(),
            licenciaDesde: document.getElementById('chofer-licencia-desde').value,
            licenciaHasta: document.getElementById('chofer-licencia-hasta').value
        };

        if (datos.nombre !== "") {
            // Enviar a PHP
            fetch('../php/guardar_chofer.php', {
                method: 'POST',
                body: JSON.stringify(datos),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    choferesRegistrados.push(datos);
                    const option = document.createElement('option');
                    option.value = datos.nombre;
                    listaChoferes.appendChild(option);
                    agregarFilaATabla("", datos.nombre);
                    cerrarModal();
                } else {
                    alert("Error al guardar en el servidor");
                }
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
            fetch('../php/guardar_movil.php', {
                method: 'POST',
                body: JSON.stringify(datos),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    movilesRegistrados.push(datos);
                    const option = document.createElement('option');
                    option.value = datos.numero;
                    listaMoviles.appendChild(option);
                    agregarFilaATabla(datos.numero, "");
                    cerrarModal();
                } else {
                    alert("Error al guardar el móvil en el servidor");
                }
            });
        } else {
            alert("El número de móvil es obligatorio");
        }
    }
});

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
        const seleccionados = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => cb.dataset.movil);

        if (!desde || !hasta || seleccionados.length === 0) {
            alert("Debe seleccionar fechas y al menos un móvil.");
            return;
        }

        // Filtrar datos
        const datosFiltrados = horariosRegistrados.filter(h => 
            h.fecha >= desde && 
            h.fecha <= hasta && 
            seleccionados.includes(h.movil)
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
            csvContent += `Móvil;Entrada;Salida\n`;
            agrupadosPorFecha[fecha].forEach(reg => {
                csvContent += `${reg.movil};${reg.entrada};${reg.salida}\n`;
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
