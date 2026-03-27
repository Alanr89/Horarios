<?php
include 'conexion.php';

// Obtener Choferes
$resChoferes = mysqli_query($conexion, "SELECT * FROM choferes");
$choferes = mysqli_fetch_all($resChoferes, MYSQLI_ASSOC);

// Obtener Moviles
$resMoviles = mysqli_query($conexion, "SELECT * FROM moviles");
$moviles = mysqli_fetch_all($resMoviles, MYSQLI_ASSOC);

// Obtener Horarios
$resHorarios = mysqli_query($conexion, "
    SELECT id, chofer_nombre AS chofer, movil_numero AS movil, fecha, 
    TIME_FORMAT(entrada, '%H:%i') AS entrada, 
    TIME_FORMAT(salida, '%H:%i') AS salida, 
    activo 
    FROM horarios");
$horarios = mysqli_fetch_all($resHorarios, MYSQLI_ASSOC);

// Devolver todo como JSON
echo json_encode(['choferes' => $choferes, 'moviles' => $moviles, 'horarios' => $horarios]);
?>