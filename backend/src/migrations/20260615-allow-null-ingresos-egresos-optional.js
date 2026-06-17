export default {
    up: async (queryInterface) => {
        await queryInterface.sequelize.query(`
            ALTER TABLE ingresos_egresos ALTER COLUMN areas DROP NOT NULL;
        `);
        await queryInterface.sequelize.query(`
            ALTER TABLE ingresos_egresos ALTER COLUMN pacientes DROP NOT NULL;
        `);
        await queryInterface.sequelize.query(`
            ALTER TABLE ingresos_egresos ALTER COLUMN descripcion DROP NOT NULL;
        `);
        await queryInterface.sequelize.query(`
            ALTER TABLE ingresos_egresos ALTER COLUMN proveedor DROP NOT NULL;
        `);
    },

    down: async (queryInterface) => {
        await queryInterface.sequelize.query(`
            ALTER TABLE ingresos_egresos ALTER COLUMN areas SET NOT NULL;
        `);
        await queryInterface.sequelize.query(`
            ALTER TABLE ingresos_egresos ALTER COLUMN pacientes SET NOT NULL;
        `);
        await queryInterface.sequelize.query(`
            ALTER TABLE ingresos_egresos ALTER COLUMN descripcion SET NOT NULL;
        `);
        await queryInterface.sequelize.query(`
            ALTER TABLE ingresos_egresos ALTER COLUMN proveedor SET NOT NULL;
        `);
    },
};
