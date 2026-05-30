# Se importa matplotlib para crear los gráficos
import matplotlib.pyplot as plt

# Se importa seaborn para crear mapas de calor con mejor visualización
import seaborn as sns

# Se importa os para manejar rutas y carpetas
import os


# Ruta donde se almacenarán las imágenes generadas
RUTA_GRAFICOS = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "LifeBalanceFrontend",
    "output_frontend",
    "public",
    "graficos"
)


def crear_ruta_si_no_existe(ruta_destino):

    # Se crea la carpeta destino en caso de que no exista
    os.makedirs(ruta_destino, exist_ok=True)



def graficar_barras(
        datos_agrupados,
        columna_categorias,
        columna_valores,
        titulo="Grafico de barras",
        color_barras="#4CAF50",
        nombre_archivo="barras.png",
        ruta_destino=RUTA_GRAFICOS):

    # Dibuja un gráfico de barras para comparar categorías
    # Recibe un DataFrame agrupado con categorías y valores

    # Se asegura de que la carpeta donde se guardará la imagen exista
    crear_ruta_si_no_existe(ruta_destino)

    # Se crea la figura y el área de dibujo
    figura, area_dibujo = plt.subplots(figsize=(10, 5))

    # Se dibujan las barras utilizando el color indicado
    area_dibujo.bar(
        datos_agrupados[columna_categorias],
        datos_agrupados[columna_valores],
        color=color_barras,
        edgecolor="black"
    )

    # Se establece el título del gráfico
    area_dibujo.set_title(titulo, fontsize=14)

    # Se establece el nombre del eje X
    area_dibujo.set_xlabel(columna_categorias, fontsize=12)

    # Se establece el nombre del eje Y
    area_dibujo.set_ylabel(columna_valores, fontsize=12)

    # Se rotan las etiquetas del eje X para evitar sobreposición
    plt.xticks(rotation=45)

    # Se ajustan automáticamente los espacios
    plt.tight_layout()

    # Se construye la ruta completa del archivo
    ruta_completa = os.path.join(
        ruta_destino,
        nombre_archivo
    )

    # Se guarda la imagen
    figura.savefig(ruta_completa)

    # Se libera memoria cerrando la figura
    plt.close(figura)

    # Se informa dónde quedó almacenado el gráfico
    print(f"Grafico de barras guardado en: {ruta_completa}")

