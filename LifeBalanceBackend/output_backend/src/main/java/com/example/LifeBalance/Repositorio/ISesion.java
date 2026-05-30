package com.example.LifeBalance.Repositorio;

import com.example.LifeBalance.Modelo.MSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ISesion extends JpaRepository<MSesion, Integer> {
    List<MSesion> findByTipo(String tipo);
    Optional<MSesion> findByNombre(String nombre);
}
