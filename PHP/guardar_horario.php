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

<<<<<<< HEAD
    $columna = ($tipo === 'entrada') ? 'entrada' : 'salida';

    // Intentar actualizar si ya existe el registro para ese chofer y fecha, sino insertar
    $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, $columna) 
              VALUES ('$chofer', '$movil', '$fecha', '$hora')
              ON DUPLICATE KEY UPDATE $columna = '$hora', movil_numero = '$movil'";
=======
    // Si recibimos un ID, es una actualización (ej: cerrar un turno nocturno abierto ayer)
    // Si no, es un turno nuevo que se está guardando completo
    if ($id && $id !== 'null') {
        $query = "UPDATE horarios SET entrada = '$entrada', salida = '$salida', movil_numero = '$movil', fecha = '$fecha' WHERE id = $id";
    } else {
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada, salida) 
                  VALUES ('$chofer', '$movil', '$fecha', '$entrada', '$salida')";
    }
>>>>>>> 00f5f0b228d3589ee55f4f2d13993b97064abbd1

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>