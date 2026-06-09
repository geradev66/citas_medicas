import Cita from '../models/Citas.js';
import Paciente from '../models/Pacientes.js';
import Area from '../models/Area.js';
import Medico from '../models/Medico.js';

const citaIncludes = [
    { model: Paciente, as: 'patientInfo' },
    { model: Area, as: 'areaInfo' },
    { model: Medico, as: 'medicInfo', include: { model: Area, as: 'especialidad' } }
];

const mapMedic = (m) => m ? {
    _id: m.id, name: m.name, lastName: m.lastName,
    especiality: m.especialidad ? { _id: m.especialidad.id, name: m.especialidad.name } : m.especiality
} : null;

const mapCita = (c) => ({
    _id: c.id,
    date: c.date,
    hour: c.hour,
    patient: c.patientInfo ? { _id: c.patientInfo.id, name: c.patientInfo.name, lastName: c.patientInfo.lastName } : null,
    area: c.areaInfo ? { _id: c.areaInfo.id, name: c.areaInfo.name } : null,
    medic: mapMedic(c.medicInfo),
    motivo: c.motivo,
    status: c.status
});

class CitasController {
    async listarCitas(req,res){
        try{
            const citas = await Cita.findAll({ include: citaIncludes });
            res.status(200).json(citas.map(mapCita));
        }catch(error){
            console.error('Error al obtener las citas:', error);
            res.status(500).json({error: error.message})
        }
    }

    async crearCita(req,res){
        try{
            const cita = await Cita.create({
                date: req.body.date,
                hour: req.body.hour,
                patient: req.body.patient,
                area: req.body.area,
                medic: req.body.medic,
                motivo: req.body.motivo,
                status: req.body.status || 'pendiente'
            });
            const creada = await Cita.findByPk(cita.id, { include: citaIncludes });
            res.status(201).json(mapCita(creada));
        }catch(error){
            console.error('Error al crear la cita:', error);
            res.status(500).json({error: error.message})
        }
    }

    async listarCitasPorId(req, res){
        try{
            const cita = await Cita.findByPk(req.params.id, { include: citaIncludes });
            if(!cita){
                return res.status(404).json({error: 'Cita no encontrada'})
            }
            res.status(200).json(mapCita(cita));
        }catch(error){
            console.error('Error al obtener la cita por ID:', error);
            res.status(500).json({error: error.message})
        }
    }

    async actualizarCita(req, res){
        try{
            const cita = await Cita.findByPk(req.params.id);
            if(!cita){
                return res.status(404).json({error: 'Cita no encontrada'})
            }
            await cita.update(req.body);
            const actualizada = await Cita.findByPk(cita.id, { include: citaIncludes });
            res.status(200).json(mapCita(actualizada));
        }catch(error){
            console.error('Error al actualizar la cita:', error);
            res.status(500).json({error: error.message})
        }
    }

    async eliminarCita(req,res){
        try{
            const cita = await Cita.findByPk(req.params.id);
            if(!cita){
                return res.status(404).json({error: 'Cita no encontrada'})
            }
            await cita.destroy();
            res.status(200).json({message: 'Cita eliminada correctamente'})
        }catch(error){
            console.error('Error al eliminar la cita:', error);
            res.status(500).json({error: error.message})
        }
    }
}

export default new CitasController();
