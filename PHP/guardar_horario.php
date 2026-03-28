<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $id = !empty($data['id']) ? (int)$data['id'] : null;
    $chofer = mysqli_real_escape_string($conexion, $data['chofer']);
    $movil = mysqli_real_escape_string($conexion, $data['movil']);
    $fecha = mysqli_real_escape_string($conexion, $data['fecha']);

    $entrada = (!empty($data['entrada']) && $data['entrada'] !== '--:--') ? "'" . mysqli_real_escape_string($conexion, $data['entrada']) . "'" : "NULL";
    $salida = (!empty($data['salida']) && $data['salida'] !== '--:--') ? "'" . mysqli_real_escape_string($conexion, $data['salida']) . "'" : "NULL";

    if ($id) {
        $query = "UPDATE horarios SET movil_numero='$movil', entrada=$entrada, salida=$salida WHERE id=$id";
    } else {
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada, salida) 
                  VALUES ('$chofer', '$movil', '$fecha', $entrada, $salida)";
    }

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>