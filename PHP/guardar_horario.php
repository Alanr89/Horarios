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

    if ($id) {
        // Si el registro ya existe, lo actualizamos (ej: para cerrar el turno)
        $query = "UPDATE horarios SET entrada = '$entrada', salida = '$salida', movil_numero = '$movil' WHERE id = $id";
    } else {
        // Si es un turno nuevo (o el primero del día), lo insertamos
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