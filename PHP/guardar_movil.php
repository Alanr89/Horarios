<?php
error_reporting(0);
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $numero = isset($data['numero']) ? mysqli_real_escape_string($conexion, $data['numero']) : '';
    $marca = isset($data['marca']) ? mysqli_real_escape_string($conexion, $data['marca']) : '';
    $modelo = isset($data['modelo']) ? mysqli_real_escape_string($conexion, $data['modelo']) : '';
    $patente = isset($data['patente']) ? mysqli_real_escape_string($conexion, $data['patente']) : '';

    // Forzamos el activo = 1
    $query = "INSERT INTO moviles (numero, marca, modelo, patente, activo) 
              VALUES ('$numero', '$marca', '$modelo', '$patente', 1)";

    if (mysqli_query($conexion, $query)) {
        mysqli_commit($conexion); // Forzar la confirmación de la transacción
        echo json_encode(['success' => true]);
        exit;
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No hay datos']);
    exit;
}
?>