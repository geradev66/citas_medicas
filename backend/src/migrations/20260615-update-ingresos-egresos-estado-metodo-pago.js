export default {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('ingresos_egresos');

        if (!table.metodoPago) {
            await queryInterface.addColumn('ingresos_egresos', 'metodoPago', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }

        const estadoType = (table.estado?.type || '').toLowerCase();
        if (estadoType.includes('bool')) {
            await queryInterface.sequelize.query(`
                ALTER TABLE ingresos_egresos
                ALTER COLUMN estado DROP DEFAULT;
            `);

            await queryInterface.sequelize.query(`
                ALTER TABLE ingresos_egresos
                ALTER COLUMN estado TYPE VARCHAR(255)
                USING CASE
                    WHEN estado = true THEN 'confirmado'
                    WHEN estado = false THEN 'pendiente'
                    ELSE 'pendiente'
                END;
            `);

            await queryInterface.changeColumn('ingresos_egresos', 'estado', {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'pendiente',
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('ingresos_egresos');

        const estadoType = (table.estado?.type || '').toLowerCase();
        if (!estadoType.includes('bool')) {
            await queryInterface.sequelize.query(`
                ALTER TABLE ingresos_egresos
                ALTER COLUMN estado TYPE BOOLEAN
                USING CASE
                    WHEN estado = 'conciliado' THEN true
                    WHEN estado = 'confirmado' THEN true
                    ELSE false
                END;
            `);

            await queryInterface.changeColumn('ingresos_egresos', 'estado', {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            });
        }

        if (table.metodoPago) {
            await queryInterface.removeColumn('ingresos_egresos', 'metodoPago');
        }
    },
};
