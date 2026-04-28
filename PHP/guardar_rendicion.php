<?php
header('Content-Type: application/json');
include 'conexion.php';
$data = json_decode(file_get_contents('php://input'), true);
if ($data) {
    $fecha = mysqli_real_escape_string($conexion, $data['fecha']);
    $es_base = (int)$data['es_base'];
    $es_chofer = (int)$data['es_chofer'];
    $chofer = mysqli_real_escape_string($conexion, $data['chofer_nombre']);
    $motivo = mysqli_real_escape_string($conexion, $data['motivo']);
    $patente = mysqli_real_escape_string($conexion, $data['patente_caso']);
    $t_ent = (int)$data['tipo_entrada'];
    $t_sal = (int)$data['tipo_salida'];
    $ope = mysqli_real_escape_string($conexion, $data['operador']);
    $m_ade = (int)$data['marca_adelanto'];
    $m_ret = (int)$data['marca_retiro'];
    $m_gas = (int)$data['marca_gastos'];
    $m_rin = (int)$data['marca_rindio'];
    $monto = isset($data['monto']) ? (float)$data['monto'] : 0;
    $id = isset($data['id']) ? (int)$data['id'] : null;

    if ($id) {
        $query = "UPDATE rendiciones SET 
                    fecha='$fecha', es_base=$es_base, es_chofer=$es_chofer, chofer_nombre='$chofer',
                    motivo='$motivo', patente_caso='$patente', tipo_entrada=$t_ent, tipo_salida=$t_sal,
                    operador='$ope', monto=$monto, marca_adelanto=$m_ade, marca_retiro=$m_ret,
                    marca_gastos=$m_gas, marca_rindio=$m_rin
                  WHERE id=$id";
    } else {
        $query = "INSERT INTO rendiciones (fecha, es_base, es_chofer, chofer_nombre, motivo, patente_caso, tipo_entrada, tipo_salida, operador, monto, marca_adelanto, marca_retiro, marca_gastos, marca_rindio) 
                  VALUES ('$fecha', $es_base, $es_chofer, '$chofer', '$motivo', '$patente', $t_ent, $t_sal, '$ope', $monto, $m_ade, $m_ret, $m_gas, $m_rin)";
    }

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
}
?>