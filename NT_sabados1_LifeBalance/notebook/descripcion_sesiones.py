import pandas as pd

def describir_datos_sesiones(data_frame_limpio):
    print(f"numero de filas {data_frame_limpio.shape[0]}")
    print(f"numero de columnas {data_frame_limpio.shape[1]}")
    print(f"columnas disponibles {list(data_frame_limpio.columns)}")
    print(f"estadisticas {data_frame_limpio[['id','duracion']].describe()}")
    print(f"valores categoricos {data_frame_limpio['nombre'].value_counts()}")
    print(f"valores categoricos tipo {data_frame_limpio['tipo'].value_counts()}")