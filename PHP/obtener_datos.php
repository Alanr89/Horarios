<?php
include 'conexion.php';

// Obtener Choferes
$resChoferes = mysqli_query($conexion, "SELECT * FROM choferes");
$choferes = mysqli_fetch_all($resChoferes, MYSQLI_ASSOC);

// Obtener Moviles
$resMoviles = mysqli_query($conexion, "SELECT * FROM moviles");
$moviles = mysqli_fetch_all($resMoviles, MYSQLI_ASSOC);

// Devolver todo como JSON
echo json_encode(['choferes' => $choferes, 'moviles' => $moviles]);
?>