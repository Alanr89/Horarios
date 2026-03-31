<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data && isset($data['id'])) {
    $id = (int)$data['id'];
    $nombre = isset($data['nombre']) ? mysqli_real_escape_string($conexion, $data['nombre']) : '';
    $direccion = isset($data['direccion']) ? mysqli_real_escape_string($conexion, $data['direccion']) : '';
    $telefono = isset($data['telefono']) ? mysqli_real_escape_string($conexion, $data['telefono']) : '';
    $dni = isset($data['dni']) ? mysqli_real_escape_string($conexion, $data['dni']) : '';
    
    // Solución para fechas vacías también en actualización
    $desde = !empty($data['licenciaDesde']) ? "'" . mysqli_real_escape_string($conexion, $data['licenciaDesde']) . "'" : "NULL";
    $hasta = !empty($data['licenciaHasta']) ? "'" . mysqli_real_escape_string($conexion, $data['licenciaHasta']) . "'" : "NULL";
    $activo = isset($data['activo']) ? (int)$data['activo'] : 0;

    $query = "UPDATE choferes SET 
              nombre='$nombre', direccion='$direccion', telefono='$telefono', 
              dni='$dni', licencia_desde=$desde, licencia_hasta=$hasta, 
              activo=$activo 
              WHERE id=$id";

    if (mysqli_query($conexion, $query)) {
        mysqli_commit($conexion); // Forzar la confirmación de la transacción
        echo json_encode(['success' => true]);
        exit;
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Datos de chofer o ID no proporcionados.']);
    exit;
}
?>