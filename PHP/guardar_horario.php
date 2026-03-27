<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $id = isset($data['id']) ? (int)$data['id'] : null;
    $chofer = mysqli_real_escape_string($conexion, $data['chofer']);
    $movil = mysqli_real_escape_string($conexion, $data['movil']);
    $fecha = mysqli_real_escape_string($conexion, $data['fecha']);
    $entrada = mysqli_real_escape_string($conexion, $data['entrada']);
    $salida = mysqli_real_escape_string($conexion, $data['salida']);

    // Si recibimos un ID, es una actualización (ej: cerrar un turno nocturno abierto ayer)
    // Si no, es un turno nuevo que se está guardando completo
    if ($id && $id !== 'null') {
        $query = "UPDATE horarios SET entrada = '$entrada', salida = '$salida', movil_numero = '$movil', fecha = '$fecha' WHERE id = $id";
    } else {
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada, salida) 
                  VALUES ('$chofer', '$movil', '$fecha', '$entrada', '$salida')";
    }

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>