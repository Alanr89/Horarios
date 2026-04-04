<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    $id = (int)$data['id'];
    
    // 1. Obtener los datos del chofer antes de borrarlo
    $queryChofer = "SELECT * FROM choferes WHERE id = $id";
    $resChofer = mysqli_query($conexion, $queryChofer);
    
    if ($resChofer && $rowChofer = mysqli_fetch_assoc($resChofer)) {
        try {
            // Se agregan validaciones (?? '') para evitar errores de tipo si los valores vienen nulos
            $nombre = mysqli_real_escape_string($conexion, $rowChofer['nombre'] ?? '');
            $direccion = mysqli_real_escape_string($conexion, $rowChofer['direccion'] ?? '');
            $telefono = mysqli_real_escape_string($conexion, $rowChofer['telefono'] ?? '');
            $dni = mysqli_real_escape_string($conexion, $rowChofer['dni'] ?? '');
            
            // Validar que las fechas no estén vacías para evitar errores en Strict Mode de MySQL
            $licencia_desde = !empty($rowChofer['licencia_desde']) ? "'" . mysqli_real_escape_string($conexion, $rowChofer['licencia_desde']) . "'" : "NULL";
            $licencia_hasta = !empty($rowChofer['licencia_hasta']) ? "'" . mysqli_real_escape_string($conexion, $rowChofer['licencia_hasta']) . "'" : "NULL";

            // 2. Obtener su historial de horarios
            $historial = [];
            $queryHorarios = "SELECT fecha, entrada, salida, movil_numero FROM horarios WHERE chofer_nombre = '$nombre'";
            $resHorarios = mysqli_query($conexion, $queryHorarios);
            if ($resHorarios) {
                while ($rowH = mysqli_fetch_assoc($resHorarios)) {
                    $historial[] = $rowH;
                }
            }
            $historial_json = mysqli_real_escape_string($conexion, json_encode($historial));

            // 3. Insertar en la tabla choferes_borrados
            $queryInsert = "INSERT INTO choferes_borrados (nombre, direccion, telefono, dni, licencia_desde, licencia_hasta, historial_horarios, fecha_borrado) 
                            VALUES ('$nombre', '$direccion', '$telefono', '$dni', $licencia_desde, $licencia_hasta, '$historial_json', NOW())";
            mysqli_query($conexion, $queryInsert);
        } catch (Throwable $e) {
            // Si hay algún error al crear el historial, el código simplemente ignora el fallo 
            // y continúa con la tarea principal que es borrar al chofer en las líneas siguientes.
        }
    }

    $query = "DELETE FROM choferes WHERE id = $id";

    if (mysqli_query($conexion, $query)) {
        if (mysqli_affected_rows($conexion) > 0) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No se encontró el chofer con el ID proporcionado o ya fue eliminado.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'ID no proporcionado']);
}
?>