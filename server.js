// server.js (Modificación rápida)
const express = require('express');
const path = require('path'); // <-- Agregar esto arriba
const authController = require('./controllers/authController');
const { protectAndAuthorize } = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());

// 🌟 ESTA LÍNEA ES NUEVA: Hace que Node sirva las páginas HTML de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// (Tus rutas de /api/auth/register, login-step1, verify-mfa, etc., se quedan EXACTAMENTE IGUAL)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login-step1', authController.loginStep1);
app.post('/api/auth/verify-mfa', authController.verifyMfa);
app.post('/api/auth/social-login', authController.socialLogin);

// Rutas de inventario (Las mismas de antes)
app.get('/api/admin/config', protectAndAuthorize(['Administrador del Sistema']), (req, res) => {
    res.json({ message: "Acceso total a la configuración del sistema." });
});
app.get('/api/products/my-store', protectAndAuthorize(['Administrador del Sistema', 'Gerente de Tienda']), (req, res) => {
    res.json({ message: `Productos de la ubicación: ${req.user.store}` });
});
app.post('/api/products/update-stock', protectAndAuthorize(['Administrador del Sistema', 'Gerente de Tienda', 'Empleado de Ventas']), (req, res) => {
    res.json({ message: "Stock actualizado con éxito en tiempo real." });
});
app.get('/api/auditor/reports', protectAndAuthorize(['Administrador del Sistema', 'Auditor']), (req, res) => {
    res.json({ message: "Generando reportes generales de auditoría." });
});

// Redirección por defecto al Login si entran a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor y Web ejecutándose en http://localhost:${PORT}`);
});