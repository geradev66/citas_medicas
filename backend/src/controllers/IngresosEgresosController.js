import IngresosEgresos from '../models/IngresosEgresos.js';
import Area from '../models/Area.js';
import Paciente from '../models/Pacientes.js';
import { obtenerBalance, obtenerResumenPorPeriodo, obtenerResumenPorArea } from '../../services/ingresosEgresos.service.js';
import { exportIngresosEgresosToExcel } from '../../services/excelIngresosEgresos.service.js';

class IngresosEgresosController {
    async listar(req, res){
        try{
            const registros = await IngresosEgresos.findAll({
                include: [
                    { model: Area, as: 'areaInfo' },
                    { model: Paciente, as: 'pacienteInfo' }
                ]
            });
            res.status(200).json(registros);
        }catch(error){
            console.error('Error al obtener ingresos/egresos:', error);
            res.status(500).json({error: 'Error al obtener los registros'})
        }
    }

    async listarPorId(req, res){
        try{
            const registro = await IngresosEgresos.findByPk(req.params.id, {
                include: [
                    { model: Area, as: 'areaInfo' },
                    { model: Paciente, as: 'pacienteInfo' }
                ]
            });
            if(!registro){
                return res.status(404).json({error: 'Registro no encontrado'})
            }
            res.status(200).json(registro);
        }catch(error){
            console.error('Error al obtener el registro:', error);
            res.status(500).json({error: 'Error al obtener el registro'})
        }
    }

    async crear(req, res){
        try{
            const nuevo = await IngresosEgresos.create(req.body);
            const poblado = await IngresosEgresos.findByPk(nuevo.id, {
                include: [
                    { model: Area, as: 'areaInfo' },
                    { model: Paciente, as: 'pacienteInfo' }
                ]
            });
            res.status(201).json(poblado);
        }catch(error){
            console.error('Error al crear el registro:', error);
            res.status(500).json({error: 'Error al crear el registro'})
        }
    }

    async actualizar(req, res){
        try{
            const registro = await IngresosEgresos.findByPk(req.params.id);
            if(!registro){
                return res.status(404).json({error: 'Registro no encontrado'})
            }
            await registro.update(req.body);
            const actualizado = await IngresosEgresos.findByPk(registro.id, {
                include: [
                    { model: Area, as: 'areaInfo' },
                    { model: Paciente, as: 'pacienteInfo' }
                ]
            });
            res.status(200).json(actualizado);
        }catch(error){
            console.error('Error al actualizar el registro:', error);
            res.status(500).json({error: 'Error al actualizar el registro'})
        }
    }

    async eliminar(req, res){
        try{
            const registro = await IngresosEgresos.findByPk(req.params.id);
            if(!registro){
                return res.status(404).json({error: 'Registro no encontrado'})
            }
            await registro.destroy();
            res.status(200).json({message: 'Registro eliminado correctamente'})
        }catch(error){
            console.error('Error al eliminar el registro:', error);
            res.status(500).json({error: 'Error al eliminar el registro'})
        }
    }

    async exportarExcel(req, res){
        try{
            const registros = await IngresosEgresos.findAll({
                include: [
                    { model: Area, as: 'areaInfo' },
                    { model: Paciente, as: 'pacienteInfo' }
                ]
            });
            const workbook = await exportIngresosEgresosToExcel(registros);
            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=ingresos_egresos.xlsx');
            res.send(buffer);
        }catch(error){
            console.error('Error al exportar a Excel:', error);
            res.status(500).json({error: 'Error al exportar a Excel'})
        }
    }

    async balance(req, res){
        try{
            const resultado = await obtenerBalance(req.query);
            res.status(200).json(resultado);
        }catch(error){
            console.error('Error al obtener el balance:', error);
            res.status(500).json({error: 'Error al obtener el balance'})
        }
    }

    async resumenPorPeriodo(req, res){
        try{
            const periodo = req.query.periodo || 'diario';
            const resultado = await obtenerResumenPorPeriodo(periodo, req.query);
            res.status(200).json(resultado);
        }catch(error){
            console.error('Error al obtener el resumen:', error);
            res.status(500).json({error: 'Error al obtener el resumen'})
        }
    }

    async resumenPorArea(req, res){
        try{
            const resultado = await obtenerResumenPorArea(req.query);
            res.status(200).json(resultado);
        }catch(error){
            console.error('Error al obtener el resumen por área:', error);
            res.status(500).json({error: 'Error al obtener el resumen por área'})
        }
    }
}

export default new IngresosEgresosController();
