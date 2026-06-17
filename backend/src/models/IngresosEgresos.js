import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { addIdAlias } from '../config/modelHelper.js';
import Area from './Area.js';
import Paciente from './Pacientes.js';

const IngresosEgresos = sequelize.define('IngresosEgresos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipoTransaccion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    areas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Area,
            key: 'id'
        }
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    pacientes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Paciente,
            key: 'id'
        }
    },
    proveedor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notasAdicionales: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente'
    },
    metodoPago: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'ingresos_egresos',
    timestamps: true
});

IngresosEgresos.belongsTo(Area, { foreignKey: 'areas', as: 'areaInfo' });
IngresosEgresos.belongsTo(Paciente, { foreignKey: 'pacientes', as: 'pacienteInfo' });
Area.hasMany(IngresosEgresos, { foreignKey: 'areas', as: 'ingresosEgresos' });
Paciente.hasMany(IngresosEgresos, { foreignKey: 'pacientes', as: 'ingresosEgresos' });

addIdAlias(IngresosEgresos);

export default IngresosEgresos;
