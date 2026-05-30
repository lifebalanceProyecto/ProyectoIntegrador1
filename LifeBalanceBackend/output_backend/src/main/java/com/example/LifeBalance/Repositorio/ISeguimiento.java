package com.example.LifeBalance.Repositorio;

import com.example.LifeBalance.Modelo.MSeguimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ISeguimiento extends JpaRepository<MSeguimiento, Integer> {

    List<MSeguimiento> findByUsuario_Id(String usuarioId);

    List<MSeguimiento> findByUsuario_IdAndSesion_Id(String usuarioId, int sesionId);

    List<MSeguimiento> findByUsuario_IdAndFechaBetween(String usuarioId, LocalDate inicio, LocalDate fin);

    long countByUsuario_IdAndCompletadoTrue(String usuarioId);
}