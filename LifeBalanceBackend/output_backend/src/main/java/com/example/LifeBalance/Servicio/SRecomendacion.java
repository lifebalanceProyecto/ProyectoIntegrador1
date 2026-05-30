package com.example.LifeBalance.Servicio;

import com.example.LifeBalance.Modelo.MRecomendacion;
import com.example.LifeBalance.Repositorio.IRecomendacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SRecomendacion {

    @Autowired
    IRecomendacion iRecomendacion;

    public SRecomendacion(IRecomendacion iRecomendacion) {
        this.iRecomendacion = iRecomendacion;
    }

    // Adicionar una recomendación
    public MRecomendacion adicionarRecomendacion(MRecomendacion mRecomendacion) throws Exception {
        try {
            return iRecomendacion.save(mRecomendacion);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general por usuario
    public List<MRecomendacion> consultaGeneralPorUsuario(String idUsuario) throws Exception {
        try {
            return iRecomendacion.findByUsuario_Id(idUsuario);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta individual por ID
    public MRecomendacion consultaIndividualID(int idRecomendacion) throws Exception {
        try {
            Optional<MRecomendacion> registroEncontrado = iRecomendacion.findById(idRecomendacion);
            if (registroEncontrado.isPresent())
                return registroEncontrado.get();
            else
                throw new Exception("Recomendación no encontrada");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por usuario y sesión
    public List<MRecomendacion> consultaPorUsuarioYSesion(String idUsuario, int idSesion) throws Exception {
        try {
            return iRecomendacion.findByUsuario_IdAndSesion_Id(idUsuario, idSesion);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Modificar una recomendación
    public MRecomendacion modificarRecomendacion(int idRecomendacion, MRecomendacion mRecomendacion) throws Exception {
        try {
            Optional<MRecomendacion> registroEncontrado = iRecomendacion.findById(idRecomendacion);
            if (registroEncontrado.isPresent()) {
                MRecomendacion nuevoRegistro = registroEncontrado.get();
                nuevoRegistro.setMotivo(mRecomendacion.getMotivo());
                nuevoRegistro.setFecha(mRecomendacion.getFecha());
                nuevoRegistro.setSesion(mRecomendacion.getSesion());
                return iRecomendacion.save(nuevoRegistro);
            } else
                throw new Exception("No se puede modificar porque la recomendación no está registrada");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar una recomendación
    public Boolean eliminarRecomendacion(int idRecomendacion) throws Exception {
        try {
            Optional<MRecomendacion> registroEncontrado = iRecomendacion.findById(idRecomendacion);
            if (registroEncontrado.isPresent()) {
                iRecomendacion.deleteById(idRecomendacion);
                return true;
            } else
                throw new Exception("No se puede eliminar porque la recomendación no está registrada");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }
}
