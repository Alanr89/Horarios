<?php
// PASO 1: Volvemos a la configuración de producción, ocultando advertencias de PHP.
error_reporting(0);
header('Content-Type: application/json');

include 'conexion.php';

// Recibir los datos JSON enviados por el fetch de JavaScript
$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    // PASO 2: Hacemos el código más robusto.
    // Usamos isset() para evitar errores si la clave no existe.
    // Esto previene el "Undefined index" y es compatible con versiones antiguas de PHP.
    $nombre = isset($data['nombre']) ? mysqli_real_escape_string($conexion, $data['nombre']) : '';
    $direccion = isset($data['direccion']) ? mysqli_real_escape_string($conexion, $data['direccion']) : '';
    $telefono = isset($data['telefono']) ? mysqli_real_escape_string($conexion, $data['telefono']) : '';
    $dni = isset($data['dni']) ? mysqli_real_escape_string($conexion, $data['dni']) : '';
    
    // Solución para inserción de fechas nulas o vacías
    $desde = !empty($data['licenciaDesde']) ? "'" . mysqli_real_escape_string($conexion, $data['licenciaDesde']) . "'" : "NULL";
    $hasta = !empty($data['licenciaHasta']) ? "'" . mysqli_real_escape_string($conexion, $data['licenciaHasta']) . "'" : "NULL";

    if (empty($nombre)) {
        echo json_encode(['success' => false, 'error' => 'El nombre del chofer es un campo obligatorio.']);
        exit;
    }

    // Forzamos que el chofer se cree como activo = 1 para evitar invisibilidad en JS
    $query = "INSERT INTO choferes (nombre, direccion, telefono, dni, licencia_desde, licencia_hasta, activo) 
              VALUES ('$nombre', '$direccion', '$telefono', '$dni', $desde, $hasta, 1)";

    if (mysqli_query($conexion, $query)) {
        mysqli_commit($conexion); // Forzar la confirmación de la transacción
        echo json_encode(['success' => true]);
        exit;
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No hay datos enviados']);
    exit;
}
?>