package com.example.LifeBalance.Servicio;

import com.example.LifeBalance.Modelo.MUsuario;
import com.example.LifeBalance.Repositorio.IUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SUsuario {

    @Autowired
    IUsuario iUsuario;

    public SUsuario(IUsuario iUsuario) {
        this.iUsuario = iUsuario;
    }

    // Adicionar un usuario
    public MUsuario adicionarUsuario(MUsuario mUsuario) throws Exception {
        try {
            if (iUsuario.existsByCorreo(mUsuario.getCorreo()))
                throw new Exception("Ya existe un usuario con el correo: " + mUsuario.getCorreo());
            return iUsuario.save(mUsuario);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta general de todos los usuarios
    public List<MUsuario> consultaGeneralUsuarios() throws Exception {
        try {
            return iUsuario.findAll();
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta individual por ID
    public MUsuario consultaIndividualID(String idUsuario) throws Exception {
        try {
            Optional<MUsuario> registroEncontrado = iUsuario.findById(idUsuario);
            if (registroEncontrado.isPresent())
                return registroEncontrado.get();
            else
                throw new Exception("Usuario no registrado");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Consulta individual por correo
    public MUsuario consultaIndividualCorreo(String correo) throws Exception {
        try {
            Optional<MUsuario> registroEncontrado = iUsuario.findByCorreo(correo);
            if (registroEncontrado.isPresent())
                return registroEncontrado.get();
            else
                throw new Exception("Usuario no encontrado con correo: " + correo);
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Login por correo y contraseña
    public MUsuario login(String correo, String contrasena) throws Exception {
        try {
            Optional<MUsuario> registroEncontrado = iUsuario.findByCorreoAndContrasena(correo, contrasena);
            if (registroEncontrado.isPresent())
                return registroEncontrado.get();
            else
                throw new Exception("Correo o contraseña incorrectos");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }

    // Modificar un usuario
    public MUsuario modificarUsuario(String idUsuario, MUsuario mUsuario) throws Exception {
        try {
            Optional<MUsuario> registroEncontrado = iUsuario.findById(idUsuario);
            if (registroEncontrado.isPresent()) {
                MUsuario nuevoRegistro = registroEncontrado.get();
                
                // ✅ Actualizar TODOS los campos (incluyendo telefono y tipoDocumento)
                nuevoRegistro.setNombre(mUsuario.getNombre());
                nuevoRegistro.setCorreo(mUsuario.getCorreo());
                nuevoRegistro.setTipoDocumento(mUsuario.getTipoDocumento());  // ✅ NUEVO
                nuevoRegistro.setTelefono(mUsuario.getTelefono());             // ✅ NUEVO
                
                // Solo actualizar contraseña si viene en el body (no null/vacía)
                if (mUsuario.getContrasena() != null && !mUsuario.getContrasena().isEmpty()) {
                    nuevoRegistro.setContrasena(mUsuario.getContrasena());
                }
                
                nuevoRegistro.setFechaNacimiento(mUsuario.getFechaNacimiento());
                nuevoRegistro.setSexo(mUsuario.getSexo());
                nuevoRegistro.setActivo(mUsuario.isActivo());
                if (mUsuario.getRol() != null) nuevoRegistro.setRol(mUsuario.getRol());
                
                System.out.println("✅ Actualizando usuario: " + idUsuario);
                System.out.println("   Nombre: " + nuevoRegistro.getNombre());
                System.out.println("   Teléfono: " + nuevoRegistro.getTelefono());
                System.out.println("   TipoDocumento: " + nuevoRegistro.getTipoDocumento());
                
                return iUsuario.save(nuevoRegistro);
            } else
                throw new Exception("No se puede modificar porque el usuario no está registrado");
        } catch (Exception error) {
            System.err.println("❌ Error en modificarUsuario: " + error.getMessage());
            throw new Exception(error.getMessage());
        }
    }

    // Eliminar un usuario
    public Boolean eliminarUsuario(String idUsuario) throws Exception {
        try {
            Optional<MUsuario> registroEncontrado = iUsuario.findById(idUsuario);
            if (registroEncontrado.isPresent()) {
                iUsuario.deleteById(idUsuario);
                return true;
            } else
                throw new Exception("No se puede eliminar porque el usuario no está registrado");
        } catch (Exception error) {
            throw new Exception(error.getMessage());
        }
    }
}
