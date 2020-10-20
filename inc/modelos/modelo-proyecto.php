<?php

$accion = $_POST['accion'];
$proyecto = $_POST['proyecto'];

if($accion === 'crear'){
    //importar conexion a la bd
    include '../funciones/conexion.php';

    try{
        //Realizar consulta a base de datos
        $stmt = $conexion->prepare(" INSERT INTO proyectos (nombre) VALUES (?) ");
        $stmt->bind_param('s', $proyecto);
        $stmt->execute();
        if($stmt->affected_rows){
            $respuesta = array(
                'respuesta' => 'correcto',
                'id_insertado' => $stmt->insert_id,
                'tipo' => $accion,
                'nombre_proyecto' => $proyecto
            );
        }else{
            $respuesta = array(
                'respuesta' => 'error'
            );
        }
        $stmt->close();
        $conexion->close();
    }catch(Exception $e){
        //EN caso de error, tomar la excepcion
        $respuesta = array(
            'error' => $e->getMessage()
        );
    }

    echo json_encode($respuesta);
    
}