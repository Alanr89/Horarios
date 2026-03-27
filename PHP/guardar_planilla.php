<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $id = isset($data['id']) ? (int)$data['id'] : null;
    $chofer = mysqli_real_escape_string($conexion, $data['chofer']);
    $movil = mysqli_real_escape_string($conexion, $data['movil']);
    $entrada = !empty($data['entrada']) ? "'" . mysqli_real_escape_string($conexion, $data['entrada']) . "'" : "NULL";
    $salida = !empty($data['salida']) ? "'" . mysqli_real_escape_string($conexion, $data['salida']) . "'" : "NULL";
    $activo = isset($data['activo']) ? (int)$data['activo'] : 0;
    $fecha = date('Y-m-d'); 

    if ($id) {
        $query = "UPDATE horarios SET chofer_nombre='$chofer', movil_numero='$movil', entrada=$entrada, salida=$salida, activo=$activo, fecha='$fecha' WHERE id=$id";
    } else {
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada, salida, activo)
                  VALUES ('$chofer', '$movil', '$fecha', $entrada, $salida, $activo)
                  ON DUPLICATE KEY UPDATE 
                  movil_numero=VALUES(movil_numero), 
                  entrada=VALUES(entrada), 
                  salida=VALUES(salida), 
                  activo=VALUES(activo)";
    }

    if (mysqli_query($conexion, $query)) {
        $new_id = $id ? $id : mysqli_insert_id($conexion);
        echo json_encode(['success' => true, 'new_id' => $new_id]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
}
?>