<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data && isset($data['id'])) {
    $id = (int)$data['id'];
    $marca = isset($data['marca']) ? mysqli_real_escape_string($conexion, $data['marca']) : '';
    $modelo = isset($data['modelo']) ? mysqli_real_escape_string($conexion, $data['modelo']) : '';
    $patente = isset($data['patente']) ? mysqli_real_escape_string($conexion, $data['patente']) : '';

    $query = "UPDATE moviles SET 
              marca='$marca', modelo='$modelo', patente='$patente'
              WHERE id=$id";

    if (mysqli_query($conexion, $query)) {
        mysqli_commit($conexion); // Forzar la confirmación de la transacción
        echo json_encode(['success' => true]);
        exit;
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'ID de móvil no proporcionado o datos inválidos.']);
    exit;
}
?>