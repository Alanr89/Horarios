<?php
header('Content-Type: application/json');
include 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    $id = (int)$data['id'];
    $query = "DELETE FROM horarios WHERE id = $id";
    mysqli_query($conexion, $query);
    echo json_encode(['success' => true]);
}
?>