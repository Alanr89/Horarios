<?php
// Se suprime cualquier posible salida de error de PHP para garantizar una respuesta JSON limpia.
error_reporting(0);
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    $id = (int)$data['id'];

    mysqli_begin_transaction($conexion);

    try {
        // 1. Obtener el nombre del chofer antes de borrar la fila
        $query_get_chofer = "SELECT chofer_nombre FROM horarios WHERE id = $id";
        $result = mysqli_query($conexion, $query_get_chofer);

        $chofer_nombre = null;
        if ($result && mysqli_num_rows($result) > 0) {
            $chofer_data = mysqli_fetch_assoc($result);
            $chofer_nombre = $chofer_data['chofer_nombre'];
        }

        // 2. Borrar la fila de la planilla
        $query_delete_horario = "DELETE FROM horarios WHERE id = $id";
        mysqli_query($conexion, $query_delete_horario);

        // 3. Desactivar al chofer en la tabla de choferes
        if (!empty($chofer_nombre)) {
            $escaped_chofer_nombre = mysqli_real_escape_string($conexion, $chofer_nombre);
            $query_deactivate_chofer = "UPDATE choferes SET activo = 0 WHERE nombre = '$escaped_chofer_nombre'";
            mysqli_query($conexion, $query_deactivate_chofer);
        }

        mysqli_commit($conexion);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        mysqli_rollback($conexion);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>