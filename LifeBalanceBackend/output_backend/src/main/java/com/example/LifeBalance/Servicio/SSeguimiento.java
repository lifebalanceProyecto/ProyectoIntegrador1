package com.example.LifeBalance.Servicio;

import com.example.LifeBalance.Modelo.MSeguimiento;
import com.example.LifeBalance.Repositorio.ISeguimiento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SSeguimiento {

    @Autowired
    ISeguimiento iSeguimiento;

    public SSeguimiento(ISeguimiento iSeguimiento) {
        this.iSeguimiento = iSeguimiento;
    }

    // Adicionar un registro de seguimiento
    public MSeguimiento adicionarSeguimiento(MSeguimiento mSeguimiento) throws Exception {
        try {
            return iSeguimiento.save(mSeguimiento);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general por usuario
    public List<MSeguimiento> consultaGeneralPorUsuario(String idUsuario) throws Exception {
        try {
            return iSeguimiento.findByUsuario_Id(idUsuario);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta individual por ID
    public MSeguimiento consultaIndividualID(int idSeguimiento) throws Exception {
        try {
            Optional<MSeguimiento> registroEncontrado = iSeguimiento.findById(idSeguimiento);
            if (registroEncontrado.isPresent())
                return registroEncontrado.get();
            else
                throw new Exception("Seguimiento no encontrado");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por usuario y sesión
    public List<MSeguimiento> consultaPorUsuarioYSesion(String idUsuario, int idSesion) throws Exception {
        try {
            return iSeguimiento.findByUsuario_IdAndSesion_Id(idUsuario, idSesion);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta por rango de fechas
    public List<MSeguimiento> consultaPorRango(String idUsuario, LocalDate inicio, LocalDate fin) throws Exception {
        try {
            return iSeguimiento.findByUsuario_IdAndFechaBetween(idUsuario, inicio, fin);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Contar sesiones completadas
    public long contarCompletadas(String idUsuario) throws Exception {
        try {
            return iSeguimiento.countByUsuario_IdAndCompletadoTrue(idUsuario);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Modificar un seguimiento
    public MSeguimiento modificarSeguimiento(int idSeguimiento, MSeguimiento mSeguimiento) throws Exception {
        try {
            Optional<MSeguimiento> registroEncontrado = iSeguimiento.findById(idSeguimiento);
            if (registroEncontrado.isPresent()) {
                MSeguimiento nuevoRegistro = registroEncontrado.get();
                nuevoRegistro.setCompletado(mSeguimiento.isCompletado());
                nuevoRegistro.setFecha(mSeguimiento.getFecha());
                return iSeguimiento.save(nuevoRegistro);
            } else
                throw new Exception("No se puede modificar porque el seguimiento no está registrado");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar un seguimiento
    public Boolean eliminarSeguimiento(int idSeguimiento) throws Exception {
        try {
            Optional<MSeguimiento> registroEncontrado = iSeguimiento.findById(idSeguimiento);
            if (registroEncontrado.isPresent()) {
                iSeguimiento.deleteById(idSeguimiento);
                return true;
            } else
                throw new Exception("No se puede eliminar porque el seguimiento no está registrado");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }
}