export default {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('areas', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        await queryInterface.createTable('users', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false, unique: true },
            password: { type: Sequelize.STRING, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        await queryInterface.createTable('pacientes', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false },
            lastName: { type: Sequelize.STRING, allowNull: false },
            insurance: { type: Sequelize.STRING, allowNull: false },
            phoneNumber: { type: Sequelize.STRING, allowNull: false },
            gender: { type: Sequelize.STRING, allowNull: false },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        await queryInterface.createTable('medicos', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false },
            lastName: { type: Sequelize.STRING, allowNull: false },
            gender: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false },
            birthDate: { type: Sequelize.DATEONLY, allowNull: false },
            especiality: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'areas', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            status: { type: Sequelize.BOOLEAN, defaultValue: true },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        await queryInterface.createTable('citas', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            date: { type: Sequelize.DATEONLY, allowNull: false },
            hour: { type: Sequelize.STRING, allowNull: false },
            patient: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'pacientes', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            area: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'areas', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            medic: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'medicos', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            motivo: { type: Sequelize.TEXT, allowNull: false },
            status: { type: Sequelize.STRING, defaultValue: 'pendiente' },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        await queryInterface.createTable('ingresos_egresos', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            tipoTransaccion: { type: Sequelize.STRING, allowNull: false },
            fecha: { type: Sequelize.DATEONLY, allowNull: false },
            areas: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'areas', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            monto: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            descripcion: { type: Sequelize.TEXT, allowNull: false },
            pacientes: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'pacientes', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            proveedor: { type: Sequelize.STRING, allowNull: false },
            notasAdicionales: { type: Sequelize.TEXT, allowNull: true },
            estado: { type: Sequelize.BOOLEAN, defaultValue: true },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('ingresos_egresos');
        await queryInterface.dropTable('citas');
        await queryInterface.dropTable('medicos');
        await queryInterface.dropTable('pacientes');
        await queryInterface.dropTable('users');
        await queryInterface.dropTable('areas');
    }
};
