<?php
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $chofer = mysqli_real_escape_string($conexion, $data['chofer']);
    $movil = mysqli_real_escape_string($conexion, $data['movil']);
    $fecha = $data['fecha'];
    $hora = $data['hora'];
    $tipo = $data['tipo']; // 'entrada' o 'salida'

    if ($tipo === 'entrada') {
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada) 
                  VALUES ('$chofer', '$movil', '$fecha', '$hora') 
                  ON DUPLICATE KEY UPDATE entrada = '$hora', movil_numero = '$movil'";
    } else {
        $query = "UPDATE horarios SET salida = '$hora' 
                  WHERE chofer_nombre = '$chofer' AND fecha = '$fecha'";
    }

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>