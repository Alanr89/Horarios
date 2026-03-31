<?php
// Se suprime cualquier posible salida de error de PHP para garantizar una respuesta JSON limpia.
error_reporting(0);
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    $id = (int)$data['id'];
    
    // Implementación de Baja Lógica (Soft Delete)
    $query = "UPDATE choferes SET activo = 0 WHERE id = $id";

    if (mysqli_query($conexion, $query)) {
        // Si la consulta se ejecuta sin error, consideramos la operación un éxito.
        // El chofer ahora está garantizado como inactivo.
        mysqli_commit($conexion); // Forzar la confirmación de la transacción
        echo json_encode(['success' => true]);
        exit;
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'ID no proporcionado']);
    exit;
}
?>