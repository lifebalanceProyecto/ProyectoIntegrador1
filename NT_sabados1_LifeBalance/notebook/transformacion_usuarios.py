import pandas as pd

def transformar_datos_usuarios(data_frame_limpio):

    # ==============================
    # 1. Conteo de usuarios por sexo
    # ==============================
    filtro1 = data_frame_limpio.query(
        "sexo.notnull()",
        engine="python"
    )

    agrupacion1 = (
        filtro1.groupby("sexo")["id"]
        .count()
        .reset_index(name="conteo")
    )

    # ==============================
    # 2. Usuarios por fecha creación
    # ==============================
    filtro2 = data_frame_limpio.query(
        "fecha_creacion.notnull()",
        engine="python"
    )

    agrupacion2 = (
        filtro2.groupby("fecha_creacion")["id"]
        .count()
        .reset_index(name="conteo")
    )

    # ==============================
    # 3. Usuarios por tipo documento
    # ==============================
    agrupacion3 = (
        data_frame_limpio.groupby("tipoDocumento")["id"]
        .count()
        .reset_index(name="conteo")
    )

    # ==============================
    # 4. Correos por dominio
    # ==============================
    filtro4 = data_frame_limpio.copy()

    filtro4["dominio_correo"] = (
        filtro4["correo"]
        .str.split("@")
        .str[1]
    )

    agrupacion4 = (
        filtro4.groupby("dominio_correo")["id"]
        .count()
        .reset_index(name="conteo")
    )

    # ==============================
    # 5. Sexo vs tipo documento
    # ==============================
    filtro5 = data_frame_limpio.query(
        "sexo.notnull()",
        engine="python"
    )

    agrupacion5 = (
        filtro5.groupby(
            ["sexo", "tipoDocumento"]
        )["id"]
        .count()
        .reset_index(name="conteo")
    )

    # ==============================
    # 6. Usuarios por rango ID
    # ==============================
    filtro6 = data_frame_limpio.copy()

    filtro6["rango_id"] = pd.cut(
        filtro6["id"],
        bins=[0, 50000, 100000, 150000, 200000],
        labels=[
            "0-50K",
            "50K-100K",
            "100K-150K",
            "150K-200K"
        ]
    )

    agrupacion6 = (
        filtro6.groupby("rango_id")["id"]
        .count()
        .reset_index(name="conteo")
    )

    # ==============================
    # 7. Usuarios por nombre
    # ==============================
    agrupacion7 = (
        data_frame_limpio.groupby("nombre")["id"]
        .count()
        .reset_index(name="conteo")
    )

    # ==============================
    # 8. Usuarios por mes creación
    # ==============================
    filtro8 = data_frame_limpio.copy()

    filtro8["mes"] = pd.to_datetime(
        filtro8["fecha_creacion"]
    ).dt.month

    agrupacion8 = (
        filtro8.groupby("mes")["id"]
        .count()
        .reset_index(name="conteo")
    )

    # ==============================
    # Resumen
    # ==============================
    transformacion_resumen = {
        "conteoUsuariosPorSexo": agrupacion1,
        "usuariosPorFechaCreacion": agrupacion2,
        "usuariosPorTipoDocumento": agrupacion3,
        "conteoCorreosPorDominio": agrupacion4,
        "relacionSexoTipoDocumento": agrupacion5,
        "usuariosPorRangoId": agrupacion6,
        "usuariosPorNombre": agrupacion7,
        "usuariosPorMesCreacion": agrupacion8
    }

    return transformacion_resumen