<?php
include 'conexion.php';

// Obtener Choferes
$resChoferes = mysqli_query($conexion, "SELECT * FROM choferes");
$choferes = mysqli_fetch_all($resChoferes, MYSQLI_ASSOC);

// Obtener Moviles
$resMoviles = mysqli_query($conexion, "SELECT * FROM moviles");
$moviles = mysqli_fetch_all($resMoviles, MYSQLI_ASSOC);

// Obtener Horarios
$resHorarios = mysqli_query($conexion, "SELECT chofer_nombre AS chofer, movil_numero AS movil, fecha, entrada, salida FROM horarios");
$horarios = mysqli_fetch_all($resHorarios, MYSQLI_ASSOC);

// Devolver todo como JSON
echo json_encode(['choferes' => $choferes, 'moviles' => $moviles, 'horarios' => $horarios]);
?>