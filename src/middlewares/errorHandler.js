

import logger from '../logs/logger.js';

export default function errorHandler (err, req, res, next) {
  
    if (res.headersSent) {
        return next(err);
    }

    console.error('Error nombre:', err.name);
    logger.error(err.message); 


    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    } else if (err.name === 'JsonWebTokenError') { 
        return res.status(401).json({ message: 'Token de autenticación inválido.' });
    } else if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token de autenticación expirado.' });
    } else if (
        err.name === 'SequelizeValidationError' || 
        err.name === 'SequelizeUniqueConstraintError' ||
        err.name === 'SequelizeForeignKeyConstraintError'
    ) {
        const sequelizeErrors = err.errors ? err.errors.map(e => e.message) : [err.message];
        return res.status(400).json({
            message: 'Error de validación de datos de base de datos.',
            details: sequelizeErrors
        });
    } else {
        return res.status(err.status || 500).json({
            message: err.message || 'Ocurrió un error inesperado en el servidor.'
        });
    }
}