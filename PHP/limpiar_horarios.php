<?php
include 'conexion.php';

// El comando TRUNCATE vacía toda la tabla y reinicia los IDs auto-incrementales a 1
$query = "TRUNCATE TABLE horarios";

if (mysqli_query($conexion, $query)) {
    echo "<div style='font-family: Arial; text-align: center; margin-top: 50px;'>";
    echo "<h1 style='color: #28a745;'>¡Base de datos limpiada con éxito!</h1>";
    echo "<p>Todos los registros de la tabla <b>horarios</b> han sido eliminados.</p>";
    echo "<p>Ya puedes cerrar esta pestaña, volver a tu sistema y hacer la prueba limpia.</p>";
    echo "</div>";
} else {
    echo "Error al limpiar la base de datos: " . mysqli_error($conexion);
}
?>