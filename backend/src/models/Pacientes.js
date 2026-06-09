import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { addIdAlias } from '../config/modelHelper.js';

const Paciente = sequelize.define('Paciente', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    insurance: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'pacientes',
    timestamps: true
});

addIdAlias(Paciente);

export default Paciente;
