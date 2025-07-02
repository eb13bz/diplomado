import express from 'express';

const app = express();

//import routes
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import tasksRoutes from './routes/tasks.router.js';
import morgan from 'morgan';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';
import { authenticateToken } from './middlewares/authenticate.js';

//middlwares
app.use(morgan('dev'));
app.use(express.json());
//routes
app.use('/api/login', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', authenticateToken, tasksRoutes);

app.use(notFound)
app.use(errorHandler)

export default app;
