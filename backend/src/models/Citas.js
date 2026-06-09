import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { addIdAlias } from '../config/modelHelper.js';
import Paciente from './Pacientes.js';
import Area from './Area.js';
import Medico from './Medico.js';

const Cita = sequelize.define('Cita', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hour: {
        type: DataTypes.STRING,
        allowNull: false
    },
    patient: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Paciente,
            key: 'id'
        }
    },
    area: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Area,
            key: 'id'
        }
    },
    medic: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Medico,
            key: 'id'
        }
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pendiente'
    }
}, {
    tableName: 'citas',
    timestamps: true
});

Cita.belongsTo(Paciente, { foreignKey: 'patient', as: 'patientInfo' });
Cita.belongsTo(Area, { foreignKey: 'area', as: 'areaInfo' });
Cita.belongsTo(Medico, { foreignKey: 'medic', as: 'medicInfo' });

Paciente.hasMany(Cita, { foreignKey: 'patient', as: 'citas' });
Area.hasMany(Cita, { foreignKey: 'area', as: 'citas' });
Medico.hasMany(Cita, { foreignKey: 'medic', as: 'citas' });

addIdAlias(Cita);

export default Cita;
