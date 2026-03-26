<?php
include 'conexion.php';

// Recibir los datos JSON enviados por el fetch de JavaScript
$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $nombre = mysqli_real_escape_string($conexion, $data['nombre']);
    $direccion = mysqli_real_escape_string($conexion, $data['direccion']);
    $telefono = mysqli_real_escape_string($conexion, $data['telefono']);
    $dni = mysqli_real_escape_string($conexion, $data['dni']);
    $desde = $data['licenciaDesde'];
    $hasta = $data['licenciaHasta'];

    $query = "INSERT INTO choferes (nombre, direccion, telefono, dni, licencia_desde, licencia_hasta) 
              VALUES ('$nombre', '$direccion', '$telefono', '$dni', '$desde', '$hasta')";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>