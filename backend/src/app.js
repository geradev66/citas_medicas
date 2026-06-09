import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

try {
    await sequelize.authenticate();
    console.log('Conectado a PostgreSQL');
} catch (error) {
    console.error('Error de conexión a PostgreSQL:', error);
}

routes(app);

export default app;
