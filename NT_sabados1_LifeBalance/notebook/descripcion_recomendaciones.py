import pandas as pd

def describir_datos_recomendaciones(data_frame_limpio):
    print(f"Numero de filas: {data_frame_limpio.shape[0]}")
    print(f"Numero de columnas {data_frame_limpio.shape[1]}")
    print(f"Columnas disponibles {list(data_frame_limpio.columns)}")
    print(f"estadisticas {data_frame_limpio[["id"]].describe()}")
    print(f"Valores categoricos {data_frame_limpio["usuario_id"].value_counts()}")
    print(f"Valores categoricos {data_frame_limpio["sesion_id"].value_counts()}")
    print(f"Valores categoricos {data_frame_limpio["motivo"].value_counts()}")
    print(f"Valores categoricos {data_frame_limpio["lista_recomendaciones"].value_counts()}")
    print(f"Valores categoricos {data_frame_limpio["codigo_recomendacion"].value_counts()}")
    print(f"Fecha minima {data_frame_limpio["fecha"].min()}")
    print(f"Fecha maxima {data_frame_limpio["fecha"].max()}")
