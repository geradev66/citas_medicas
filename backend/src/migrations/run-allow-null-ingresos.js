import sequelize from '../config/database.js';
import allowNullOptional from './20260615-allow-null-ingresos-egresos-optional.js';

const queryInterface = sequelize.getQueryInterface();

try {
    await allowNullOptional.up(queryInterface);
    console.log('Columnas opcionales de ingresos/egresos actualizadas correctamente');
    process.exit(0);
} catch (error) {
    console.error('Error al ejecutar la migración:', error);
    process.exit(1);
}
