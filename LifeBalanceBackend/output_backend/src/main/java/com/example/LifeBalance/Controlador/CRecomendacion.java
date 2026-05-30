package com.example.LifeBalance.Controlador;

import com.example.LifeBalance.Modelo.MRecomendacion;
import com.example.LifeBalance.Modelo.MUsuario;
import com.example.LifeBalance.Modelo.MSesion;
import com.example.LifeBalance.Servicio.SRecomendacion;
import com.example.LifeBalance.Servicio.SUsuario;
import com.example.LifeBalance.Servicio.SSesion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recomendaciones")
public class CRecomendacion {

    @Autowired
    SRecomendacion sRecomendacion;

    @Autowired
    SUsuario sUsuario;

    @Autowired
    SSesion sSesion;

    public CRecomendacion(SRecomendacion sRecomendacion, SUsuario sUsuario, SSesion sSesion) {
        this.sRecomendacion = sRecomendacion;
        this.sUsuario       = sUsuario;
        this.sSesion        = sSesion;
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable String idUsuario) {
        try {
            List<MRecomendacion> lista = sRecomendacion.consultaGeneralPorUsuario(idUsuario);
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        try {
            MRecomendacion recomendacion = sRecomendacion.consultaIndividualID(id);
            return ResponseEntity.ok(recomendacion);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/usuario/{idUsuario}/sesion/{idSesion}")
    public ResponseEntity<?> listarPorUsuarioYSesion(
            @PathVariable String idUsuario, @PathVariable int idSesion) {
        try {
            List<MRecomendacion> lista = sRecomendacion.consultaPorUsuarioYSesion(idUsuario, idSesion);
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody MRecomendacion mRecomendacion) {
        try {
            MRecomendacion nueva = sRecomendacion.adicionarRecomendacion(mRecomendacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    /**
     * POST /api/recomendaciones/admin
     * Recibe un DTO plano desde el panel de administrador:
     * { idUsuario, idSesion (opcional), texto, tipo, prioridad, fecha }
     * Construye la entidad completa internamente.
     */
    @PostMapping("/admin")
    public ResponseEntity<?> guardarDesdeAdmin(@RequestBody Map<String, Object> dto) {
        try {
            String idUsuario = dto.get("idUsuario").toString();
            MUsuario usuario = sUsuario.consultaIndividualID(idUsuario);

            // sesion_id es opcional — si no viene se usa la sesión con id=1 como placeholder
            MSesion sesion = null;
            if (dto.containsKey("idSesion") && dto.get("idSesion") != null) {
                int idSesion = Integer.parseInt(dto.get("idSesion").toString());
                sesion = sSesion.consultaIndividualID(idSesion);
            } else {
                // Usar primera sesión disponible como referencia neutra
                List<com.example.LifeBalance.Modelo.MSesion> todas = sSesion.consultaGeneralSesiones();
                if (!todas.isEmpty()) sesion = todas.get(0);
                else throw new Exception("No hay sesiones registradas en el sistema");
            }

            String texto     = dto.getOrDefault("texto",     dto.getOrDefault("motivo", "")).toString();
            String fechaStr  = dto.containsKey("fecha") ? dto.get("fecha").toString() : LocalDate.now().toString();

            MRecomendacion rec = new MRecomendacion();
            rec.setUsuario(usuario);
            rec.setSesion(sesion);
            rec.setMotivo(texto);
            rec.setFecha(LocalDate.parse(fechaStr));

            MRecomendacion nueva = sRecomendacion.adicionarRecomendacion(rec);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable int id, @RequestBody MRecomendacion mRecomendacion) {
        try {
            MRecomendacion actualizada = sRecomendacion.modificarRecomendacion(id, mRecomendacion);
            return ResponseEntity.ok(actualizada);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        try {
            Boolean resultado = sRecomendacion.eliminarRecomendacion(id);
            return ResponseEntity.ok(Map.of("eliminado", resultado));
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }
}
