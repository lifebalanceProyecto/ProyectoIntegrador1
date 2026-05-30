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


def graficar_torta(
        datos_agrupados,
        columna_etiquetas,
        columna_valores,
        titulo="Grafico de torta",
        lista_colores=None,
        nombre_archivo="torta.png",
        ruta_destino=RUTA_GRAFICOS):

    # Dibuja un gráfico de torta para visualizar proporciones
    # Recibe etiquetas y valores numéricos

    # Se asegura de que la carpeta donde se guardará la imagen exista
    crear_ruta_si_no_existe(ruta_destino)

    # Si no se especifican colores se utiliza una paleta por defecto
    if lista_colores is None:
        lista_colores = [
            "#FF9800",
            "#2196F3",
            "#4CAF50",
            "#E91E63",
            "#9C27B0"
        ]

    # Se crea la figura y el área de dibujo
    figura, area_dibujo = plt.subplots(figsize=(8, 8))

    # Se obtiene la cantidad de categorías
    cantidad_categorias = len(datos_agrupados)

    # Se construye el gráfico de torta
    area_dibujo.pie(
        datos_agrupados[columna_valores],
        labels=datos_agrupados[columna_etiquetas],
        autopct="%1.1f%%",
        colors=lista_colores[:cantidad_categorias],
        startangle=90,
        wedgeprops={
            "edgecolor": "black",
            "linewidth": 0.5
        }
    )

    # Se establece el título del gráfico
    area_dibujo.set_title(titulo, fontsize=14)

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
    print(f"Grafico de torta guardado en: {ruta_completa}")

