import sequelize from '../config/database.js';
import updateIngresosEgresos from './20260615-update-ingresos-egresos-estado-metodo-pago.js';

const queryInterface = sequelize.getQueryInterface();

try {
    await updateIngresosEgresos.up(queryInterface, sequelize.Sequelize);
    console.log('Migración de ingresos/egresos aplicada correctamente');
    process.exit(0);
} catch (error) {
    console.error('Error al ejecutar la migración:', error);
    process.exit(1);
}
