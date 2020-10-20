eventListeners();
//Lista de proyectos
var listaProyectos = document.querySelector('ul#proyectos');

function eventListeners() {
    // Document ready 
    document.addEventListener('DOMContentLoaded', function() {
        actualizarProgreso();
    });

    //Boton para crear proyecto
    document.querySelector('.crear-proyecto a').addEventListener('click', nuevoProyecto);

    //Boton para una nueva tarea
    document.querySelector('.nueva-tarea').addEventListener('click', agregarTarea);

    //Botones para las acciones de las tareas
    document.querySelector('.listado-pendientes').addEventListener('click', accionesTareas);
}

function nuevoProyecto(e) {
    e.preventDefault();

    //Crea un input para el nombre del nuevo proyecto
    var nuevoProyecto = document.createElement('li');
    nuevoProyecto.innerHTML = '<input type="text" id="nuevo-proyecto">';
    listaProyectos.appendChild(nuevoProyecto);

    //Seleccionar el id de nuevoproyecto
    var inputNuevoProyecto = document.querySelector('#nuevo-proyecto');

    //Al presionar enter crea el proyecto

    inputNuevoProyecto.addEventListener('keypress', function(e) {
        var tecla = e.which || e.keyCode;

        if (tecla === 13) {
            guardarProyectoDB(inputNuevoProyecto.value);
            listaProyectos.removeChild(nuevoProyecto);
        }
    });
}

function guardarProyectoDB(nombreProyecto) {
    // Crear llamado a ajax 

    var xhr = new XMLHttpRequest();

    //enviar datos por FORM DATA
    var datos = new FormData();
    datos.append('proyecto', nombreProyecto);
    datos.append('accion', 'crear');

    //Abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-proyecto.php', true);

    //En la carga
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));

            //Obtener datos de la respuesta
            var respuesta = JSON.parse(xhr.responseText);
            var proyecto = respuesta.nombre_proyecto,
                id_proyecto = respuesta.id_insertado,
                tipo = respuesta.tipo,
                resultado = respuesta.respuesta;

            //comprobar insersion
            if (resultado === 'correcto') {
                //Exitoso
                if (tipo === 'crear') {
                    //Se creo un nuevo proyecto
                    // Inyectar el HTML
                    var nuevoProyecto = document.createElement('li');
                    nuevoProyecto.innerHTML = `
                        <a href="index.php?id_proyecto=${id_proyecto}" id="proyecto:${id_proyecto}">
                            ${nombreProyecto}
                        </a>
                    `;
                    //Agregar al HTML
                    listaProyectos.appendChild(nuevoProyecto);
                } else {
                    //Se actualizo o se elimino

                }
            } else {
                // Error
                swal("Error!", "Hubo un error...", "error");
            }
        }
    }

    //enviar el request
    xhr.send(datos);
}

