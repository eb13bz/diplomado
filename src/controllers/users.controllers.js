import { User } from '../models/user.js';
import { Task } from '../models/task.js';
import { Status } from '../constants/index.js';
import { encriptar } from '../common/bcrypt.js'; // Asegúrate de que esta función exista y funcione como esperas

// getUsers: DEBE recibir (req, res, next)
async function getUsers(req, res, next) { // <-- CORRECCIÓN CRÍTICA: Añadido 'res'
    try {
        const users = await User.findAll({
            // CORRECCIÓN: 'atrbutes' a 'attributes'
            attributes: ['id', 'username', 'password', 'status'],
            order: [['id', 'DESC']],
            where: {
                status: Status.ACTIVE,
            },
        });
        // CORRECCIÓN: SIEMPRE usar 'return' después de enviar una respuesta
        return res.json(users);
    } catch (error) {
        // Pasa el error al manejador de errores global
        next(error);
    }
}

// createUser: Ya tiene (req, res, next) pero necesita encriptar la contraseña y un 'return'
async function createUser(req, res, next) {
    const { username, password } = req.body;
    try {
        // CORRECCIÓN: Encriptar la contraseña antes de crear el usuario
        const hashedPassword = await encriptar(password);
        const user = await User.create({
            username,
            password: hashedPassword, // Usar la contraseña encriptada
        });
        // CORRECCIÓN: Usar 201 Created para una creación exitosa y SIEMPRE usar 'return'
        return res.status(201).json(user);
    } catch (error) {
        next(error);
    }
}

// getUser: Necesita 'return' en ambos casos de respuesta
async function getUser(req, res, next) {
    const { id } = req.params;
    try {
        const user = await User.findOne({
            attributes: ['username', 'password', 'status'],
            where: {
                id,
            }
        });
        // CORRECCIÓN: SIEMPRE usar 'return'
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // CORRECCIÓN: SIEMPRE usar 'return'
        return res.json(user);
    } catch (error) {
        next(error);
    }
}

// updateUser: Necesita 'return', encriptación de contraseña y mejor manejo de no encontrado/sin cambios
async function updateUser(req, res, next) {
    const { id } = req.params;
    const { username, password } = req.body; // Eliminada la coma extra
    try {
        // Mensaje más claro si no se proporciona nada para actualizar
        if (!username && !password) {
            return res
                .status(400)
                .json({ message: 'At least one field (username or password) is required for update' });
        }

        const updateData = {};
        if (username) {
            updateData.username = username;
        }
        if (password) {
            // CORRECCIÓN: Encriptar la contraseña si se proporciona
            updateData.password = await encriptar(password);
        }

        const [updatedRows] = await User.update(updateData, {
            where: {
                id,
            },
        });

        // CORRECCIÓN: Verificar si el usuario fue encontrado y actualizado
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }

        // Opcional: devolver el usuario actualizado para confirmar los cambios
        const updatedUser = await User.findByPk(id, {
            attributes: ['id', 'username', 'status', 'createdAt', 'updatedAt']
        });
        // CORRECCIÓN: SIEMPRE usar 'return'
        return res.json(updatedUser);
    } catch (error) {
        next(error);
    }
}

// deleteUser: Necesita 'return', corrección de 'Status' y manejo de no encontrado
async function deleteUser(req, res, next) {
    const { id } = req.params;
    try {
        const deletedRows = await User.destroy({
            where: {
                id,
            },
        });
        // CORRECCIÓN: Verificar si el usuario fue encontrado y eliminado
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        // CORRECCIÓN: 'res.Status' a 'res.status' y SIEMPRE usar 'return'
        return res.status(204).json({ message: 'User deleted successfully' }); // 204 No Content es apropiado para DELETE sin cuerpo
    } catch (error) {
        next(error);
    }
}

// activateInactivate: Necesita 'return' en todas las respuestas condicionales
async function activateInactivate(req, res, next) {
    const { id } = req.params;
    const { status } = req.body;
    try {
        // CORRECCIÓN: SIEMPRE usar 'return'
        if (!status) {
            return res.status(400).json({ message: 'status is required' });
        }

        const user = await User.findByPk(id);

        // CORRECCIÓN: SIEMPRE usar 'return'
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // CORRECCIÓN: SIEMPRE usar 'return' y mensaje más claro
        if (user.status === status) {
            return res.status(409).json({ message: 'User already has this status' });
        }

        user.status = status;
        await user.save();
        // CORRECCIÓN: SIEMPRE usar 'return'
        return res.json(user);
    } catch (error) {
        next(error);
    }
}

// getTasks: Necesita 'return' y mejor manejo de no encontrado/sin tareas
async function getTasks(req, res, next) {
    const { id } = req.params;
    try {
        // CORRECCIÓN: Usar findOne para obtener un solo usuario por ID
        const userWithTasks = await User.findOne({
            attributes: ['username'],
            include: [{
                model: Task,
                attributes: ['name', 'done'],
                where: { done: false }, // Mantiene tu condición original
            }],
            where: {
                id,
            },
        });

        // CORRECCIÓN: Si no se encuentra el usuario o no tiene tareas que cumplan la condición
        if (!userWithTasks) { // findOne devuelve null si no encuentra nada
            return res.status(404).json({ message: 'User not found or no matching tasks' });
        }

        // CORRECCIÓN: SIEMPRE usar 'return'
        return res.json(userWithTasks); // Devuelve el objeto de usuario con sus tareas
    } catch (error) {
        next(error);
    }
}

export default {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    activateInactivate,
    getTasks
};