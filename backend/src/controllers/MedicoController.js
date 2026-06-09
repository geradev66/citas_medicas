import Medico from '../models/Medico.js';
import Area from '../models/Area.js';
import { exportMedicosToExcel } from '../../services/excel.service.js';

const mapMedico = (m) => {
    const json = m.toJSON();
    json.especiality = json.especialidad
        ? { _id: json.especialidad.id, id: json.especialidad.id, name: json.especialidad.name }
        : json.especiality;
    delete json.especialidad;
    return json;
};

class MedicoController {
    async listarMedicos(req, res){
        try{
            const medicos = await Medico.findAll({ include: { model: Area, as: 'especialidad' } });
            res.status(200).json(medicos.map(mapMedico));
        }catch(error){
            console.error('Error al obtener los medicos:', error);
            res.status(500).json({error: 'Error al obtener los medicos'})
        }
    }

    async crearMedico(req, res){
        try{
            const nuevoMedico = await Medico.create(req.body);
            const conArea = await Medico.findByPk(nuevoMedico.id, { include: { model: Area, as: 'especialidad' } });
            res.status(201).json(mapMedico(conArea));
        }catch(error){
            console.error('Error al crear el medico:', error);
            res.status(500).json({error: 'Error al crear el medico'})
        }
    }

    async listarMedicoPorId(req, res){
        try{
            const medico = await Medico.findByPk(req.params.id, { include: { model: Area, as: 'especialidad' } });
            if(!medico){
                return res.status(404).json({error: 'Medico no encontrado'})
            }
            res.status(200).json(mapMedico(medico));
        }catch(error){
            console.error('Error al obtener el medico por ID:', error);
            res.status(500).json({error: 'Error al obtener el medico por ID'})
        }
    }

    async actualizarMedico(req, res){
        try{
            const medico = await Medico.findByPk(req.params.id);
            if(!medico){
                return res.status(404).json({error: 'Medico no encontrado'})
            }
            await medico.update(req.body);
            const actualizado = await Medico.findByPk(medico.id, { include: { model: Area, as: 'especialidad' } }); // trae el area del medico y busca porid
            res.status(200).json(mapMedico(actualizado));
        }catch(error){
            console.error('Error al actualizar el medico:', error);
            res.status(500).json({error: 'Error al actualizar el medico'})
        }
    }

    async exportarExcel(req, res){
        try{
            const medicos = await Medico.findAll({ include: { model: Area, as: 'especialidad' } });
            const workbook = await exportMedicosToExcel(medicos);
            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=medicos.xlsx');
            res.send(buffer);
        }catch(error){
            console.error('Error al exportar medicos a Excel:', error);
            res.status(500).json({error: 'Error al exportar medicos a Excel'})
        }
    }

    async eliminarMedico(req, res){
        try{
            const medico = await Medico.findByPk(req.params.id);
            if(!medico){
                return res.status(404).json({error: 'Medico no encontrado'})
            }
            await medico.destroy();
            res.status(200).json({message: 'Medico eliminado correctamente'})
        }catch(error){
            console.error('Error al eliminar el medico:', error);
            res.status(500).json({error: 'Error al eliminar el medico'})
        }
    }
}

export default new MedicoController();
