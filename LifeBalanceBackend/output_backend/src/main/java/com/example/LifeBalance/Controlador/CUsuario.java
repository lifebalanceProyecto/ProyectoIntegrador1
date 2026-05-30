package com.example.LifeBalance.Controlador;

import com.example.LifeBalance.Modelo.MUsuario;
import com.example.LifeBalance.Servicio.SUsuario;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class CUsuario {

    @Autowired
    SUsuario sUsuario;

    public CUsuario(SUsuario sUsuario) {
        this.sUsuario = sUsuario;
    }

    // ─── Manejador global de errores de validación ───────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> manejarErroresValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errores.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errores);
    }

    // ─── Endpoints de USUARIO ─────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> listarTodos() {
        try {
            List<MUsuario> lista = sUsuario.consultaGeneralUsuarios();
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable String id) {
        try {
            MUsuario usuario = sUsuario.consultaIndividualID(id);
            return ResponseEntity.ok(usuario);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/correo/{correo}")
    public ResponseEntity<?> buscarPorCorreo(@PathVariable String correo) {
        try {
            MUsuario usuario = sUsuario.consultaIndividualCorreo(correo);
            return ResponseEntity.ok(usuario);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> guardar(@Valid @RequestBody MUsuario mUsuario) {
        try {
            MUsuario nuevo = sUsuario.adicionarUsuario(mUsuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        try {
            String correo     = credenciales.get("correo");
            String contrasena = credenciales.get("contrasena");

            // ─── Validación manual en login (no usa @Valid porque es un Map) ───
            if (correo == null || correo.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "El correo es obligatorio"));
            if (!correo.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))
                return ResponseEntity.badRequest().body(Map.of("error", "El correo no tiene un formato válido"));
            if (contrasena == null || contrasena.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña es obligatoria"));
            if (contrasena.length() < 8)
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 8 caracteres"));

            MUsuario usuario = sUsuario.login(correo, contrasena);
            return ResponseEntity.ok(usuario);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id,
                                        @Valid @RequestBody MUsuario mUsuario) {
        try {
            MUsuario actualizado = sUsuario.modificarUsuario(id, mUsuario);
            return ResponseEntity.ok(actualizado);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            Boolean resultado = sUsuario.eliminarUsuario(id);
            return ResponseEntity.ok(Map.of("eliminado", resultado));
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    // ─── Endpoints exclusivos de ADMIN ───────────────────────────────────────

    /**
     * GET /api/usuarios/admin/resumen
     * ✅ CORREGIDO: Devuelve directamente el ARRAY de usuarios (no un objeto)
     * Antes devolvía: {usuarios: [...]}
     * Ahora devuelve: [...]
     */
    @GetMapping("/admin/resumen")
    public ResponseEntity<?> resumenAdmin() {
        try {
            System.out.println("📊 GET /api/usuarios/admin/resumen");
            List<MUsuario> lista = sUsuario.consultaGeneralUsuarios();
            System.out.println("✅ Se encontraron " + lista.size() + " usuarios");
            return ResponseEntity.ok(lista);  // ✅ Devuelve directo el array
        } catch (Exception error) {
            System.err.println("❌ Error en resumenAdmin: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * PATCH /api/usuarios/{id}/rol
     * Cambia el rol de un usuario (USUARIO / ADMIN).
     */
    @PatchMapping("/{id}/rol")
    public ResponseEntity<?> cambiarRol(@PathVariable String id,
                                        @RequestBody Map<String, String> body) {
        try {
            String nuevoRol = body.get("rol");
            if (nuevoRol == null || nuevoRol.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "El campo 'rol' es obligatorio"));
            if (!nuevoRol.equals("ADMIN") && !nuevoRol.equals("USUARIO"))
                return ResponseEntity.badRequest().body(Map.of("error", "Rol inválido. Use ADMIN o USUARIO"));

            System.out.println("🔄 PATCH /api/usuarios/" + id + "/rol → " + nuevoRol);
            MUsuario usuario = sUsuario.consultaIndividualID(id);
            usuario.setRol(nuevoRol);
            MUsuario actualizado = sUsuario.modificarUsuario(id, usuario);
            System.out.println("✅ Rol actualizado: " + id + " → " + nuevoRol);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Rol actualizado correctamente",
                    "usuario", actualizado
            ));
        } catch (Exception error) {
            System.err.println("❌ Error en cambiarRol: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * DELETE /api/usuarios/admin/{id}
     * Eliminación administrativa (con mensaje de confirmación).
     */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> eliminarAdmin(@PathVariable String id) {
        try {
            Boolean resultado = sUsuario.eliminarUsuario(id);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Usuario eliminado por administrador",
                    "eliminado", resultado
            ));
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }
}
