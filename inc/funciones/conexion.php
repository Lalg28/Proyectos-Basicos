<?php 

$conexion = new mysqli('localhost', 'root', 'root', 'uptask');

if($conexion->connect_error){
    echo $conexion->connect_error;
}

$conexion->set_charset('utf8');

?>
