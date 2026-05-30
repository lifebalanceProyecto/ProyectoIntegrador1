# pasos para conectarme con el backend (consumir API)
import requests

def consumir_tabla_sesion():

    # 1. Almacenar la URL + endpoint en una variable
    url = "http://localhost:8080/api/sesiones"

    # 2. Activar el request al backend
    respuesta = requests.get(url)

    # 3. Esperar y validar el status code de la respuesta
    respuesta.raise_for_status()

    # 4. Convertir la respuesta JSON a estructura de Python
    datos = respuesta.json()

    # 5. Retornar los datos obtenidos desde la API
    return datos