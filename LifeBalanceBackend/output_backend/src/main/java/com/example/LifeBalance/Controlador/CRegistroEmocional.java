package com.example.LifeBalance.Controlador;

import com.example.LifeBalance.Modelo.MRegistroEmocional;
import com.example.LifeBalance.Modelo.MUsuario;
import com.example.LifeBalance.Servicio.SRegistroEmocional;
import com.example.LifeBalance.Servicio.SUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registros-emocionales")
public class CRegistroEmocional {

    @Autowired
    SRegistroEmocional sRegistroEmocional;

    @Autowired
    SUsuario sUsuario;

    public CRegistroEmocional(SRegistroEmocional sRegistroEmocional, SUsuario sUsuario) {
        this.sRegistroEmocional = sRegistroEmocional;
        this.sUsuario = sUsuario;
    }

    /**
     * GET /api/registros-emocionales/usuario/{idUsuario}
     * Lista todos los registros emocionales de un usuario por su cédula
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable String idUsuario) {
        try {
            System.out.println("📊 Consultando registros para usuario: " + idUsuario);
            List<MRegistroEmocional> lista = sRegistroEmocional.consultaGeneralPorUsuario(idUsuario);
            System.out.println("✅ Se encontraron " + lista.size() + " registros");
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            System.err.println("❌ Error en listarPorUsuario: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * GET /api/registros-emocionales/{id}
     * Busca un registro emocional individual por su ID de registro
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        try {
            MRegistroEmocional registro = sRegistroEmocional.consultaIndividualID(id);
            return ResponseEntity.ok(registro);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * GET /api/registros-emocionales/usuario/{idUsuario}/rango
     * Lista registros emocionales en un rango de fechas
     * ?inicio=2024-01-01&fin=2024-12-31
     * 
     * IMPORTANTE: Esta ruta debe ir DESPUÉS de /usuario/{idUsuario} para evitar conflictos
     */
    @GetMapping("/usuario/{idUsuario}/rango")
    public ResponseEntity<?> listarPorRango(
            @PathVariable String idUsuario,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        try {
            System.out.println("📅 Consultando registros entre " + inicio + " y " + fin);
            List<MRegistroEmocional> lista = sRegistroEmocional.consultaPorRango(idUsuario, inicio, fin);
            System.out.println("✅ Se encontraron " + lista.size() + " registros en rango");
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            System.err.println("❌ Error en listarPorRango: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * POST /api/registros-emocionales
     * Guarda un nuevo registro emocional
     * 
     * ✅ VALIDACIONES AGREGADAS EN CONTROLADOR:
     * - Usuario debe existir
     * - Nivel de ánimo debe estar entre 1-10
     * - Fecha debe ser válida (no nula)
     * 
     * Body esperado:
     * {
     *   "usuario": { "id": "1234567890" },
     *   "nivelAnimo": 7,
     *   "comentario": "Me siento bien hoy",
     *   "fecha": "2024-12-20"  ← OPCIONAL (si no viene, usa hoy)
     * }
     */
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody MRegistroEmocional mRegistroEmocional) {
        try {
            System.out.println("📤 POST /api/registros-emocionales recibido");
            System.out.println("   Datos: " + mRegistroEmocional.toString());

            // ✅ VALIDACIÓN 1: Usuario debe venir en el body
            if (mRegistroEmocional.getUsuario() == null) {
                System.err.println("❌ Error: usuario es null");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El campo 'usuario' es obligatorio"));
            }

            String cedulaUsuario = mRegistroEmocional.getUsuario().getId();
            
            // ✅ VALIDACIÓN 2: Cédula no debe estar vacía
            if (cedulaUsuario == null || cedulaUsuario.isBlank()) {
                System.err.println("❌ Error: usuario.id está vacío");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Debe especificar la cédula del usuario en 'usuario.id'"));
            }

            // ✅ VALIDACIÓN 3: Usuario debe existir en BD
            try {
                MUsuario usuarioBd = sUsuario.consultaIndividualID(cedulaUsuario);
                System.out.println("✅ Usuario encontrado: " + usuarioBd.getNombre());
                mRegistroEmocional.setUsuario(usuarioBd);
            } catch (Exception e) {
                System.err.println("❌ Error: usuario no existe en BD - " + cedulaUsuario);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El usuario con cédula '" + cedulaUsuario + "' no existe"));
            }

            // ✅ VALIDACIÓN 4: Nivel de ánimo debe estar entre 1-10
            if (mRegistroEmocional.getNivelAnimo() < 1 || mRegistroEmocional.getNivelAnimo() > 10) {
                System.err.println("❌ Error: nivelAnimo inválido - " + mRegistroEmocional.getNivelAnimo());
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El nivel de ánimo debe estar entre 1 y 10. Recibido: " + mRegistroEmocional.getNivelAnimo()));
            }

            // ✅ VALIDACIÓN 5: Fecha debe ser válida (si viene)
            if (mRegistroEmocional.getFecha() == null) {
                System.out.println("📅 Fecha no viene en request, asignando hoy: " + LocalDate.now());
                mRegistroEmocional.setFecha(LocalDate.now());
            } else {
                System.out.println("📅 Fecha recibida: " + mRegistroEmocional.getFecha());
            }

            // ✅ Todas las validaciones pasaron, guardar en BD
            System.out.println("💾 Guardando en BD...");
            MRegistroEmocional nuevo = sRegistroEmocional.adicionarRegistroEmocional(mRegistroEmocional);
            
            System.out.println("✅✅✅ Registro emocional GUARDADO exitosamente en BD");
            System.out.println("   ID: " + nuevo.getId() + 
                             ", Usuario: " + cedulaUsuario + 
                             ", Ánimo: " + nuevo.getNivelAnimo() + 
                             ", Fecha: " + nuevo.getFecha());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
            
        } catch (Exception error) {
            System.err.println("❌❌❌ Error CRÍTICO al guardar: " + error.getMessage());
            error.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * POST /api/registros-emocionales/admin
     * Endpoint exclusivo de admin para crear registros emocionales
     * Útil para datos históricos o pruebas
     */
    @PostMapping("/admin")
    public ResponseEntity<?> guardarDesdeAdmin(@RequestBody Map<String, Object> dto) {
        try {
            System.out.println("📤 POST /api/registros-emocionales/admin recibido");
            System.out.println("   DTO: " + dto.toString());

            // Validar idUsuario
            if (!dto.containsKey("idUsuario") || dto.get("idUsuario") == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El campo 'idUsuario' es obligatorio"));
            }

            String idUsuario = dto.get("idUsuario").toString();

            // Verificar que el usuario existe
            MUsuario usuario = sUsuario.consultaIndividualID(idUsuario);
            System.out.println("✅ Usuario admin encontrado: " + usuario.getNombre());

            MRegistroEmocional rec = new MRegistroEmocional();
            rec.setUsuario(usuario);

            // Validar nivelAnimo (obligatorio)
            if (dto.containsKey("nivelAnimo") && dto.get("nivelAnimo") != null) {
                int nivel = Integer.parseInt(dto.get("nivelAnimo").toString());
                if (nivel < 1 || nivel > 10) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "El nivel de ánimo debe estar entre 1 y 10"));
                }
                rec.setNivelAnimo(nivel);
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El campo 'nivelAnimo' es obligatorio"));
            }

            // Comentario (opcional)
            if (dto.containsKey("comentario") && dto.get("comentario") != null) {
                rec.setComentario(dto.get("comentario").toString());
            }

            // Fecha (si no viene, usa hoy)
            if (dto.containsKey("fecha") && dto.get("fecha") != null) {
                rec.setFecha(LocalDate.parse(dto.get("fecha").toString()));
            } else {
                rec.setFecha(LocalDate.now());
            }

            System.out.println("💾 Guardando registro admin...");
            MRegistroEmocional nuevo = sRegistroEmocional.adicionarRegistroEmocional(rec);
            
            System.out.println("✅ Registro emocional ADMIN guardado: ID=" + nuevo.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
            
        } catch (Exception error) {
            System.err.println("❌ Error en guardarDesdeAdmin: " + error.getMessage());
            error.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * PUT /api/registros-emocionales/{id}
     * Actualiza un registro emocional existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable int id, @RequestBody MRegistroEmocional mRegistroEmocional) {
        try {
            System.out.println("✏️ PUT /api/registros-emocionales/" + id);
            MRegistroEmocional actualizado = sRegistroEmocional.modificarRegistroEmocional(id, mRegistroEmocional);
            System.out.println("✅ Registro actualizado: ID=" + id);
            return ResponseEntity.ok(actualizado);
        } catch (Exception error) {
            System.err.println("❌ Error en actualizar: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * DELETE /api/registros-emocionales/{id}
     * Elimina un registro emocional
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        try {
            System.out.println("🗑️ DELETE /api/registros-emocionales/" + id);
            Boolean resultado = sRegistroEmocional.eliminarRegistroEmocional(id);
            System.out.println("✅ Registro eliminado: ID=" + id);
            return ResponseEntity.ok(Map.of("eliminado", resultado));
        } catch (Exception error) {
            System.err.println("❌ Error en eliminar: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }
}
