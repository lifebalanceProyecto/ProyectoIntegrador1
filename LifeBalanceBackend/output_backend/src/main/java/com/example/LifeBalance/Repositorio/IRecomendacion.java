package com.example.LifeBalance.Repositorio;

import com.example.LifeBalance.Modelo.MRecomendacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IRecomendacion extends JpaRepository<MRecomendacion, Integer> {
    List<MRecomendacion> findByUsuario_Id(String usuarioId);
    List<MRecomendacion> findByUsuario_IdAndSesion_Id(String usuarioId, int sesionId);
}
