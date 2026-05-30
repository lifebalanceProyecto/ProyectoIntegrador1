import pandas as pd

from notebook.descripcion_recomendaciones import describir_datos_recomendaciones
from notebook.limpieza_recomendaciones import limpiar_recomendaciones
from utils.Simulacion_Recomendaciones import simulacion_recomendaciones
from notebook.consumo_recomendaciones import consumir_tabla_re
from notebook.transformacion_recomendaciones import transformar_recomendaciones
from notebook.graficacion_recomendaciones import (generar_graficos_recomendaciones)


from notebook.limpieza_usuarios import limpiar_usuarios
from notebook.descripcion_usuarios import describir_datos_usuarios
from notebook.consumo_usuarios import consumir_servicios_tabla_servicios
from notebook.transformacion_usuarios import transformar_datos_usuarios
from notebook.graficacion_usuarios import (graficar_barras)
 
from notebook.limpieza_sesiones import limpiar_sesiones
from notebook.descripcion_sesiones import describir_datos_sesiones
from notebook.transformacion_sesiones import transformar_datos
from notebook.graficacion_sesiones import (graficar_torta)
from notebook.consumo_sesiones import consumir_tabla_sesion


""" simulacion_recomendaciones = simulacion_recomendaciones(2)
simulaciones_ordenadas_recomendaciones = pd.DataFrame(simulacion_recomendaciones)
simulaciones_limpias_recomendaciones = limpiar_recomendaciones(simulaciones_ordenadas_recomendaciones)
describir_datos_recomendaciones(simulaciones_limpias_recomendaciones) """

# USUARIOS

usuarios = consumir_servicios_tabla_servicios()

simulaciones_ordenadas_usuarios = pd.DataFrame(
    usuarios
)

simulaciones_limpias_usuarios = limpiar_usuarios(
    simulaciones_ordenadas_usuarios
)

print(simulaciones_limpias_usuarios)

describir_datos_usuarios(
    simulaciones_limpias_usuarios
)

agrupaciones_usuarios = transformar_datos_usuarios(
    simulaciones_limpias_usuarios
)

# GRAFICO BARRAS USUARIOS

graficar_barras(
    agrupaciones_usuarios["conteoUsuariosPorSexo"],
    columna_categorias="sexo",
    columna_valores="conteo",
    titulo="Usuarios por sexo",
    color_barras="#4CAF50",
    nombre_archivo="barras_usuarios.png"
)


# SESIONES

sesiones = consumir_tabla_sesion()

simulacion_ordenada_sesiones = pd.DataFrame(
    sesiones
)

simulaciones_limpias_sesiones = limpiar_sesiones(
    simulacion_ordenada_sesiones
)

describir_datos_sesiones(
    simulaciones_limpias_sesiones
)

agrupaciones_sesiones = transformar_datos(
    simulaciones_limpias_sesiones
)
agrupaciones_sesiones = transformar_datos(simulaciones_limpias_sesiones)


# Gráfico de torta: distribución de sesiones por nombre
graficar_torta(
    agrupaciones_sesiones["agrupacion3"],
    columna_etiquetas="nombre",
    columna_valores="cantidadSesiones",
    titulo="Distribución de sesiones por nombre",
    nombre_archivo="torta_sesiones_nombre.png"
)


#=====================================================================
# BLOQUE RECOMENDACIONES
# =====================================================================

# Nota: Cambié la simulación a 50 para que los gráficos tengan suficientes 
# datos que mostrar (con 2 datos, gráficos como el mapa de calor saldrán vacíos)
simulacion_recom = simulacion_recomendaciones(50) 
simulaciones_ordenadas_recomendaciones = pd.DataFrame(simulacion_recom)
simulaciones_limpias_recomendaciones = limpiar_recomendaciones(simulaciones_ordenadas_recomendaciones)

# Descripción de datos en consola
describir_datos_recomendaciones(simulaciones_limpias_recomendaciones)

# Generación automática de todos los gráficos de recomendaciones
# (Barras por motivo, Torta por código, Líneas por fecha, Top recomendaciones y Mapa de calor)
generar_graficos_recomendaciones(simulaciones_limpias_recomendaciones) 




