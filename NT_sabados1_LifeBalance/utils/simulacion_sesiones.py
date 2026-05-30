import random

def simular_sesiones(numeroSesiones):
    

    listaNombres=["Meditacion para dormir","Respiracion","Pausa Activa Oficina","Estiramiento"]
    listaTipo=["Meditacion","Respiracion","Pausa","Estiramiento"]
    listaMinutos=[5,10,15,20]

    sesiones=[]

    for _ in range(numeroSesiones):
        sesion={
            "id":random.randint(1,100),
            "nombre":random.choice(listaNombres),
            "tipo":random.choice(listaTipo),
            "duracion":random.choice(listaMinutos)
        }

        probalidadError=random.random()
        if probalidadError<0.1:
            sesion["id"]=random.choice([None,-1,0])
            sesion["nombre"]=" "+ sesion["nombre"]+ " "
        elif probalidadError<0.25:
            sesion["duracion"]=None
        elif probalidadError<0.4:
            sesion["tipo"]=sesion["tipo"].lower()
            sesion["id"]=random.choice([-10000,0,200,None])
        elif probalidadError<0.7:
            sesion["tipo"]=0
        elif probalidadError<0.9:
            sesion["tipo"]=random.choice(["papitas montaneras","gaseosa doble"])
        sesiones.append(sesion)
    
    return sesiones
