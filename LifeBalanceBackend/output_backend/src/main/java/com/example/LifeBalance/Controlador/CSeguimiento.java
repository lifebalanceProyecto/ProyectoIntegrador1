package com.example.LifeBalance.Controlador;

import com.example.LifeBalance.Modelo.MSeguimiento;
import com.example.LifeBalance.Servicio.SSeguimiento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seguimientos")
public class CSeguimiento {

    @Autowired
    SSeguimiento sSeguimiento;

    public CSeguimiento(SSeguimiento sSeguimiento) {
        this.sSeguimiento = sSeguimiento;
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable String idUsuario) {
        try {
            List<MSeguimiento> lista = sSeguimiento.consultaGeneralPorUsuario(idUsuario);
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        try {
            MSeguimiento seguimiento = sSeguimiento.consultaIndividualID(id);
            return ResponseEntity.ok(seguimiento);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/usuario/{idUsuario}/sesion/{idSesion}")
    public ResponseEntity<?> listarPorUsuarioYSesion(
            @PathVariable String idUsuario, @PathVariable int idSesion) {
        try {
            List<MSeguimiento> lista = sSeguimiento.consultaPorUsuarioYSesion(idUsuario, idSesion);
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/usuario/{idUsuario}/rango")
    public ResponseEntity<?> listarPorRango(
            @PathVariable String idUsuario,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        try {
            List<MSeguimiento> lista = sSeguimiento.consultaPorRango(idUsuario, inicio, fin);
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/usuario/{idUsuario}/completados/count")
    public ResponseEntity<?> contarCompletados(@PathVariable String idUsuario) {
        try {
            Long total = sSeguimiento.contarCompletadas(idUsuario);
            return ResponseEntity.ok(total);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody MSeguimiento mSeguimiento) {
        try {
            MSeguimiento nuevo = sSeguimiento.adicionarSeguimiento(mSeguimiento);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable int id, @RequestBody MSeguimiento mSeguimiento) {
        try {
            MSeguimiento actualizado = sSeguimiento.modificarSeguimiento(id, mSeguimiento);
            return ResponseEntity.ok(actualizado);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        try {
            Boolean resultado = sSeguimiento.eliminarSeguimiento(id);
            return ResponseEntity.ok(Map.of("eliminado", resultado));
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }
}
