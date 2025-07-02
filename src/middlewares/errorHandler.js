import logger from '../logs/logger.js';

export default function errorHandler (err, req, res, next) {
  
    if (res.headersSent) {
        return next(err);
    }

    console.error('Error nombre:', err.name);
    // Para ver más detalles del error de la base de datos, puedes descomentar la siguiente línea:
    // console.error(err);
    logger.error(err.message); 


    // --- AÑADIDA NUEVA CONDICIÓN PARA ERRORES DE CLAVE ÚNICA ---
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.fields ? Object.keys(err.fields)[0] : 'campo'; // Intenta obtener el nombre del campo que causó el conflicto (ej. 'username')
        const value = err.fields ? err.fields[field] : ''; // Y el valor que ya existe
        return res.status(409).json({ // 409 Conflict es el código de estado apropiado para conflictos de recursos
            message: `El ${field} '${value}' ya está en uso. Por favor, elige uno diferente.`,
            errorType: 'DuplicateEntry' // Un tipo de error personalizado para el cliente
        });
    }
    // --- FIN DE LA NUEVA CONDICIÓN ---


    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    } else if (err.name === 'JsonWebTokenError') { 
        return res.status(401).json({ message: 'Token de autenticación inválido.' });
    } else if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token de autenticación expirado.' });
    } else if (
        // Se mantiene el 400 para otros errores de validación de Sequelize
        err.name === 'SequelizeValidationError' || 
        err.name === 'SequelizeForeignKeyConstraintError'
    ) {
        const sequelizeErrors = err.errors ? err.errors.map(e => e.message) : [err.message];
        return res.status(400).json({
            message: 'Error de validación de datos de base de datos.',
            details: sequelizeErrors
        });
    } else {
        // Para cualquier otro error no especificado, envía un 500
        return res.status(err.status || 500).json({
            message: err.message || 'Ocurrió un error inesperado en el servidor.'
        });
    }
}