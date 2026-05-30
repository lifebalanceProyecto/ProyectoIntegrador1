from datetime import datetime, timedelta
import random

def simular_usuarios(numeroUsuarios):

    # semillas de datos
    listaNombres = [
        "Camila Gomez",
        "Pedro Perez",
        "Juan Ramirez",
        "David Carvajal",
        "Alexander Ruiz",
        "Julian Cuartas"
    ]

    listaCorreos = [
        "camila123@yopmail.com",
        "hermoxx123@yopmail.com",
        "bebe@yopmail.com",
        "terreneitor@yopmail.com",
        "cuajo@yopmail.com",
        "alien@yopmail.com"
    ]

    listaPass = [
        "ASD123",
        "DSA47",
        "KRE765",
        "KOF654",
        "KOL000",
        "POP666",
        "KKK898"
    ]

    # nuevos tipos de sexo
    listaSexo = [
        "femenino",
        "masculino",
        "otro",
        "prefiero no decir"
    ]

    # nuevos tipos de documento
    listaTipoDocumento = [
        "CC",
        "CE",
        "TI",
        "NIT",
        "PPT",
        "Pasaporte"
    ]

    fechaInicial = datetime(2025, 1, 1)

    usuarios = []

    for _ in range(numeroUsuarios):

        fechaSimulada = fechaInicial + timedelta(
            days=random.randint(0, 365)
        )

        usuario = {

            # id interno del sistema
            "id": random.randint(1, 999999),

            # nuevo campo
            "tipo_documento": random.choice(listaTipoDocumento),

            # nuevo campo
            "numero_documento": random.randint(10000000, 999999999),

            "nombre": random.choice(listaNombres),

            "correo": random.choice(listaCorreos),

            "contrasena": random.choice(listaPass),

            "sexo": random.choice(listaSexo),

            "fecha_creacion": fechaSimulada.strftime("%Y/%m/%d")
        }

        # inyección de errores
        probabilidadError = random.random()

        if probabilidadError < 0.1:

            usuario["numero_documento"] = random.choice([
                None,
                -1,
                0
            ])

            usuario["nombre"] = " " + usuario["nombre"] + " "

        elif probabilidadError < 0.2:

            usuario["correo"] = random.choice([
                "sin_arroba.com",
                "correo@.com",
                "correo@gmail",
                "",
                None
            ])

        elif probabilidadError < 0.3:

            usuario["contrasena"] = random.choice([
                "123",
                "abc",
                "",
                None
            ])

        elif probabilidadError < 0.4:

            usuario["sexo"] = random.choice([
                "desconocido",
                "",
                None
            ])

        elif probabilidadError < 0.5:

            usuario["fecha_creacion"] = None

        elif probabilidadError < 0.6:

            usuario["fecha_creacion"] = fechaSimulada.strftime("%d-%m-%Y")

        elif probabilidadError < 0.7:

            usuario["nombre"] = random.choice([
                "",
                None
            ])

        elif probabilidadError < 0.8:

            usuario["tipo_documento"] = random.choice([
                "",
                None,
                "ABC"
            ])

        elif probabilidadError < 0.9:

            usuario["numero_documento"] = random.choice([
                "ABC123",
                "",
                None,
                -999
            ])

        else:

            usuario["numero_documento"] = None
            usuario["correo"] = "malcorreo"
            usuario["contrasena"] = "123"

        usuarios.append(usuario)

    return usuarios