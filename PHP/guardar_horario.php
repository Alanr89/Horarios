<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $id = !empty($data['id']) ? (int)$data['id'] : null;
    $chofer = mysqli_real_escape_string($conexion, $data['chofer']);
    
    // CORRECCIÓN: Para evitar fallos en MySQL Strict Mode si el móvil viene vacío
    $movil = !empty($data['movil']) ? "'" . mysqli_real_escape_string($conexion, $data['movil']) . "'" : "NULL";
    
    $fecha = mysqli_real_escape_string($conexion, $data['fecha']);

    $entrada = (!empty($data['entrada']) && $data['entrada'] !== '--:--') ? "'" . mysqli_real_escape_string($conexion, $data['entrada']) . "'" : "NULL";
    $salida = (!empty($data['salida']) && $data['salida'] !== '--:--') ? "'" . mysqli_real_escape_string($conexion, $data['salida']) . "'" : "NULL";
    $activo_sql = isset($data['activo']) ? ", activo=" . (int)$data['activo'] : "";

    if ($id) {
        $query = "UPDATE horarios SET movil_numero=$movil, entrada=$entrada, salida=$salida $activo_sql WHERE id=$id";
    } else {
        $activo_val = isset($data['activo']) ? (int)$data['activo'] : 0;
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada, salida, activo) 
                  VALUES ('$chofer', $movil, '$fecha', $entrada, $salida, $activo_val)";
    }

    try {
        if (mysqli_query($conexion, $query)) {
            $new_id = $id ? $id : mysqli_insert_id($conexion);
            echo json_encode(['success' => true, 'id' => $new_id]);
        } else {
            echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>