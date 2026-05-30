package com.example.LifeBalance.Modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
public class MUsuario {

    // ─── ID manual: entre 5 y 10 dígitos, lo ingresa el usuario ─────────────
    @Id
    @Column(name = "id_usuario", length = 10)
    @NotBlank(message = "El número de documento no puede estar vacío")
    @Pattern(
            regexp = "^[0-9]{5,10}$",
            message = "El número de documento debe tener entre 5 y 10 dígitos numéricos"
    )
    private String id;

    // ─── Tipo de documento ───────────────────────────────────────────────────
    @Column(name = "tipo_documento", nullable = false, length = 15)
    @NotBlank(message = "El tipo de documento no puede estar vacío")
    @Pattern(
            regexp = "^(CC|CE|NIT|PASAPORTE|TI|PPT)$",
            message = "Tipo de documento inválido. Use: CC, CE, NIT, PASAPORTE, TI, PPT"
    )
    private String tipoDocumento;

    @Column(name = "nombre", nullable = false, length = 100)
    @NotBlank(message = "El nombre no puede estar vacío")
    @Pattern(
            regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$",
            message = "El nombre solo puede contener letras"
    )
    private String nombre;

    @Column(name = "correo", nullable = false, unique = true, length = 120)
    @NotBlank(message = "El correo no puede estar vacío")
    @Email(message = "El correo no tiene un formato válido")
    private String correo;

    // ✅ CORREGIDO: contrasena es nullable para permitir edición sin cambiar contraseña
    @Column(name = "contrasena", nullable = true, length = 100)
    private String contrasena;

    // ─── Teléfono: entre 7 y 15 dígitos (cubre fijos y celulares Colombia) ──
    @Column(name = "telefono", nullable = false, length = 15)
    @NotBlank(message = "El teléfono no puede estar vacío")
    @Pattern(
            regexp = "^[0-9]{7,15}$",
            message = "El teléfono debe tener entre 7 y 15 dígitos numéricos"
    )
    private String telefono;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(name = "sexo", nullable = false, length = 20)
    private String sexo;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

    @Column(name = "activo", nullable = false)
    private boolean activo;

    @Column(name = "rol", nullable = false, length = 20)
    private String rol = "USUARIO";

    public MUsuario() {}

    // ─── Getters y Setters ───────────────────────────────────────────────────
    public String getId()                            { return id; }
    public void setId(String id)                     { this.id = id; }
    public String getTipoDocumento()                 { return tipoDocumento; }
    public void setTipoDocumento(String t)           { this.tipoDocumento = t; }
    public String getNombre()                        { return nombre; }
    public void setNombre(String nombre)             { this.nombre = nombre; }
    public String getCorreo()                        { return correo; }
    public void setCorreo(String correo)             { this.correo = correo; }
    public String getContrasena()                    { return contrasena; }
    public void setContrasena(String contrasena)     { this.contrasena = contrasena; }
    public String getTelefono()                      { return telefono; }
    public void setTelefono(String telefono)         { this.telefono = telefono; }
    public LocalDate getFechaNacimiento()            { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate d)      { this.fechaNacimiento = d; }
    public String getSexo()                          { return sexo; }
    public void setSexo(String sexo)                 { this.sexo = sexo; }
    public LocalDate getFechaCreacion()              { return fechaCreacion; }
    public void setFechaCreacion(LocalDate d)        { this.fechaCreacion = d; }
    public boolean isActivo()                        { return activo; }
    public void setActivo(boolean activo)            { this.activo = activo; }
    public String getRol()                           { return rol; }
    public void setRol(String rol)                   { this.rol = rol; }
}
