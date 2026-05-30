package com.example.LifeBalance.Modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "recomendaciones")
public class MRecomendacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_recomendacion")
    private int id;

    @Column(name = "motivo", nullable = false, length = 200)
    private String motivo;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private MUsuario usuario;

    @ManyToOne
    @JoinColumn(name = "sesion_id", nullable = false)
    private MSesion sesion;

    public MRecomendacion() {}

    public int getId()                           { return id; }
    public void setId(int id)                    { this.id = id; }
    public String getMotivo()                    { return motivo; }
    public void setMotivo(String motivo)         { this.motivo = motivo; }
    public LocalDate getFecha()              { return fecha; }
    public void setFecha(LocalDate fecha)    { this.fecha = fecha; }
    public MUsuario getUsuario()                 { return usuario; }
    public void setUsuario(MUsuario usuario)     { this.usuario = usuario; }
    public MSesion getSesion()                   { return sesion; }
    public void setSesion(MSesion sesion)        { this.sesion = sesion; }
}
