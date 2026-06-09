import sequelize from '../config/database.js';
import migration from './20260527-create-all-tables.js';

const queryInterface = sequelize.getQueryInterface();

try {
    await migration.down(queryInterface, sequelize.Sequelize);
    console.log('Migraciones revertidas correctamente');
    process.exit(0);
} catch (error) {
    console.error('Error al revertir migraciones:', error);
    process.exit(1);
}
