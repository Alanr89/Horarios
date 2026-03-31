<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    $id = (int)$data['id'];
    
    // Implementación de Baja Lógica (Soft Delete)
    $query = "UPDATE choferes SET activo = 0 WHERE id = $id";

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