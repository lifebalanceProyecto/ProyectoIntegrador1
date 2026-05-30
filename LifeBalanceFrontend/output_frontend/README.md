# 🌿 LifeBalance — React App

Aplicación de bienestar personal para gestión de sesiones, registro emocional y pausas activas.
Proyecto académico — Tercer semestre · CESDE

---

## ⚡ Requisitos previos

| Herramienta | Versión mínima | Cómo verificar |
|---|---|---|
| **Node.js** | 18 o superior | `node -v` |
| **npm** | 9 o superior | `npm -v` |
| **Git** | cualquier versión | `git --version` |

---

## 🚀 Paso a paso — Crear el proyecto

### Paso 1 — Crear el proyecto con Vite
```bash
npm create vite@latest lifebalance -- --template react
```

### Paso 2 — Instalar dependencias
```bash
cd lifebalance
npm install
npm install react-router-dom
```

### Paso 3 — Eliminar archivos que NO se usan (Mac/Linux)
```bash
rm src/App.css src/assets/react.svg public/vite.svg
```

### Paso 4 — Crear estructura de carpetas
```bash
mkdir -p src/components src/pages src/services src/hooks src/styles
```

### Paso 5 — Copiar todos los archivos del proyecto
Sigue el orden de la estructura de abajo.

### Paso 6 — Arrancar
```bash
npm run dev
```
Abre: **http://localhost:5173**

---

## 📁 Estructura

```
lifebalance/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   └── global.css
    ├── services/
    │   └── lb.js
    ├── hooks/
    │   ├── useAuth.js
    │   └── useToast.js
    ├── components/
    │   ├── AuthContext.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── Toast.jsx
    │   ├── Sidebar.jsx + .css
    │   └── SessionModal.jsx + .css
    └── pages/
        ├── Auth.jsx + .css
        ├── Dashboard.jsx + .css
        ├── Sesiones.jsx + .css
        ├── Emocional.jsx + .css
        ├── Historial.jsx + .css
        ├── Pausas.jsx + .css
        └── Perfil.jsx + .css
```

---

## 🗺️ Rutas

| Ruta | Página | Protegida |
|---|---|---|
| `/auth` | Login / Registro | ❌ Pública |
| `/dashboard` | Dashboard | ✅ Privada |
| `/sesiones` | Sesiones | ✅ Privada |
| `/emocional` | Registro emocional | ✅ Privada |
| `/historial` | Mi progreso | ✅ Privada |
| `/pausas` | Pausas activas | ✅ Privada |
| `/perfil` | Mi perfil | ✅ Privada |

### Lógica de protección de rutas
El componente `ProtectedRoute` envuelve todas las rutas privadas. Lee la sesión de `localStorage` mediante `useAuthContext`. Si no hay sesión activa, redirige automáticamente a `/auth` con `<Navigate to="/auth" replace />`.

---

## 🗄️ Modelo de datos (localStorage)

```js
lb_sesion              → { id, nombre, correo }
lb_usuarios            → [{ id, nombre, correo, contraseña_hash, fecha_nacimiento, sexo, fecha_creacion }]
lb_registros_emocionales → [{ id, usuario_id, nivel_animo, comentario, fecha }]
lb_seguimiento         → [{ id, usuario_id, sesion_id, completado, fecha }]
lb_pausas              → [{ id, usuario_id, hora, sesion_id, nota, activa }]
```

---

## 🛠️ Comandos

```bash
npm run dev       # desarrollo
npm run build     # producción
npm run preview   # previsualizar build
```

---

## 📦 Dependencias

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

---

## 🔧 Errores comunes

**Pantalla en blanco:** Revisa la consola del navegador (F12). Verifica que `main.jsx` importa `App.jsx` y `global.css`.

**`Cannot find module 'react-router-dom'`:** Ejecuta `npm install react-router-dom`.

**Los estilos no cargan:** Verifica que cada página importa su `.css` correspondiente y que `main.jsx` importa `./styles/global.css`.

---

Proyecto integrador — Segundo avance · CESDE · React 18 · Vite · React Router v6
