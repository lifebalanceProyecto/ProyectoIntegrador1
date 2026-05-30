import pandas as pd

def transformar_datos(data_frame_limpio):

    # =====================================
    # Transformación 1
    # Cantidad de sesiones por tipo
    # Gráfico recomendado: Barras
    # =====================================
    filtro1 = data_frame_limpio.query("duracion >= 0")

    agrupacion1 = (
        filtro1.groupby("tipo")["id"]
        .count()
        .reset_index(name="conteoSesiones")
    )


    # =====================================
    # Transformación 2
    # Duración promedio por tipo
    # Gráfico recomendado: Líneas
    # =====================================
    filtro2 = data_frame_limpio.query("duracion > 0")

    agrupacion2 = (
        filtro2.groupby("tipo")["duracion"]
        .mean()
        .reset_index(name="promedioDuracion")
    )


    # =====================================
    # Transformación 3
    # Cantidad de sesiones por nombre
    # Gráfico recomendado: Torta
    # =====================================
    filtro3 = data_frame_limpio.query("id > 0")

    agrupacion3 = (
        filtro3.groupby("nombre")["id"]
        .count()
        .reset_index(name="cantidadSesiones")
    )


    # =====================================
    # Transformación 4
    # Duración total por nombre
    # Gráfico recomendado: Barras
    # =====================================
    filtro4 = data_frame_limpio.query("duracion > 0")

    agrupacion4 = (
        filtro4.groupby("nombre")["duracion"]
        .sum()
        .reset_index(name="duracionTotal")
    )


    # =====================================
    # Transformación 5
    # Tipo vs nombre
    # Gráfico recomendado: Mapa de calor
    # =====================================
    filtro5 = data_frame_limpio.query("duracion > 0")

    agrupacion5 = (
        filtro5.groupby(["tipo", "nombre"])["id"]
        .count()
        .reset_index(name="conteo")
    )


    transformacion_resume = {
        "agrupacion1": agrupacion1,
        "agrupacion2": agrupacion2,
        "agrupacion3": agrupacion3,
        "agrupacion4": agrupacion4,
        "agrupacion5": agrupacion5
    }

    return transformacion_resume