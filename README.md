# A Donde Vivir
- crear un servidor web para atender las peticiones de los clientes

## Endpoints
- "/" GET : mostrar una lista de propiedades
    - cada propiedad debe contener los siguientes datos:
        - precio
        - direccion
        - distrito
        - area (m2)
        - numero de dormitorios
        - foto
        - descripcion
- "/new" GET : agregar una nueva propiedad
    - usaremos un formulario que permita capturar los datos de la nueva propiedad   
    - el formulario debe enviar los datos a "/new" POST

## Datos
- los datos de las propiedades se almacenaran en un archivo JSON 

## Bonus
- en el endpoint "/" agregar un filtro de precio (desde, hasta), que actualice la lista de propiedades a mostrar segun el rango
