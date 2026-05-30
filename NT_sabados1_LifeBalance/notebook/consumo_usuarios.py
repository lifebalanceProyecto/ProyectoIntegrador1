#pasos para conectarme con el backend (consumir API)
import requests

def consumir_servicios_tabla_servicios():

    #1. almacenar la url + ep en una variable
    url="http://localhost:8080/api/usuarios"

    #2. Activar el request
    respuesta=requests.get(url)

    #3. Esperar el status code
    respuesta.raise_for_status()

    #4. Verificar el formado de respuesta
    datos=respuesta.json()

    #5. retornar la respuesta
    return datos