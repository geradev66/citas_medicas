import sequelize from '../config/database.js';
import '../models/Area.js';
import '../models/User.js';
import '../models/Pacientes.js';
import '../models/Medico.js';
import '../models/Citas.js';
import '../models/IngresosEgresos.js';

try {
    await sequelize.sync({ force: false });
    console.log('Base de datos sincronizada correctamente');
    process.exit(0);
} catch (error) {
    console.error('Error al sincronizar:', error);
    process.exit(1);
}
