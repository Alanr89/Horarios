<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $numero = mysqli_real_escape_string($conexion, $data['numero']);
    $marca = mysqli_real_escape_string($conexion, $data['marca']);
    $modelo = mysqli_real_escape_string($conexion, $data['modelo']);
    $patente = mysqli_real_escape_string($conexion, $data['patente']);

    $query = "INSERT INTO moviles (numero, marca, modelo, patente) 
              VALUES ('$numero', '$marca', '$modelo', '$patente')";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No hay datos']);
}
?>