package com.example.LifeBalance.Repositorio;

import com.example.LifeBalance.Modelo.MUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IUsuario extends JpaRepository<MUsuario, String> {
    Optional<MUsuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
    Optional<MUsuario> findByCorreoAndContrasena(String correo, String contrasena);
    java.util.List<MUsuario> findByRol(String rol);
}
