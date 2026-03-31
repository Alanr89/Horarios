<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $id = !empty($data['id']) ? (int)$data['id'] : null;
    $chofer = mysqli_real_escape_string($conexion, $data['chofer']);
    
    // Se corrige para evitar fallos de Strict Mode en MySQL si el móvil o los tiempos están vacíos
    $movil = !empty($data['movil']) ? "'" . mysqli_real_escape_string($conexion, $data['movil']) . "'" : "NULL";
    $entrada = (!empty($data['entrada']) && $data['entrada'] !== '--:--') ? "'" . mysqli_real_escape_string($conexion, $data['entrada']) . "'" : "NULL";
    $salida = (!empty($data['salida']) && $data['salida'] !== '--:--') ? "'" . mysqli_real_escape_string($conexion, $data['salida']) . "'" : "NULL";
    $activo = isset($data['activo']) ? (int)$data['activo'] : 0;
    $fecha = !empty($data['fecha']) ? mysqli_real_escape_string($conexion, $data['fecha']) : date('Y-m-d'); 

    if ($id) {
        $query = "UPDATE horarios SET chofer_nombre='$chofer', movil_numero=$movil, entrada=$entrada, salida=$salida, activo=$activo, fecha='$fecha' WHERE id=$id";
    } else {
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada, salida, activo)
                  VALUES ('$chofer', $movil, '$fecha', $entrada, $salida, $activo)";
    }

    // Iniciar transacción
    mysqli_begin_transaction($conexion);

    try {
        if (mysqli_query($conexion, $query)) { // Guardar o actualizar el horario
            $new_id = $id ? $id : mysqli_insert_id($conexion);

            // Si se desactiva la asignación, también se desactiva al chofer globalmente
            if ($activo == 0 && !empty($chofer)) {
                $query_desactivar_chofer = "UPDATE choferes SET activo = 0 WHERE nombre = '$chofer'";
                mysqli_query($conexion, $query_desactivar_chofer);
            }

            mysqli_commit($conexion); // Confirmar transacción
            echo json_encode(['success' => true, 'new_id' => $new_id]);
        } else {
            mysqli_rollback($conexion); // Revertir en caso de error
            echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        }
    } catch (Exception $e) {
        mysqli_rollback($conexion);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
}
?>