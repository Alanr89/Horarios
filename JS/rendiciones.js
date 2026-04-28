// Referencias específicas de Rendiciones
const btnNuevaRendicion = document.getElementById('btn-nueva-rendicion');
const modalRendicion = document.getElementById('modal-rendicion');
const btnGuardarRendicion = document.getElementById('btn-guardar-rendicion');
const btnCancelarRendicion = document.getElementById('btn-cancelar-rendicion');
const fechaRendicion = document.getElementById('fecha-rendicion');
const checkRendChofer = document.getElementById('rendicion-check-chofer');
const contenedorChoferRend = document.getElementById('contenedor-chofer-rendicion');

const btnExportarRend = document.getElementById('btn-exportar-rendiciones');
const modalExportRend = document.getElementById('modal-exportar-rendiciones');
const btnConfirmarExportRend = document.getElementById('btn-confirmar-export-rend');
const btnCancelarExportRend = document.getElementById('btn-cancelar-export-rend');

// Variables Globales
let rendicionesRegistradas = [];
let choferesRegistrados = [];
let rendicionIDEditando = null; // Variable para saber si guardamos una nueva o editamos

function cargarDatosDesdeServidor() {
    const url = `../PHP/obtener_datos.php?t=${new Date().getTime()}`;
    fetch(url, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            if (data) {
                rendicionesRegistradas = data.rendiciones || [];
                choferesRegistrados = data.choferes || [];
                cargarTablaRendiciones();
            }
        })
        .catch(err => console.error("Error al cargar rendiciones:", err));
}

