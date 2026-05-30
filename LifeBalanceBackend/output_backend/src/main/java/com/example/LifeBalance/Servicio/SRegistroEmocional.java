package com.example.LifeBalance.Servicio;

import com.example.LifeBalance.Modelo.MRegistroEmocional;
import com.example.LifeBalance.Modelo.MUsuario;
import com.example.LifeBalance.Repositorio.IRegistroEmocional;
import com.example.LifeBalance.Repositorio.IUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SRegistroEmocional {

    @Autowired
    IRegistroEmocional iRegistroEmocional;

    @Autowired
    IUsuario iUsuario;

    public SRegistroEmocional(IRegistroEmocional iRegistroEmocional, IUsuario iUsuario) {
        this.iRegistroEmocional = iRegistroEmocional;
        this.iUsuario = iUsuario;
    }

    /**
     * Adicionar un registro emocional validando:
     * 1. Nivel de ánimo entre 1-10
     * 2. Usuario existe en BD por cédula
     * 3. Fecha no sea nula
     * 
     * @param mRegistroEmocional Registro a guardar
     * @return MRegistroEmocional guardado en BD
     * @throws Exception Si hay validación fallida
     */
    @Transactional
    public MRegistroEmocional adicionarRegistroEmocional(MRegistroEmocional mRegistroEmocional) throws Exception {
        try {
            // Validar nivel de ánimo
            if (mRegistroEmocional.getNivelAnimo() < 1 || mRegistroEmocional.getNivelAnimo() > 10) {
                throw new Exception("El nivel de ánimo debe estar entre 1 y 10. Recibido: " + mRegistroEmocional.getNivelAnimo());
            }

            // Validar que venga el usuario con cédula
            if (mRegistroEmocional.getUsuario() == null || mRegistroEmocional.getUsuario().getId() == null || 
                mRegistroEmocional.getUsuario().getId().isBlank()) {
                throw new Exception("No se puede registrar la emoción sin especificar la cédula del usuario.");
            }

            String cedulaUsuario = mRegistroEmocional.getUsuario().getId().trim();

            // Validar que el usuario exista en BD
            Optional<MUsuario> usuarioBd = iUsuario.findById(cedulaUsuario);
            if (!usuarioBd.isPresent()) {
                throw new Exception("El usuario con cédula '" + cedulaUsuario + "' no existe en el sistema.");
            }

            // Asignar el usuario completo desde BD
            mRegistroEmocional.setUsuario(usuarioBd.get());

            // Asegurar que tenga fecha (si es nula, asignar actual)
            if (mRegistroEmocional.getFecha() == null) {
                mRegistroEmocional.setFecha(LocalDate.now());
            }

            // Guardar en BD
            MRegistroEmocional guardado = iRegistroEmocional.save(mRegistroEmocional);
            
            System.out.println("✅ Registro emocional guardado: ID=" + guardado.getId() + 
                             ", Usuario=" + cedulaUsuario + 
                             ", Ánimo=" + guardado.getNivelAnimo() + 
                             ", Fecha=" + guardado.getFecha());
            
            return guardado;

        } catch (Exception error) {
            System.err.println("❌ Error al guardar registro emocional: " + error.getMessage());
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Consulta todos los registros emocionales de un usuario por su cédula
     */
    @Transactional(readOnly = true)
    public List<MRegistroEmocional> consultaGeneralPorUsuario(String idUsuario) throws Exception {
        try {
            List<MRegistroEmocional> registros = iRegistroEmocional.findByUsuario_Id(idUsuario);
            System.out.println("📊 Se encontraron " + registros.size() + " registros para usuario: " + idUsuario);
            return registros;
        } catch (Exception error) {
            throw new Exception("Error al consultar registros del usuario: " + error.getMessage());
        }
    }

    /**
     * Consulta un registro emocional individual por su ID de registro
     */
    @Transactional(readOnly = true)
    public MRegistroEmocional consultaIndividualID(int idRegistro) throws Exception {
        try {
            Optional<MRegistroEmocional> registroEncontrado = iRegistroEmocional.findById(idRegistro);
            if (registroEncontrado.isPresent()) {
                return registroEncontrado.get();
            } else {
                throw new Exception("Registro emocional con ID " + idRegistro + " no encontrado");
            }
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Consulta registros emocionales en un rango de fechas para un usuario
     */
    @Transactional(readOnly = true)
    public List<MRegistroEmocional> consultaPorRango(String idUsuario, LocalDate inicio, LocalDate fin) throws Exception {
        try {
            if (inicio.isAfter(fin)) {
                throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
            }
            List<MRegistroEmocional> registros = iRegistroEmocional.findByUsuario_IdAndFechaBetween(idUsuario, inicio, fin);
            System.out.println("📅 Se encontraron " + registros.size() + " registros entre " + inicio + " y " + fin);
            return registros;
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Modifica un registro emocional existente
     */
    @Transactional
    public MRegistroEmocional modificarRegistroEmocional(int idRegistro, MRegistroEmocional mRegistroEmocional) throws Exception {
        try {
            Optional<MRegistroEmocional> registroEncontrado = iRegistroEmocional.findById(idRegistro);
            
            if (registroEncontrado.isPresent()) {
                // Validar nivel de ánimo si viene en la actualización
                if (mRegistroEmocional.getNivelAnimo() < 1 || mRegistroEmocional.getNivelAnimo() > 10) {
                    throw new Exception("El nivel de ánimo debe estar entre 1 y 10");
                }

                MRegistroEmocional nuevoRegistro = registroEncontrado.get();
                
                // Actualizar campos
                nuevoRegistro.setNivelAnimo(mRegistroEmocional.getNivelAnimo());
                nuevoRegistro.setComentario(mRegistroEmocional.getComentario());
                
                if (mRegistroEmocional.getFecha() != null) {
                    nuevoRegistro.setFecha(mRegistroEmocional.getFecha());
                }

                MRegistroEmocional actualizado = iRegistroEmocional.save(nuevoRegistro);
                System.out.println("✏️  Registro emocional actualizado: ID=" + idRegistro);
                return actualizado;
            } else {
                throw new Exception("No se puede modificar: el registro emocional ID " + idRegistro + " no existe");
            }
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    /**
     * Elimina un registro emocional
     */
    @Transactional
    public Boolean eliminarRegistroEmocional(int idRegistro) throws Exception {
        try {
            Optional<MRegistroEmocional> registroEncontrado = iRegistroEmocional.findById(idRegistro);
            
            if (registroEncontrado.isPresent()) {
                iRegistroEmocional.deleteById(idRegistro);
                System.out.println("🗑️  Registro emocional eliminado: ID=" + idRegistro);
                return true;
            } else {
                throw new Exception("No se puede eliminar: el registro emocional ID " + idRegistro + " no existe");
            }
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }
}
