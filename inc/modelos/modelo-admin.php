<?php

$accion = $_POST['accion'];
$password = $_POST['password'];
$usuario = $_POST['usuario'];

if($accion === 'crear'){
    //Codigo para crear los administradores

    //Hashear passwords
    $opciones = array(
        'cost' => 12
    );

    $hash_password = password_hash($password, PASSWORD_BCRYPT, $opciones);
    
    //importar conexion a la bd
    include '../funciones/conexion.php';

    try{
        //Realizar consulta a base de datos
        $stmt = $conexion->prepare(" INSERT INTO usuarios (usuario, password) VALUES (?, ?) ");
        $stmt->bind_param('ss', $usuario, $hash_password);
        $stmt->execute();
        if($stmt->affected_rows){
            $respuesta = array(
                'respuesta' => 'correcto',
                'id_insertado' => $stmt->insert_id,
                'tipo' => $accion
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
            'respuesta' => $e->getMessage()
        );
    }

    echo json_encode($respuesta);
    
}

if($accion === 'login'){
    //Escribir codigo que loguee a los administradores

    include '../funciones/conexion.php';

    try{
        // Seleccionar el usuario de la base de datos
        $stmt = $conexion->prepare("SELECT usuario, id, password FROM usuarios WHERE usuario = ?");
        $stmt->bind_param('s', $usuario);
        $stmt->execute();  
        //Loguear el usuario
        $stmt->bind_result($nombre_usuario, $id_usuario, $pass_usuario);
        $stmt->fetch();
        if($nombre_usuario){
            // El usuario existe, verificar el password
            if(password_verify($password, $pass_usuario)){
                //Iniciar la sesion
                session_start();
                $_SESSION['nombre'] = $usuario;
                $_SESSION['id'] = $id_usuario;
                $_SESSION['login'] = true;
                //Login correcto
                $respuesta = array(
                    'respuesta' => 'correcto',
                    'nombre' => $nombre_usuario,
                    'tipo' => $accion
                );
            }else{
                //Login incorrecto
                $respuesta = array(
                    'resultado' => 'Password incorrecto'
                );
            }
            
        }else{
            $respuesta = array(
                'error' => 'Usuario no existe'
            );
        }
        $stmt->close();
        $conexion->close();
    }catch(Exception $e){
        //EN caso de error, tomar la excepcion
        $respuesta = array(
            'respuesta' => $e->getMessage()
        );
    }

    echo json_encode($respuesta);
}