//Agregar una nueva tarea al proyecto actual
function agregarTarea(e) {
    e.preventDefault();

    var nombreTarea = document.querySelector('.nombre-tarea').value;

    //Validar que el campo tenga algo escrito
    if (nombreTarea === '') {
        swal("Error!", "Los campos son obligatorios", "error");
    } else {
        //La tarea existe
        //Llamada a ajax
        xhr = new XMLHttpRequest();
        datos = new FormData;
        datos.append('tarea', nombreTarea);
        datos.append('accion', 'crear');
        datos.append('id_proyecto', document.querySelector('#id_proyecto').value);

        //Abrir la conexion
        xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

        //Respuesta
        xhr.onload = function() {
            if (this.status === 200) {
                var respuesta = JSON.parse(xhr.responseText);
                var resultado = respuesta.respuesta,
                    tarea = respuesta.tarea,
                    id_insertado = respuesta.id_insertado,
                    tipo = respuesta.tipo;

                if (resultado === 'correcto') {
                    //se agrego correctamente
                    if (tipo === 'crear') {
                        //Se lanza la alerta
                        swal("Correcto!", "La tarea se agrego correctamente", "success");

                        var parrafoListaVacia = document.querySelectorAll('.lista-vacia');
                        if (parrafoListaVacia.length > 0) {
                            document.querySelector('.lista-vacia').remove();
                        }
                        //Construir el tamplate
                        var nuevaTarea = document.createElement('li');

                        //agregamos el ID
                        nuevaTarea.id = 'tarea:' + id_insertado;

                        //agregar clase tarea
                        nuevaTarea.classList.add('tarea');

                        //insertar en el HTML
                        nuevaTarea.innerHTML = `
                            <p>${tarea}</p>
                            <div class="acciones">
                                <i class="far fa-check-circle"></i>
                                <i class="fas fa-trash"></i>
                            </div>
                        `;

                        //Agregarlo al HTML
                        var lista = document.querySelector('.listado-pendientes ul');
                        lista.appendChild(nuevaTarea);

                        //limpiar el formulario
                        document.querySelector('.agregar-tarea').reset();

                        //Actualizar el progreso
                        actualizarProgreso();
                    }
                } else {

                }
            }
        }

        xhr.send(datos);
    }
}

//Cambia el estado de las tareas o las elimina
function accionesTareas(e) {
    e.preventDefault();

    if (e.target.classList.contains('fa-check-circle')) {
        //Click en completado
        if (e.target.classList.contains('completo')) {
            e.target.classList.remove('completo');
            cambiarEstadoTarea(e.target, 0);
        } else {
            e.target.classList.add('completo');
            cambiarEstadoTarea(e.target, 1);
        }
    } else if (e.target.classList.contains('fa-trash')) {
        //Click en eliminar
        Swal.fire({
            title: 'Esta seguro?',
            text: "No podrás deshacer esta acción!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                var tareaEliminada = e.target.parentElement.parentElement;
                //Borrar de la base de datos
                eliminarTareaBD(tareaEliminada);
                //borrar del HTML
                tareaEliminada.remove();
                Swal.fire(
                    'Eliminado!',
                    'La tarea fue eliminada',
                    'success'
                )
            }
        })
    }
}

//Cambiar estado de la tarea
function cambiarEstadoTarea(tarea, estado) {
    var idTarea = tarea.parentElement.parentElement.id.split(':');

    //Crear llamado
    xhr = new XMLHttpRequest();

    //informacion
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'actualizar');
    datos.append('estado', estado);

    //open
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    //onload
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));
            //Actualizar el progreso
            actualizarProgreso();
        }
    }

    //enviamos pticion
    xhr.send(datos);
}

//Elimina las tareas de la BD
function eliminarTareaBD(tarea) {
    var idTarea = tarea.id.split(':');

    //Crear llamado
    xhr = new XMLHttpRequest();

    //informacion
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'eliminar');

    //open
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    //onload
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));

            //Comprobar que haya tareas
            var listaTareasRestantes = document.querySelectorAll('li.tarea');
            if (listaTareasRestantes.length === 0) {
                document.querySelector('.listado-pendientes ul').innerHTML = "<p class='lista-vacia'>No hay tareas en este proyecto</p>";
            }

            //Actualizar el progreso
            actualizarProgreso();
        }
    }

    //enviamos pticion
    xhr.send(datos);
}

//Actualiza el avance del proyecto
function actualizarProgreso() {
    //Obtener todas las tareas
    const tareas = document.querySelectorAll('li.tarea');

    //obtener las tareas completadas
    const tareasCompletadas = document.querySelectorAll('i.completo');

    //Determinar el avance
    const avance = Math.round((tareasCompletadas.length / tareas.length) * 100);

    //Asignar el avance a la barra
    const porcentaje = document.querySelector('#porcentaje');
    porcentaje.style.width = avance + '%';

    if (avance === 100) {
        swal("En Horabuena!", "Haz terminado tu proyecto", "success");
    }
}