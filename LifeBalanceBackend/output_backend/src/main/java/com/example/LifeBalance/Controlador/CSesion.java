package com.example.LifeBalance.Controlador;

import com.example.LifeBalance.Modelo.MSesion;
import com.example.LifeBalance.Servicio.SSesion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sesiones")
public class CSesion {

    @Autowired
    SSesion sSesion;

    public CSesion(SSesion sSesion) {
        this.sSesion = sSesion;
    }

    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            List<MSesion> lista = sSesion.consultaGeneralSesiones();
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        try {
            MSesion sesion = sSesion.consultaIndividualID(id);
            return ResponseEntity.ok(sesion);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<?> listarPorTipo(@PathVariable String tipo) {
        try {
            List<MSesion> lista = sSesion.consultaPorTipo(tipo);
            return ResponseEntity.ok(lista);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<?> buscarPorNombre(@PathVariable String nombre) {
        try {
            MSesion sesion = sSesion.consultaIndividualNombre(nombre);
            return ResponseEntity.ok(sesion);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> guardarOObtener(@RequestBody MSesion mSesion) {
        try {
            MSesion resultado = sSesion.adicionarORecuperarSesion(mSesion);
            return ResponseEntity.ok(resultado);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable int id, @RequestBody MSesion mSesion) {
        try {
            MSesion actualizada = sSesion.modificarSesion(id, mSesion);
            return ResponseEntity.ok(actualizada);
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        try {
            Boolean resultado = sSesion.eliminarSesion(id);
            return ResponseEntity.ok(Map.of("eliminado", resultado));
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", error.getMessage()));
        }
    }
}
