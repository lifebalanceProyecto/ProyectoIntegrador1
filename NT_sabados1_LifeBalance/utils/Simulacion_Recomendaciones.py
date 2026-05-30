from datetime import datetime, timedelta
import random

def simulacion_recomendaciones(numero_recomendaciones=10):

    lista_recomendaciones = [
        "Recomendación 1: Mantén una dieta equilibrada y saludable.",
        "Recomendación 2: Realiza ejercicio regularmente para mantener un estilo de vida activo.",
        "Recomendación 3: Duerme al menos 7-8 horas por noche para asegurar un buen descanso.",
        "Recomendación 4: Bebe suficiente agua para mantener tu cuerpo hidratado.",
        "Recomendación 5: Evita el consumo excesivo de alcohol y tabaco para proteger tu salud."
    ]

    listaCodigo = ["RO1", "RO2", "RO3", "RO4", "RO5"]

    fechainicial = datetime(2025, 1, 1)

    recomendaciones = []

    # número de registros a generar (puedes cambiarlo)
    for _ in range(numero_recomendaciones):
        fechasimulada = fechainicial + timedelta(days=random.randint(0, 365))

        recomendacion = {
            "id": random.randint(1, 500),
            "usuario_id": f"Usuario{random.randint(1, 100)}",
            "sesion_id": f"Sesion{random.randint(1, 100)}",
            "motivo": random.choice(["Salud", "Bienestar", "Ejercicio", "Dieta", "Descanso"]),
            "lista_recomendaciones": random.choice(lista_recomendaciones),
            "codigo_recomendacion": random.choice(listaCodigo),
            "fecha": fechasimulada.strftime("%Y-%m-%d")
        }

        #  Inyección de errores controlados (procesos estocásticos)
        probabilidadError = random.random()

        if probabilidadError < 0.1:  # 10%
            recomendacion["id"] = random.choice([None, -1, 0])  # Error: id inválido
            recomendacion["usuario_id"] = ""  # Error: usuario vacío

        elif probabilidadError < 0.25:  # 15%
            recomendacion["fecha"] = None  # Error: fecha nula

        elif probabilidadError < 0.4:  # 15%
            recomendacion["codigo_recomendacion"] = recomendacion["codigo_recomendacion"].lower()  # Error formato
            recomendacion["lista_recomendaciones"] = "Texto incorrecto"  # Error inconsistencia

        elif probabilidadError < 0.7:  # 30%
            recomendacion["sesion_id"] = None  # Error: sesión faltante

        elif probabilidadError < 0.9:  # 20%
            recomendacion["motivo"] = random.choice(["Comida basura", "Sedentarismo"])  # Error: valores fuera de catálogo

        # 10% restante queda sin errores (datos correctos)

    
        recomendaciones.append(recomendacion)

    return recomendaciones