import { Op, fn, col, literal } from 'sequelize';
import IngresosEgresos from '../src/models/IngresosEgresos.js';
import Area from '../src/models/Area.js';

export const obtenerBalance = async (filtros = {}) => {
    const where = {};
    if (filtros.fechaInicio || filtros.fechaFin) {
        where.fecha = {};
        if (filtros.fechaInicio) where.fecha[Op.gte] = filtros.fechaInicio;
        if (filtros.fechaFin) where.fecha[Op.lte] = filtros.fechaFin;
    }
    if (filtros.areas) where.areas = filtros.areas;

    const registros = await IngresosEgresos.findAll({ where, attributes: ['tipoTransaccion', [fn('SUM', col('monto')), 'total'], [fn('COUNT', col('id')), 'cantidad']], group: ['tipoTransaccion'], raw: true });

    const ingresos = registros.find(r => r.tipoTransaccion === 'ingreso');
    const egresos = registros.find(r => r.tipoTransaccion === 'egreso');

    return {
        ingresos: parseFloat(ingresos?.total || 0),
        egresos: parseFloat(egresos?.total || 0),
        balance: parseFloat(ingresos?.total || 0) - parseFloat(egresos?.total || 0),
        cantidadIngresos: parseInt(ingresos?.cantidad || 0),
        cantidadEgresos: parseInt(egresos?.cantidad || 0)
    };
};

export const obtenerResumenPorPeriodo = async (periodo = 'diario', filtros = {}) => {
    const where = {};
    if (filtros.fechaInicio || filtros.fechaFin) {
        where.fecha = {};
        if (filtros.fechaInicio) where.fecha[Op.gte] = filtros.fechaInicio;
        if (filtros.fechaFin) where.fecha[Op.lte] = filtros.fechaFin;
    }

    let fechaTrunc;
    if (periodo === 'diario') fechaTrunc = fn('DATE_TRUNC', 'day', col('fecha'));
    else if (periodo === 'mensual') fechaTrunc = fn('DATE_TRUNC', 'month', col('fecha'));
    else fechaTrunc = fn('DATE_TRUNC', 'week', col('fecha'));

    const registros = await IngresosEgresos.findAll({
        where,
        attributes: [[fechaTrunc, 'periodo'], 'tipoTransaccion', [fn('SUM', col('monto')), 'total']],
        group: [fn('DATE_TRUNC', periodo === 'diario' ? 'day' : periodo === 'mensual' ? 'month' : 'week', col('fecha')), 'tipoTransaccion'],
        order: [[literal('periodo'), 'ASC']],
        raw: true
    });

    const agrupado = {};
    registros.forEach(r => {
        const key = r.periodo;
        if (!agrupado[key]) agrupado[key] = { periodo: key, ingresos: 0, egresos: 0, balance: 0 };
        if (r.tipoTransaccion === 'ingreso') agrupado[key].ingresos = parseFloat(r.total);
        else agrupado[key].egresos = parseFloat(r.total);
        agrupado[key].balance = agrupado[key].ingresos - agrupado[key].egresos;
    });

    return Object.values(agrupado);
};

export const obtenerResumenPorArea = async (filtros = {}) => {
    const where = {};
    if (filtros.fechaInicio || filtros.fechaFin) {
        where.fecha = {};
        if (filtros.fechaInicio) where.fecha[Op.gte] = filtros.fechaInicio;
        if (filtros.fechaFin) where.fecha[Op.lte] = filtros.fechaFin;
    }

    const registros = await IngresosEgresos.findAll({
        where,
        include: [{ model: Area, as: 'areaInfo', attributes: ['name'] }],
        attributes: ['tipoTransaccion', [fn('SUM', col('monto')), 'total'], [fn('COUNT', col('IngresosEgresos.id')), 'cantidad']],
        group: ['areaInfo.name', 'tipoTransaccion'],
        raw: true
    });

    const agrupado = {};
    registros.forEach(r => {
        const area = r['areaInfo.name'];
        if (!agrupado[area]) agrupado[area] = { area, ingresos: 0, egresos: 0 };
        if (r.tipoTransaccion === 'ingreso') agrupado[area].ingresos = parseFloat(r.total);
        else agrupado[area].egresos = parseFloat(r.total);
    });

    return Object.values(agrupado);
};
