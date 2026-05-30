import pandas as pd

def limpiar_recomendaciones(data_frame_sucio):
    data_frame_limpio = data_frame_sucio.copy()

    # limpiar strings
    columnas_texto = ["usuario_id", "sesion_id", "motivo", "lista_recomendaciones", "codigo_recomendacion"]
    for columna in columnas_texto:
        data_frame_limpio[columna] = data_frame_limpio[columna].astype("string").str.strip()

    # definir valores esperados
    usuarios_validos = [f"Usuario{i}" for i in range(1, 101)]
    sesiones_validas = [f"Sesion{i}" for i in range(1, 101)]
    motivos_validos = ["Salud", "Bienestar", "Ejercicio", "Dieta", "Descanso"]
    lista_recomendaciones_validas = [
        "Recomendación 1: Mantén una dieta equilibrada y saludable.",
        "Recomendación 2: Realiza ejercicio regularmente para mantener un estilo de vida activo.",
        "Recomendación 3: Duerme al menos 7-8 horas por noche para asegurar un buen descanso.",
        "Recomendación 4: Bebe suficiente agua para mantener tu cuerpo hidratado.",
        "Recomendación 5: Evita el consumo excesivo de alcohol y tabaco para proteger tu salud."
    ]
    codigos_validos = ["RO1", "RO2", "RO3", "RO4", "RO5"]

    data_frame_limpio["usuario_id"] = data_frame_limpio["usuario_id"].where(data_frame_limpio["usuario_id"].isin(usuarios_validos), pd.NA)
    data_frame_limpio["sesion_id"] = data_frame_limpio["sesion_id"].where(data_frame_limpio["sesion_id"].isin(sesiones_validas), pd.NA)
    data_frame_limpio["motivo"] = data_frame_limpio["motivo"].where(data_frame_limpio["motivo"].isin(motivos_validos), pd.NA)
    data_frame_limpio["lista_recomendaciones"] = data_frame_limpio["lista_recomendaciones"].where(data_frame_limpio["lista_recomendaciones"].isin(lista_recomendaciones_validas), pd.NA)
    data_frame_limpio["codigo_recomendacion"] = data_frame_limpio["codigo_recomendacion"].where(data_frame_limpio["codigo_recomendacion"].isin(codigos_validos), pd.NA)

    # evaluar columnas numericas
    data_frame_limpio["id"] = pd.to_numeric(data_frame_limpio["id"], errors='coerce')

    # Evaluar fechas
    data_frame_limpio["fecha"] = pd.to_datetime(
        data_frame_limpio["fecha"],
        format='mixed',
        dayfirst=True,
        errors='coerce'
    )

    # Reemplazar fechas malas por default
    fecha_default = pd.to_datetime("2026-01-01")
    data_frame_limpio["fecha"] = data_frame_limpio["fecha"].fillna(fecha_default)

    # Estandarizar todas al mismo formato
    data_frame_limpio["fecha"] = data_frame_limpio["fecha"].dt.strftime("%Y/%m/%d")

    # eliminar filas con datos faltantes
    columnas_obligatorias = ["id", "usuario_id", "sesion_id", "motivo", "lista_recomendaciones", "codigo_recomendacion"]
    data_frame_limpio = data_frame_limpio.dropna(subset=columnas_obligatorias)

    # Eliminar valores invalidos a nivel numerico
    data_frame_limpio = data_frame_limpio[(data_frame_limpio["id"] > 0)]

    # Eliminar valores duplicados
    data_frame_limpio = data_frame_limpio.drop_duplicates()

    return data_frame_limpio



