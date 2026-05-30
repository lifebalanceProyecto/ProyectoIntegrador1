package com.example.LifeBalance.Repositorio;

import com.example.LifeBalance.Modelo.MRegistroEmocional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface IRegistroEmocional extends JpaRepository<MRegistroEmocional, Integer> {

    List<MRegistroEmocional> findByUsuario_Id(String usuarioId);

    List<MRegistroEmocional> findByUsuario_IdAndFechaBetween(String usuarioId, LocalDate inicio, LocalDate fin);
}