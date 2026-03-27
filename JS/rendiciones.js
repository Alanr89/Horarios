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

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar fecha
    if (fechaRendicion) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaRendicion.value = hoy;
        fechaRendicion.addEventListener('change', cargarTablaRendiciones);
        cargarTablaRendiciones();
    }

    // Abrir Modal
    if (btnNuevaRendicion) {
        btnNuevaRendicion.addEventListener('click', () => {
            document.getElementById('form-rendicion-real').reset();
            contenedorChoferRend.classList.add('oculto');
            document.getElementById('rendicion-fecha').value = new Date().toISOString().split('T')[0];
            modalRendicion.classList.remove('oculto');
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
                fecha: document.getElementById('rendicion-fecha').value,
                es_base: document.getElementById('rendicion-check-base').checked ? 1 : 0,
                es_chofer: document.getElementById('rendicion-check-chofer').checked ? 1 : 0,
                chofer_nombre: document.getElementById('rendicion-chofer-nombre').value.trim(),
                motivo: document.getElementById('rendicion-motivo').value.trim(),
                patente_caso: document.getElementById('rendicion-patente').value.trim(),
                tipo_entrada: document.getElementById('rendicion-tipo-entrada').checked ? 1 : 0,
                tipo_salida: document.getElementById('rendicion-tipo-salida').checked ? 1 : 0,
                operador: document.getElementById('rendicion-operador').value.trim(),
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
                }
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

            let csv = "\uFEFFFecha;Origen;Motivo;Patente;Tipo;Operador;Adelanto;Retiro;Gastos;Rindió\n";
            filtradas.forEach(r => {
                let origen = (r.es_base == 1 ? "Base" : "") + (r.es_chofer == 1 ? " " + r.chofer_nombre : "");
                let tipo = (r.tipo_entrada == 1 ? "Entrada" : "") + (r.tipo_salida == 1 ? " Salida" : "");
                csv += `${r.fecha};${origen};${r.motivo};${r.patente_caso};${tipo};${r.operador};`;
                csv += `${r.marca_adelanto ? 'Si':'No'};${r.marca_retiro ? 'Si':'No'};${r.marca_gastos ? 'Si':'No'};${r.marca_rindio ? 'Si':'No'}\n`;
            });

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
        let origen = (r.es_base == 1 ? "Base" : "") + (r.es_chofer == 1 ? " / " + r.chofer_nombre : "");
        let tipo = (r.tipo_entrada == 1 ? "Entrada" : "") + (r.tipo_salida == 1 ? " Salida" : "");

        fila.innerHTML = `
            <p class="columna-fecha">${r.fecha}</p>
            <p class="columna-nombre">${origen}</p>
            <p class="columna-motivo">${r.motivo}</p>
            <p class="columna-patente">${r.patente_caso}</p>
            <p class="columna-tipo">${tipo}</p>
            <p class="columna-operador">${r.operador}</p>
            <div class="columna-acciones">
                <button class="btn-borrar" onclick="borrarRendicionDB(${r.id})">Borrar</button>
            </div>
        `;
        cuerpo.appendChild(fila);
    });
}

window.borrarRendicionDB = function(id) {
    if (!confirm("¿Borrar rendición?")) return;
    fetch('../PHP/borrar_rendicion.php', { method: 'POST', body: JSON.stringify({id}), headers: {'Content-Type': 'application/json'} })
    .then(() => location.reload());
};