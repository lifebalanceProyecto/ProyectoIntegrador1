# Pasos para transformar recomendaciones usando datos de consumo.
import pandas as pd
from typing import Optional

from notebook.consumo_recomendaciones import consumir_tabla_re


def transformar_recomendaciones(numero_recomendaciones: int = 50, use_api: bool = True, api_url: Optional[str] = None, timeout: int = 5) -> pd.DataFrame:
    """Consume recomendaciones y normaliza su estructura de datos.

    Devuelve un DataFrame con las columnas esperadas por el proyecto.
    """
    data_frame = consumir_tabla_re(data_frame, numero_recomendaciones, use_api=use_api, api_url=api_url, timeout=timeout)

    if data_frame.empty:
        return data_frame

    # Renombrar columnas alternativas para mantener consistencia
    posibles_renombrados = {
        "usuario": "usuario_id",
        "sesion": "sesion_id",
        "motivo_recomendacion": "motivo",
        "texto_recomendacion": "lista_recomendaciones",
        "recomendacion": "lista_recomendaciones",
        "codigo": "codigo_recomendacion",
        "codigo_recomendaciones": "codigo_recomendacion",
        "fecha_recomendacion": "fecha",
    }
    data_frame = data_frame.rename(columns={k: v for k, v in posibles_renombrados.items() if k in data_frame.columns})

    # Asegurar columnas esperadas
    columnas_esperadas = [
        "id",
        "usuario_id",
        "sesion_id",
        "motivo",
        "lista_recomendaciones",
        "codigo_recomendacion",
        "fecha",
    ]

    for columna in columnas_esperadas:
        if columna not in data_frame.columns:
            data_frame[columna] = pd.NA

    # Limpiar valores de texto y normalizar formato
    columnas_texto = ["usuario_id", "sesion_id", "motivo", "lista_recomendaciones", "codigo_recomendacion"]
    for columna in columnas_texto:
        data_frame[columna] = data_frame[columna].astype("string").str.strip()

    data_frame["codigo_recomendacion"] = data_frame["codigo_recomendacion"].str.upper()
    data_frame["fecha"] = pd.to_datetime(data_frame["fecha"], errors="coerce")
    data_frame["fecha"] = data_frame["fecha"].dt.strftime("%Y/%m/%d")

    data_frame["id"] = pd.to_numeric(data_frame["id"], errors="coerce")

    # Eliminar registros inválidos y duplicados
    columnas_obligatorias = ["id", "usuario_id", "sesion_id", "motivo", "lista_recomendaciones", "codigo_recomendacion"]
    data_frame = data_frame.dropna(subset=columnas_obligatorias)
    data_frame = data_frame[data_frame["id"] > 0]
    data_frame = data_frame.drop_duplicates()

    # Reordenar columnas para mantener el esquema
    data_frame = data_frame.loc[:, columnas_esperadas]
    return data_frame


if __name__ == "__main__":
    df = transformar_recomendaciones(10, use_api=False)
    print(df.head())
