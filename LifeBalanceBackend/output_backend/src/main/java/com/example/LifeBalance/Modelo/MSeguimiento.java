package com.example.LifeBalance.Modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "seguimiento")
public class MSeguimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguimiento")
    private int id;

    @Column(name = "completado", nullable = false)
    private boolean completado;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private MUsuario usuario;

    @ManyToOne
    @JoinColumn(name = "sesion_id", nullable = false)
    private MSesion sesion;

    public MSeguimiento() {}

    public int getId()                           { return id; }
    public void setId(int id)                    { this.id = id; }
    public boolean isCompletado()                { return completado; }
    public void setCompletado(boolean completado){ this.completado = completado; }
    public LocalDate getFecha()                  { return fecha; }
    public void setFecha(LocalDate fecha)        { this.fecha = fecha; }
    public MUsuario getUsuario()                 { return usuario; }
    public void setUsuario(MUsuario usuario)     { this.usuario = usuario; }
    public MSesion getSesion()                   { return sesion; }
    public void setSesion(MSesion sesion)        { this.sesion = sesion; }
}
