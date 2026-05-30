package com.example.LifeBalance.Servicio;

import com.example.LifeBalance.Modelo.MSesion;
import com.example.LifeBalance.Modelo.MUsuario;
import com.example.LifeBalance.Repositorio.ISesion;
import com.example.LifeBalance.Repositorio.IUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SSesion {

    @Autowired
    ISesion iSesion;

    @Autowired
    IUsuario iUsuario;

    public SSesion(ISesion iSesion, IUsuario iUsuario) {
        this.iSesion = iSesion;
        this.iUsuario = iUsuario;
    }

    /**
     * Adicionar o recuperar una sesión
     * Si ya existe por nombre la devuelve
     * Si no existe y viene usuario, lo valida y asigna el ID
     */
    public MSesion adicionarORecuperarSesion(MSesion mSesion) throws Exception {
        try {
            // Buscar si ya existe por nombre
            Optional<MSesion> registroEncontrado = iSesion.findByNombre(mSesion.getNombre());
            if (registroEncontrado.isPresent()) {
                System.out.println("✅ Sesión encontrada: " + mSesion.getNombre());
                return registroEncontrado.get();
            }

            // ✅ Si viene usuario, validarlo y asignar solo el usuarioId
            if (mSesion.getUsuarioId() != null && !mSesion.getUsuarioId().isBlank()) {
                String cedulaUsuario = mSesion.getUsuarioId().trim();
                Optional<MUsuario> usuarioBd = iUsuario.findById(cedulaUsuario);
                if (!usuarioBd.isPresent()) {
                    throw new Exception("El usuario con cédula '" + cedulaUsuario + "' no existe");
                }
                System.out.println("✅ Usuario validado para sesión: " + cedulaUsuario);
            }

            // Guardar nueva sesión
            MSesion guardada = iSesion.save(mSesion);
            System.out.println("✅ Sesión creada: " + guardada.getNombre() + " (ID=" + guardada.getId() + ", usuarioId=" + guardada.getUsuarioId() + ")");
            return guardada;
        } catch (Exception error) {
            System.err.println("❌ Error en adicionarORecuperarSesion: " + error.getMessage());
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Consulta general de todas las sesiones
     * ✅ SIMPLE: Sin cargar relaciones
     */
    public List<MSesion> consultaGeneralSesiones() throws Exception {
        try {
            System.out.println("📊 Consultando todas las sesiones...");
            List<MSesion> sesiones = iSesion.findAll();
            System.out.println("✅ Se encontraron " + sesiones.size() + " sesiones");
            return sesiones;
        } catch (Exception error) {
            System.err.println("❌ Error en consultaGeneralSesiones: " + error.getMessage());
            error.printStackTrace();
            throw new Exception("Error al consultar sesiones: " + error.getMessage());
        }
    }

    /**
     * Consulta individual por ID
     */
    public MSesion consultaIndividualID(int idSesion) throws Exception {
        try {
            Optional<MSesion> registroEncontrado = iSesion.findById(idSesion);
            if (registroEncontrado.isPresent()) {
                return registroEncontrado.get();
            } else
                throw new Exception("Sesión no registrada");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Consulta individual por nombre
     */
    public MSesion consultaIndividualNombre(String nombre) throws Exception {
        try {
            Optional<MSesion> registroEncontrado = iSesion.findByNombre(nombre);
            if (registroEncontrado.isPresent()) {
                return registroEncontrado.get();
            } else
                throw new Exception("Sesión no encontrada con nombre: " + nombre);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Consulta por tipo
     */
    public List<MSesion> consultaPorTipo(String tipo) throws Exception {
        try {
            System.out.println("🔍 Buscando sesiones por tipo: " + tipo);
            List<MSesion> sesiones = iSesion.findByTipo(tipo);
            System.out.println("✅ Se encontraron " + sesiones.size() + " sesiones de tipo " + tipo);
            return sesiones;
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Modificar una sesión
     */
    public MSesion modificarSesion(int idSesion, MSesion mSesion) throws Exception {
        try {
            Optional<MSesion> registroEncontrado = iSesion.findById(idSesion);
            if (registroEncontrado.isPresent()) {
                MSesion nuevoRegistro = registroEncontrado.get();
                nuevoRegistro.setNombre(mSesion.getNombre());
                nuevoRegistro.setTipo(mSesion.getTipo());
                nuevoRegistro.setDuracion(mSesion.getDuracion());

                // Si viene usuarioId, validarlo
                if (mSesion.getUsuarioId() != null && !mSesion.getUsuarioId().isBlank()) {
                    String cedulaUsuario = mSesion.getUsuarioId().trim();
                    Optional<MUsuario> usuarioBd = iUsuario.findById(cedulaUsuario);
                    if (!usuarioBd.isPresent()) {
                        throw new Exception("El usuario no existe");
                    }
                    nuevoRegistro.setUsuarioId(cedulaUsuario);
                }

                System.out.println("✅ Sesión actualizada: " + idSesion);
                return iSesion.save(nuevoRegistro);
            } else
                throw new Exception("No se puede modificar porque la sesión no está registrada");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Eliminar una sesión
     */
    public Boolean eliminarSesion(int idSesion) throws Exception {
        try {
            Optional<MSesion> registroEncontrado = iSesion.findById(idSesion);
            if (registroEncontrado.isPresent()) {
                iSesion.deleteById(idSesion);
                System.out.println("✅ Sesión eliminada: " + idSesion);
                return true;
            } else
                throw new Exception("No se puede eliminar porque la sesión no está registrada");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }
}