document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos reales desde PHP
    cargarDatosDesdeServidor();

    // Inicializar fecha
    if (fechaRendicion) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaRendicion.value = hoy;
        fechaRendicion.addEventListener('change', cargarTablaRendiciones);
    }

    // Abrir Modal
    if (btnNuevaRendicion) {
        btnNuevaRendicion.addEventListener('click', () => {
            // Protecciones para asegurar que el modal abra sin errores
            const form = document.getElementById('form-rendicion-real') || document.getElementById('form-rendicion');
            if (form) form.reset();
            rendicionIDEditando = null; // Limpiamos el ID porque es una rendición nueva
            
            document.getElementById('modal-rendicion-titulo').textContent = 'Nueva Rendición';
            document.getElementById('btn-guardar-rendicion').textContent = 'Guardar';
            
            if (contenedorChoferRend) contenedorChoferRend.classList.add('oculto');
            
            const inputFecha = document.getElementById('rendicion-fecha');
            if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];
            
            if (modalRendicion) modalRendicion.classList.remove('oculto');
        });
    }

    if (btnCancelarRendicion) btnCancelarRendicion.addEventListener('click', () => modalRendicion.classList.add('oculto'));

    if (checkRendChofer) {
        checkRendChofer.addEventListener('change', () => {
            checkRendChofer.checked ? contenedorChoferRend.classList.remove('oculto') : contenedorChoferRend.classList.add('oculto');
        });
    }

    if (btnGuardarRendicion) {
        btnGuardarRendicion.addEventListener('click', () => {
            const datos = {
                id: rendicionIDEditando, // Si es nulo, PHP crea uno nuevo. Si tiene valor, PHP actualiza.
                fecha: document.getElementById('rendicion-fecha').value,
                es_base: document.getElementById('rendicion-check-base').checked ? 1 : 0,
                es_chofer: document.getElementById('rendicion-check-chofer').checked ? 1 : 0,
                chofer_nombre: document.getElementById('rendicion-chofer-nombre').value.trim(),
                motivo: document.getElementById('rendicion-motivo').value.trim(),
                patente_caso: document.getElementById('rendicion-patente').value.trim(),
                tipo_entrada: document.getElementById('rendicion-tipo-entrada').checked ? 1 : 0,
                tipo_salida: document.getElementById('rendicion-tipo-salida').checked ? 1 : 0,
                operador: document.getElementById('rendicion-operador').value.trim(),
                monto: parseFloat(document.getElementById('rendicion-monto')?.value) || 0, // Capturamos el monto
                marca_adelanto: document.getElementById('rendicion-marca-adelanto').checked ? 1 : 0,
                marca_retiro: document.getElementById('rendicion-marca-retiro').checked ? 1 : 0,
                marca_gastos: document.getElementById('rendicion-marca-gastos').checked ? 1 : 0,
                marca_rindio: document.getElementById('rendicion-marca-rindio').checked ? 1 : 0
            };

            fetch('../PHP/guardar_rendicion.php', {
                method: 'POST',
                body: JSON.stringify(datos),
                headers: { 'Content-Type': 'application/json' }
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    alert("Rendición guardada.");
                    modalRendicion.classList.add('oculto');
                    location.reload(); // Recarga para actualizar lista
                } else {
                    alert("Error al guardar: " + (data.error || "Desconocido"));
                }
            })
            .catch(err => {
                alert("Error de conexión al guardar la rendición.");
            });
        });
    }

    // Exportación
    if (btnExportarRend) btnExportarRend.addEventListener('click', () => modalExportRend.classList.remove('oculto'));
    if (btnCancelarExportRend) btnCancelarExportRend.addEventListener('click', () => modalExportRend.classList.add('oculto'));
    if (btnConfirmarExportRend) {
        btnConfirmarExportRend.addEventListener('click', () => {
            const desde = document.getElementById('rend-export-desde').value;
            const hasta = document.getElementById('rend-export-hasta').value;
            
            const filtradas = rendicionesRegistradas.filter(r => r.fecha >= desde && r.fecha <= hasta);
            if (filtradas.length === 0) { alert("No hay datos."); return; }

            let totalIngresos = 0;
            let totalEgresos = 0;

            let csv = "\uFEFFFecha;Origen;Motivo;Patente;Tipo;Operador;Adelanto;Retiro;Gastos;Rindió;Ingresos;Egresos\n";
            filtradas.forEach(r => {
                // Formateo limpio de Origen
                let arrOrigen = [];
                if (r.es_base == 1) arrOrigen.push("Base");
                if (r.es_chofer == 1 && r.chofer_nombre) arrOrigen.push(r.chofer_nombre);
                let origen = arrOrigen.join(" / ");
                
                // Formateo limpio de Tipo
                let tipo = (r.tipo_entrada == 1 && r.tipo_salida == 1) ? "Entrada - Salida" : (r.tipo_entrada == 1 ? "Entrada" : (r.tipo_salida == 1 ? "Salida" : ""));
                
                // Distribución Contable (Ingresos vs Egresos)
                let monto = parseFloat(r.monto) || 0;
                let ingreso = (r.marca_rindio == 1) ? monto : 0;
                let egreso = (r.marca_adelanto == 1 || r.marca_retiro == 1 || r.marca_gastos == 1) ? monto : 0;
                
                totalIngresos += ingreso;
                totalEgresos += egreso;

                csv += `${r.fecha};${origen};${r.motivo};${r.patente_caso};${tipo};${r.operador};`;
                csv += `${r.marca_adelanto ? 'Si':'No'};${r.marca_retiro ? 'Si':'No'};${r.marca_gastos ? 'Si':'No'};${r.marca_rindio ? 'Si':'No'};`;
                csv += `$${ingreso.toFixed(2)};$${egreso.toFixed(2)}\n`;
            });

            // Imprimir Subtotales y Total Neto al final del CSV
            csv += `\n;;;;;;;;;SUBTOTAL INGRESOS;$${totalIngresos.toFixed(2)};\n`;
            csv += `;;;;;;;;;SUBTOTAL EGRESOS;;$${totalEgresos.toFixed(2)}\n`;
            csv += `;;;;;;;;;TOTAL NETO;$${(totalIngresos - totalEgresos).toFixed(2)};\n`;

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Rendiciones_${desde}_a_${hasta}.csv`;
            link.click();
            modalExportRend.classList.add('oculto');
        });
    }
});

function cargarTablaRendiciones() {
    const cuerpo = document.getElementById('cuerpo-rendiciones');
    if (!cuerpo || !fechaRendicion) return;
    cuerpo.innerHTML = '';
    const fechaSel = fechaRendicion.value;
    const filtradas = rendicionesRegistradas.filter(r => r.fecha === fechaSel);

    filtradas.forEach(r => {
        const fila = document.createElement('div');
        fila.classList.add('fila');
        
        // Formateo limpio de Origen para la tabla
        let arrOrigen = [];
        if (r.es_base == 1) arrOrigen.push("Base");
        if (r.es_chofer == 1 && r.chofer_nombre) arrOrigen.push(r.chofer_nombre);
        let origen = arrOrigen.join(" / ");

        let tipo = (r.tipo_entrada == 1 && r.tipo_salida == 1) ? "Entrada - Salida" : (r.tipo_entrada == 1 ? "Entrada" : (r.tipo_salida == 1 ? "Salida" : ""));

        // Formatear Monto a Pesos Argentinos
        let montoFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(r.monto || 0);

        fila.innerHTML = `
            <p class="columna-fecha">${r.fecha}</p>
            <p class="columna-nombre">${origen}</p>
            <p class="columna-motivo">${r.motivo}</p>
            <p class="columna-patente">${r.patente_caso}</p>
            <p class="columna-tipo">${tipo}</p>
            <p class="columna-monto" style="font-weight: bold; color: #28a745;">${montoFormateado}</p>
            <p class="columna-operador">${r.operador}</p>
            <div class="columna-acciones">
                <button class="btn-editar" onclick="editarRendicion(${r.id})">Modificar</button>
                <button class="btn-borrar" onclick="borrarRendicionDB(${r.id})">Borrar</button>
            </div>
        `;
        cuerpo.appendChild(fila);
    });
}

// Función Global para cargar datos en el modal y editar
window.editarRendicion = function(id) {
    // Se utiliza == en vez de === porque el ID de la base de datos viene como Texto ("5") y el parámetro como Número (5)
    const r = rendicionesRegistradas.find(x => x.id == id);
    if (!r) return;

    rendicionIDEditando = id; // Guardamos el ID que estamos modificando
    document.getElementById('modal-rendicion-titulo').textContent = 'Modificar Rendición';
    document.getElementById('btn-guardar-rendicion').textContent = 'Guardar Cambios';
    
    document.getElementById('rendicion-fecha').value = r.fecha;
    document.getElementById('rendicion-check-base').checked = (r.es_base == 1);
    document.getElementById('rendicion-check-chofer').checked = (r.es_chofer == 1);
    document.getElementById('rendicion-chofer-nombre').value = r.chofer_nombre || '';
    document.getElementById('rendicion-motivo').value = r.motivo || '';
    document.getElementById('rendicion-patente').value = r.patente_caso || '';
    document.getElementById('rendicion-tipo-entrada').checked = (r.tipo_entrada == 1);
    document.getElementById('rendicion-tipo-salida').checked = (r.tipo_salida == 1);
    
    const inputMonto = document.getElementById('rendicion-monto');
    if(inputMonto) inputMonto.value = r.monto || '';
    
    document.getElementById('rendicion-operador').value = r.operador || '';
    document.getElementById('rendicion-marca-adelanto').checked = (r.marca_adelanto == 1);
    document.getElementById('rendicion-marca-retiro').checked = (r.marca_retiro == 1);
    document.getElementById('rendicion-marca-gastos').checked = (r.marca_gastos == 1);
    document.getElementById('rendicion-marca-rindio').checked = (r.marca_rindio == 1);

    if (contenedorChoferRend) {
        r.es_chofer == 1 ? contenedorChoferRend.classList.remove('oculto') : contenedorChoferRend.classList.add('oculto');
    }

    if (modalRendicion) modalRendicion.classList.remove('oculto');
};

window.borrarRendicionDB = function(id) {
    if (!confirm("¿Borrar rendición?")) return;
    fetch('../PHP/borrar_rendicion.php', { method: 'POST', body: JSON.stringify({id}), headers: {'Content-Type': 'application/json'} })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            location.reload();
        } else {
            alert("Error al borrar: " + data.error);
        }
    })
    .catch(err => alert("Error de conexión al borrar la rendición."));
};