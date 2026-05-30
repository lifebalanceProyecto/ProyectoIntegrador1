import pandas as pd

def limpiar_sesiones(data_frame_sucio):

    data_frame_limpio = data_frame_sucio.copy()

    # Renombrar columnas
    data_frame_limpio = data_frame_limpio.rename(columns={
        "id_sesion": "id",
        "usuario_id": "usuario"
    })

    # -----------------------------
    # LIMPIEZA DE TEXTOS
    # -----------------------------

    data_frame_limpio["nombre"] = (
        data_frame_limpio["nombre"]
        .astype("string")
        .str.strip()
        .str.lower()
    )

    data_frame_limpio["tipo"] = (
        data_frame_limpio["tipo"]
        .astype("string")
        .str.strip()
        .str.lower()
    )

    # Valores esperados
    tipos_validos = [
        "meditacion",
        "respiracion",
        "relajacion",
        "estiramiento",
        "caminata",
        "yoga"
    ]

    data_frame_limpio["tipo"] = (
        data_frame_limpio["tipo"]
        .where(
            data_frame_limpio["tipo"].isin(tipos_validos),
            pd.NA
        )
    )

    # -----------------------------
    # LIMPIEZA NUMERICA
    # -----------------------------

    data_frame_limpio["id"] = pd.to_numeric(
        data_frame_limpio["id"],
        errors="coerce"
    )

    data_frame_limpio["duracion"] = pd.to_numeric(
        data_frame_limpio["duracion"],
        errors="coerce"
    )

    # Valores válidos
    data_frame_limpio = (
        data_frame_limpio[
            data_frame_limpio["id"] > 0
        ]
    )

    data_frame_limpio = (
        data_frame_limpio[
            data_frame_limpio["duracion"] > 0
        ]
    )

    # -----------------------------
    # DATOS VACIOS
    # -----------------------------

    columnas_obligatorias = [
        "id",
        "nombre",
        "tipo",
        "duracion"
    ]

    data_frame_limpio = (
        data_frame_limpio.dropna(
            subset=columnas_obligatorias
        )
    )

    return data_frame_limpio