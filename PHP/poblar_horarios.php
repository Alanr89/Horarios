<?php
include 'conexion.php';

// Nombres de los choferes y móviles asignados (basado en tus registros)
$choferes = ['Alan Reyes', 'Juan Alonso', 'Nahum a'];
$moviles = ["'01'", "'02'", "'03'"];

// Días a generar (del 2 al 6 de abril)
$dias = ['02', '03', '04', '05', '06'];
$mes = '04';
$anio = '2026';

$exito = true;

foreach ($dias as $dia) {
    $fecha_db = "$anio-$mes-$dia"; // Formato YYYY-MM-DD para la columna 'fecha'
    
    foreach ($choferes as $index => $chofer) {
        $movil = $moviles[$index];
        $entrada = "'$dia/$mes/$anio 11:00'";
        $salida = "'$dia/$mes/$anio 15:00'";
        
        $query = "INSERT INTO horarios (chofer_nombre, movil_numero, fecha, entrada, salida, activo) 
                  VALUES ('$chofer', $movil, '$fecha_db', $entrada, $salida, 3)";
                  
        if (!mysqli_query($conexion, $query)) {
            $exito = false;
            echo "Error insertando a $chofer el día $fecha_db: " . mysqli_error($conexion) . "<br>";
        }
    }
}

if ($exito) {
    echo "<div style='font-family: Arial; text-align: center; margin-top: 50px;'>";
    echo "<h1 style='color: #28a745;'>¡Datos de prueba insertados!</h1>";
    echo "<p>Se registraron turnos finalizados de 11:00 a 15:00 (4 horas diarias) para 3 choferes, desde el 02/04 al 06/04.</p>";
    echo "<p>Ya puedes hacer las pruebas de exportación en tu sistema.</p>";
    echo "</div>";
}
?>