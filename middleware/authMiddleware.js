// middleware/authMiddleware.js
const jwt = require('jwt-simple');
const SECRET_KEY = "SUPER_SECRET_KEY_TECHSTORE";

exports.protectAndAuthorize = (allowedRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Acceso denegado. No se proporcionó un token válido." });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.decode(token, SECRET_KEY);
            req.user = decoded; // Guardamos los datos del usuario en la petición

            // Verificar si el perfil/rol está autorizado para esta ruta específica
            if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ 
                    message: `Acceso denegado. Tu rol de '${decoded.role}' no cuenta con los permisos necesarios.` 
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: "Token inválido o expirado." });
        }
    };
};