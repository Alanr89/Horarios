<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    // Ajuste automático: Cambiar el tipo de columna para que soporte el formato de texto completo (Fecha + Hora)
    mysqli_query($conexion, "ALTER TABLE horarios MODIFY entrada VARCHAR(50) DEFAULT NULL");
    mysqli_query($conexion, "ALTER TABLE horarios MODIFY salida VARCHAR(50) DEFAULT NULL");

    $id = !empty($data['id']) ? (int)$data['id'] : null;
    $chofer = mysqli_real_escape_string($conexion, $data['chofer']);
    $movil = mysqli_real_escape_string($conexion, $data['movil']);
    $fecha = mysqli_real_escape_string($conexion, $data['fecha']);

    $entrada = (!empty($data['entrada']) && $data['entrada'] !== '--:--') ? "'" . mysqli_real_escape_string($conexion, $data['entrada']) . "'" : "NULL";
    $salida = (!empty($data['salida']) && $data['salida'] !== '--:--') ? "'" . mysqli_real_escape_string($conexion, $data['salida']) . "'" : "NULL";
    $activo_sql = isset($data['activo']) ? ", activo=" . (int)$data['activo'] : "";

    if ($id) {
        $query = "UPDATE horarios SET movil_numero='$movil', entrada=$entrada, salida=$salida $activo_sql WHERE id=$id";
    } else {
        $activo_val = isset($data['activo']) ? (int)$data['activo'] : 0;
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada, salida, activo) 
                  VALUES ('$chofer', '$movil', '$fecha', $entrada, $salida, $activo_val)";
    }

    if (mysqli_query($conexion, $query)) {
        $new_id = $id ? $id : mysqli_insert_id($conexion);
        echo json_encode(['success' => true, 'id' => $new_id]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>