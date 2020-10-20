eventListeners();

function eventListeners() {
    document.querySelector('#formulario').addEventListener('submit', validarRegistro);
}

function validarRegistro(e) {
    e.preventDefault();

    var usuario = document.querySelector('#usuario').value,
        password = document.querySelector('#password').value,
        tipo = document.querySelector('#tipo').value;

    if (usuario === '' || password === '') {
        swal("Error!", "Todos los campos son obligatorios", "error");
    } else {
        //Ambos campos tienen algo, mandar ejecutar ajax

        //Datos que se envian al servidor
        var datos = new FormData();
        datos.append('usuario', usuario);
        datos.append('password', password);
        datos.append('accion', tipo);

        //crear llamado a Ajax
        var xhr = new XMLHttpRequest();

        //abrir la conexion
        xhr.open('POST', 'inc/modelos/modelo-admin.php', true);

        // retorno de datos
        xhr.onload = function() {
            if (this.status === 200) {
                var respuesta = JSON.parse(xhr.responseText);
                console.log(respuesta);
                //Si la respuesta es correcta
                if (respuesta.respuesta === 'correcto') {
                    //Si es nuevo usuario
                    if (respuesta.tipo === 'crear') {
                        swal("Usuario Creado!", "El usuario se creo correctamente", "success");
                    } else if (respuesta.tipo === 'login') {
                        swal("Login Correcto!", "Presiona OK para continuar...", "success").then(resultado => {
                            if (resultado.value) {
                                window.location.href = 'index.php';
                            }
                        });
                    }
                } else {
                    swal("Error!", "Hubo un error...", "error");
                }
            }
        }

        //Enviar peticion
        xhr.send(datos);

    }
}