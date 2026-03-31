<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data && isset($data['id'])) {
    $id = (int)$data['id'];
    $nombre = mysqli_real_escape_string($conexion, $data['nombre']);
    $direccion = mysqli_real_escape_string($conexion, $data['direccion']);
    $telefono = mysqli_real_escape_string($conexion, $data['telefono']);
    $dni = mysqli_real_escape_string($conexion, $data['dni']);
    $desde = $data['licenciaDesde'];
    $hasta = $data['licenciaHasta'];
    $activo = isset($data['activo']) ? (int)$data['activo'] : 0;

    $query = "UPDATE choferes SET 
              nombre='$nombre', direccion='$direccion', telefono='$telefono', 
              dni='$dni', licencia_desde='$desde', licencia_hasta='$hasta', 
              activo=$activo 
              WHERE id=$id";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>