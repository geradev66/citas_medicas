import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { addIdAlias } from '../config/modelHelper.js';
import Area from './Area.js';

const Medico = sequelize.define('Medico', {
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
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    especiality: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Area,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'medicos',
    timestamps: true
});

Medico.belongsTo(Area, { foreignKey: 'especiality', as: 'especialidad' });
Area.hasMany(Medico, { foreignKey: 'especiality', as: 'medicos' });

addIdAlias(Medico);

export default Medico;
