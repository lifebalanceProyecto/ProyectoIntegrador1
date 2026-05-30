import { useState, useEffect, useCallback } from 'react';
import { getSession, saveSession, clearSession, today } from '../services/lb';
import { apiLogin, apiRegistrarUsuario } from '../services/api';

/**
 * useAuth — Manejo de autenticación
 * 
 * ✅ CAMBIOS CRÍTICOS:
 * - register() ahora recibe: id (cédula) + tipoDocumento + telefono
 * - login() sigue igual (correo + contraseña)
 * - Sesión guarda: id (cédula, no timestamp), nombre, correo, rol
 * - Contraseña en TEXTO PLANO (como requiere el backend)
 */
export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    setLoading(false);
  }, []);

  /**
   * register() — Crea una nueva cuenta con cédula + tipo_documento + telefono
   * 
   * @param {Object} datos
   *   - id: string (cédula, 5-10 dígitos) ← CÉDULA COMO ID
   *   - tipoDocumento: string (CC, CE, NIT, etc.) ← NUEVO
   *   - nombre: string
   *   - telefono: string (7-15 dígitos) ← NUEVO/REQUERIDO
   *   - correo: string
   *   - contrasena: string (texto plano)
   *   - fechaNacimiento: string (YYYY-MM-DD)
   *   - sexo: string (M, F, O, P)
   */
  const register = useCallback(async ({
    id,  // ← CÉDULA (5-10 dígitos)
    tipoDocumento,  // ← NUEVO (CC, CE, NIT, PASAPORTE, TI, PPT)
    nombre,
    telefono,  // ← NUEVO (7-15 dígitos, REQUERIDO)
    correo,
    contrasena,  // ← texto plano
    fechaNacimiento,
    sexo,
  }) => {
    try {
      const body = {
        id: id.trim(),  // ← Cédula como ID
        tipoDocumento,  // ← Tipo de documento
        nombre: nombre.trim(),
        telefono: telefono.trim(),  // ← Teléfono
        correo: correo.toLowerCase().trim(),
        contrasena,  // ← camelCase para backend, texto plano
        fechaNacimiento,
        sexo,
        fechaCreacion: today(),
        activo: true,
      };

      console.log('📤 Registrando usuario:', { 
        id: body.id, 
        tipoDocumento: body.tipoDocumento, 
        nombre: body.nombre,
        telefono: body.telefono,
        correo: body.correo 
      });

      const userData = await apiRegistrarUsuario(body);

      // ✅ Sesión guarda la cédula como ID (no un timestamp)
      const session = {
        id: userData.id,  // ← CÉDULA (de la BD)
        nombre: userData.nombre,
        correo: userData.correo,
        tipoDocumento: userData.tipoDocumento,
        telefono: userData.telefono,
        rol: userData.rol || 'USUARIO',
      };

      console.log('✅ Usuario registrado exitosamente:', session);

      saveSession(session);
      setUser(session);
      return session;
    } catch (err) {
      console.error('❌ Error en registro:', err.message);
      throw err;
    }
  }, []);

  /**
   * login() — Inicia sesión con correo + contraseña
   * 
   * @param {Object} credenciales
   *   - correo: string
   *   - contraseña: string (texto plano)
   */
  const login = useCallback(async ({ correo, contraseña }) => {
    try {
      console.log('📤 Iniciando sesión:', { correo: correo.toLowerCase().trim() });

      const userData = await apiLogin({
        correo: correo.toLowerCase().trim(),
        contrasena: contraseña,  // ← camelCase para backend, texto plano
      });

      // ✅ Sesión guarda la cédula del usuario
      const session = {
        id: userData.id,  // ← CÉDULA (de la BD)
        nombre: userData.nombre,
        correo: userData.correo,
        tipoDocumento: userData.tipoDocumento,
        telefono: userData.telefono,
        rol: userData.rol || 'USUARIO',
      };

      console.log('✅ Sesión iniciada exitosamente:', session);

      saveSession(session);
      setUser(session);
      return session;
    } catch (err) {
      console.error('❌ Error en login:', err.message);
      throw err;
    }
  }, []);

  /**
   * logout() — Cierra la sesión
   */
  const logout = useCallback(() => {
    console.log('🚪 Cerrando sesión');
    clearSession();
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
}
