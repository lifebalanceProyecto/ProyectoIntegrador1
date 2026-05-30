package com.example.LifeBalance.Modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "sesiones")
public class MSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private int id;

    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo;

    @Column(name = "duracion", nullable = false)
    private int duracion;

    // ✅ SIMPLE: Solo el usuario_id como String (SIN relación JPA)
    @Column(name = "usuario_id", nullable = true, length = 10)
    private String usuarioId;

    public MSesion() {}

    public int getId()                    { return id; }
    public void setId(int id)             { this.id = id; }
    public String getNombre()             { return nombre; }
    public void setNombre(String n)       { this.nombre = n; }
    public String getTipo()               { return tipo; }
    public void setTipo(String t)         { this.tipo = t; }
    public int getDuracion()              { return duracion; }
    public void setDuracion(int d)        { this.duracion = d; }

    public String getUsuarioId()          { return usuarioId; }
    public void setUsuarioId(String uid)  { this.usuarioId = uid; }

    @Override
    public String toString() {
        return "MSesion{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", tipo='" + tipo + '\'' +
                ", duracion=" + duracion +
                ", usuarioId='" + usuarioId + '\'' +
                '}';
    }
}