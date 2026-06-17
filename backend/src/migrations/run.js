import sequelize from '../config/database.js';
import createAllTables from './20260527-create-all-tables.js';
import updateIngresosEgresos from './20260615-update-ingresos-egresos-estado-metodo-pago.js';

const queryInterface = sequelize.getQueryInterface();
const Sequelize = sequelize.Sequelize;

const migrations = [createAllTables, updateIngresosEgresos];

try {
    for (const migration of migrations) {
        await migration.up(queryInterface, Sequelize);
    }
    console.log('Migraciones ejecutadas correctamente');
    process.exit(0);
} catch (error) {
    console.error('Error al ejecutar migraciones:', error);
    process.exit(1);
}
