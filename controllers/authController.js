// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const { users } = require('../database/memoryDb');

const SECRET_KEY = "SUPER_SECRET_KEY_TECHSTORE";

// 1. REGISTRO DE USUARIOS
exports.register = (req, res) => {
    const { email, password, fullName, store, role } = req.body;

    // Validar email único
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "El email ya está registrado." });
    }

    // Validar contraseña (mínimo 8 caracteres, una mayúscula, un número, un carácter especial)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: "La contraseña debe tener mínimo 8 caracteres, incluir una mayúscula, un número y un carácter especial." 
        });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
        id: users.length + 1,
        email,
        password: hashedPassword,
        fullName,
        store,
        role: role || "Empleado de Ventas", // Por defecto
        failedAttempts: 0,
        lockUntil: null,
        mfaCode: null,
        mfaExpires: null
    };

    users.push(newUser);
    return res.status(201).json({ message: "Usuario registrado con éxito.", user: { email, fullName, role, store } });
};

// 2. LOGIN BÁSICO (PASO 1)
exports.loginStep1 = (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Verificar si la cuenta está bloqueada temporalmente
    if (user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(403).json({ message: `Cuenta bloqueada. Intente de nuevo más tarde.` });
    }

    // Validar credenciales
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
        user.failedAttempts += 1;
        if (user.failedAttempts >= 5) {
            user.lockUntil = Date.now() + 15 * 60 * 1000; // Bloqueo por 15 minutos
            user.failedAttempts = 0; // Reiniciar contador tras bloquear
            return res.status(403).json({ message: "Máximo de intentos alcanzado. Cuenta bloqueada por 15 minutos." });
        }
        return res.status(401).json({ message: `Contraseña incorrecta. Intentos fallidos: ${user.failedAttempts}/5` });
    }

    // Credenciales correctas: Reiniciar intentos y generar código MFA (Opción B: Email simulado)
    user.failedAttempts = 0;
    user.lockUntil = null;
    
    const tokenMfa = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
    user.mfaCode = tokenMfa;
    user.mfaExpires = Date.now() + 5 * 60 * 1000; // Válido por 5 minutos
    user.mfaAttempts = 0; // Contador de intentos de código MFA

    // SIMULACIÓN DE ENVÍO DE EMAIL POR CONSOLA
    console.log(`\n📩 [EMAIL SIMULADO] Para: ${user.email} -> Tu código de verificación MFA para TechStore es: ${tokenMfa}\n`);

    return res.status(200).json({ 
        message: "Paso 1 correcto. Se ha enviado un código MFA a tu correo electrónico simulado en la consola del servidor.",
        email: user.email
    });
};

// 3. VERIFICACIÓN DE MFA (PASO 2)
exports.verifyMfa = (req, res) => {
    const { email, code } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !user.mfaCode) {
        return res.status(400).json({ message: "Solicitud de autenticación inválida." });
    }

    // Validar expiración del código (5 minutos)
    if (Date.now() > user.mfaExpires) {
        return res.status(400).json({ message: "El código MFA ha expirado. Solicite uno nuevo." });
    }

    // Validar intentos máximos de MFA (Máximo 3 intentos)
    if (user.mfaCode !== code) {
        user.mfaAttempts += 1;
        if (user.mfaAttempts >= 3) {
            user.mfaCode = null; // Invalidar código
            return res.status(403).json({ message: "Máximo de intentos de MFA fallidos. Inicie sesión otra vez." });
        }
        return res.status(401).json({ message: `Código incorrecto. Intentos restantes: ${3 - user.mfaAttempts}` });
    }

    // Código Correcto: Generar Token JWT completo con perfil/rol
    const payload = {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        store: user.store,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
    };

    const token = jwt.encode(payload, SECRET_KEY);

    // Limpiar datos temporales de MFA
    user.mfaCode = null;
    user.mfaExpires = null;
    user.mfaAttempts = 0;

    return res.status(200).json({
        message: "Acceso concedido exitosamente.",
        token: `Bearer ${token}`,
        user: { fullName: user.fullName, role: user.role, store: user.store }
    });
};

// 4. LOGIN CON REDES SOCIALES (SIMULADO)
exports.socialLogin = (req, res) => {
    const { provider, email, fullName } = req.body; // provider: 'Google' o 'Github'

    if (!['Google', 'Github'].includes(provider)) {
        return res.status(400).json({ message: "Proveedor de red social no soportado." });
    }

    // Si el usuario no existe, lo registra directamente bajo el rol por defecto
    let user = users.find(u => u.email === email);
    if (!user) {
        user = {
            id: users.length + 1,
            email,
            fullName,
            store: "Tienda Centro",
            role: "Empleado de Ventas",
            socialProvider: provider
        };
        users.push(user);
    }

    // El login con redes sociales de confianza suele omitir el MFA local o asumir el del proveedor
    const payload = { userId: user.id, fullName: user.fullName, email: user.email, role: user.role, store: user.store };
    const token = jwt.encode(payload, SECRET_KEY);

    return res.status(200).json({
        message: `Autenticación exitosa mediante ${provider}.`,
        token: `Bearer ${token}`,
        user: { fullName: user.fullName, role: user.role, store: user.store }
    });
};