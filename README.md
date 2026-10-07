# 🛒 TechStore - Sistema de Gestión de Inventario (Laboratorio 08)

Este repositorio contiene la implementación práctica de un sistema web de autenticación segura y control de accesos basado en roles (RBAC) para la cadena de tiendas **TechStore**. El proyecto ha sido desarrollado localmente utilizando **VS Code**, **Node.js** y **Express**, prescindiendo de infraestructuras externas complejas para demostrar los fundamentos de la seguridad en la nube en el backend y frontend.

---

## 🛠️ Tecnologías y Entorno de Desarrollo

*   **Servidor Backend:** Node.js v20+ con Express framework.
*   **Seguridad y Cifrado:** `bcryptjs` (hashing de contraseñas) y `jwt-simple` (emisión de JSON Web Tokens).
*   **Interfaz de Usuario (Frontend):** HTML5, CSS3 moderno incrustado y JavaScript estándar (`Fetch API`).
*   **Puerto de Ejecución:** `http://localhost:5000`
*   **Base de Datos:** Simulación persistente en memoria (`memoryDb.js`) para garantizar pruebas ágiles y entornos sin dependencias.

---

## 📁 Estructura del Proyecto

```text
techstore-auth/
├── package.json
├── server.js            <-- Configuración del servidor, rutas API y servicio estático
├── README.md            <-- Documentación técnica del repositorio
├── database/
│   └── memoryDb.js      <-- Almacenamiento volátil de usuarios, roles y estados de bloqueo
├── middleware/
│   └── authMiddleware.js <-- Interceptor de seguridad: Validación de JWT y verificación de RBAC
├── controllers/
│   └── authController.js <-- Lógica de negocio (Registro, Login, Fuerza Bruta y MFA)
└── public/               <-- 🌐 Carpeta del Servidor Web (Frontend)
    ├── index.html        <-- Formulario de login básico y accesos federados
    ├── mfa.html          <-- Interfaz de verificación del segundo factor
    └── dashboard.html    <-- Panel de control dinámico según privilegios del usuario
```

---

## 🔐 Matriz de Seguridad e Implementación RBAC

El sistema valida el rol incrustado de forma segura en el token JWT del usuario conectado para restringir o permitir las operaciones en el Frontend y proteger las endpoints en el Backend:

| Perfil de Usuario | Responsabilidad del Negocio | Ruta API Protegida | Restricción en Interfaz Web |
| :--- | :--- | :--- | :--- |
| **Administrador del Sistema** | Gestión global de identidades y configuraciones. Acceso absoluto. | `/api/admin/config` | Habilita control total de usuarios y logs del sistema. |
| **Gerente de Tienda** | Visualización de reportes y gestión restringida a su ubicación geográfica. | `/api/products/my-store` | Muestra productos exclusivos de su sucursal; bloquea otras tiendas. |
| **Empleado de Ventas** | Consulta de catálogo y actualización de existencias en tiempo real. | `/api/products/update-stock` | Habilita actualización de stock; bloquea la edición de precios. |
| **Auditor** | Cumplimiento normativo y lectura de registros históricos de auditoría. | `/api/auditor/reports` | Acceso a reportes históricos; bloquea cualquier botón de edición. |

---

## 🚀 Guía de Instalación y Despliegue Local

Sigue estos pasos en tu terminal de VS Code para inicializar la aplicación web:

1. **Clonar o situarse en el directorio del proyecto:**
   ```bash
   cd techstore-auth
   ```

2. **Instalar las dependencias de producción:**
   ```bash
   npm install express jwt-simple bcryptjs
   ```

3. **Iniciar el servidor web:**
   ```bash
   node server.js
   ```
   *Deberías ver el mensaje:* `🚀 Servidor y Web ejecutándose en http://localhost:5000`

4. **Acceder a la aplicación:**
   Abre tu navegador web e ingresa a `http://localhost:5000`.

---

## 🛡️ Características de Seguridad Probadas (Flujos Clave)

El proyecto valida de manera estricta los siguientes pilares de la seguridad informática moderna:

1. **Robustez de Contraseñas:** El endpoint de registro rechaza peticiones que no cumplan con el patrón regulatorio estricto (mínimo 8 caracteres, una mayúscula, un número y un carácter especial).
2. **Autenticación en Dos Pasos (MFA por Email):** Tras validar las credenciales básicas, el sistema congela la sesión y exige un código numérico temporal de 6 dígitos que expira en 5 minutos. El código se imprime en la terminal del servidor simulando el envío de correo.
3. **Mitigación de Ataques de Fuerza Bruta:** Si una cuenta registra 5 intentos fallidos consecutivos en el inicio de sesión, el servidor bloquea la identidad digital automáticamente por un periodo de 15 minutos.
4. **Seguridad Federada (OAuth2 de Terceros):** Se incluyen botones de integración simulada para inicios de sesión rápidos mediante proveedores globales de confianza como **Google Accounts** y **GitHub Developer**.