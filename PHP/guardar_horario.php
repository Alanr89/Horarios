<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $chofer = mysqli_real_escape_string($conexion, $data['chofer']);
    $movil = mysqli_real_escape_string($conexion, $data['movil']);
    $fecha = mysqli_real_escape_string($conexion, $data['fecha']);
    $hora = mysqli_real_escape_string($conexion, $data['hora']);
    $tipo = $data['tipo']; // 'entrada' o 'salida'

    $columna = ($tipo === 'entrada') ? 'entrada' : 'salida';

    // Intentar actualizar si ya existe el registro para ese chofer y fecha, sino insertar
    $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, $columna) 
              VALUES ('$chofer', '$movil', '$fecha', '$hora')
              ON DUPLICATE KEY UPDATE $columna = '$hora', movil_numero = '$movil'";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>