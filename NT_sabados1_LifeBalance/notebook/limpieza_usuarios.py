import pandas as pd

def limpiar_usuarios(data_frame_sucio):

    data_frame_limpio = data_frame_sucio.copy()

    # RENOMBRAR COLUMNAS DEL BACKEND

    data_frame_limpio = data_frame_limpio.rename(columns={
        "fechaCreacion": "fecha_creacion"
    })

    # LIMPIAR STRINGS

    columnas_texto = [
        "nombre",
        "correo",
        "contrasena",
        "sexo"
    ]

    for columna in columnas_texto:

        if columna in data_frame_limpio.columns:

            data_frame_limpio[columna] = (
                data_frame_limpio[columna]
                .astype("string")
                .str.strip()
                .str.lower()
            )

    # VERIFICAR SEXOS VALIDOS

    sexos_validos = [
        "femenino",
        "masculino",
        "no binario",
        "no_binario"
    ]

    data_frame_limpio["sexo"] = (
        data_frame_limpio["sexo"]
        .where(
            data_frame_limpio["sexo"].isin(sexos_validos),
            pd.NA
        )
    )

    # DEBUG

    print(data_frame_limpio.columns)

    print(
        data_frame_limpio[
            ["nombre", "sexo"]
        ].head()
    )

    # EVALUAR COLUMNAS NUMERICAS

    data_frame_limpio["id"] = pd.to_numeric(
        data_frame_limpio["id"],
        errors="coerce"
    )

    # EVALUAR FECHAS

    data_frame_limpio["fecha_creacion"] = pd.to_datetime(
        data_frame_limpio["fecha_creacion"],
        format="mixed",
        dayfirst=True,
        errors="coerce"
    )

    # REEMPLAZAR FECHAS MALAS

    fecha_default = pd.to_datetime("2026-01-01")

    data_frame_limpio["fecha_creacion"] = (
        data_frame_limpio["fecha_creacion"]
        .fillna(fecha_default)
    )

    # ESTANDARIZAR FECHA

    data_frame_limpio["fecha_creacion"] = (
        data_frame_limpio["fecha_creacion"]
        .dt.strftime("%Y/%m/%d")
    )

    # ELIMINAR FILAS VACIAS

    columnas_obligatorias = [
        "id",
        "nombre",
        "correo"
    ]

    data_frame_limpio = (
        data_frame_limpio
        .dropna(subset=columnas_obligatorias)
    )

    # VALIDAR IDS

    data_frame_limpio = (
        data_frame_limpio[
            data_frame_limpio["id"] > 0
        ]
    )

    # ELIMINAR DUPLICADOS

    data_frame_limpio = (
        data_frame_limpio
        .drop_duplicates()
    )

    return data_frame_limpio