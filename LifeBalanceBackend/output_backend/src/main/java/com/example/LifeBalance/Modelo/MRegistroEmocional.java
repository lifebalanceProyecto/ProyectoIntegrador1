package com.example.LifeBalance.Modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "registro_emocional")
public class MRegistroEmocional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    private int id;

    @Column(name = "nivel_animo", nullable = false)
    private int nivelAnimo;

    @Column(name = "comentario", length = 500)
    private String comentario;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false, referencedColumnName = "id_usuario")
    private MUsuario usuario;

    public MRegistroEmocional() {
        // Inicializar fecha actual por defecto
        this.fecha = LocalDate.now();
    }

    // ─── Getters y Setters ───────────────────────────────────────────────────
    public int getId()                           { return id; }
    public void setId(int id)                    { this.id = id; }
    
    public int getNivelAnimo()                   { return nivelAnimo; }
    public void setNivelAnimo(int nivelAnimo)    { this.nivelAnimo = nivelAnimo; }
    
    public String getComentario()                { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    
    public LocalDate getFecha()                  { return fecha; }
    public void setFecha(LocalDate fecha)        { this.fecha = fecha; }
    
    public MUsuario getUsuario()                 { return usuario; }
    public void setUsuario(MUsuario usuario)     { this.usuario = usuario; }

    @Override
    public String toString() {
        return "MRegistroEmocional{" +
                "id=" + id +
                ", nivelAnimo=" + nivelAnimo +
                ", comentario='" + comentario + '\'' +
                ", fecha=" + fecha +
                ", usuario=" + (usuario != null ? usuario.getId() : "null") +
                '}';
    }
}
