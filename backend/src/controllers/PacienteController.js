import Paciente from "../models/Pacientes.js";
import { exportPacientesToExcel } from "../../services/excelPaciente.service.js";

class PacienteController {
    async listarPacientes(req, res) {
        try {
            const pacientes = await Paciente.findAll()
            res.status(200).json(pacientes)
        } catch (error) {
            console.error('Error al obtener los pacientes:', error);
            res.status(500).json({error: error.message})
        }
    }

    async crearPaciente(req, res) {
        try {
            const nuevoPaciente = await Paciente.create(req.body)
            res.status(201).json(nuevoPaciente)
        } catch (error) {
            console.error('Error al crear el paciente:', error);
            res.status(500).json({error: error.message})
        }
    }

    async listarPacientePorId(req, res) {
        try {
            const paciente = await Paciente.findByPk(req.params.id)
            if (!paciente) {
                return res.status(404).json({error: 'Paciente no encontrado'});
            }
            res.status(200).json(paciente)
        } catch (error) {
            console.error('Error al obtener el paciente por ID:', error)
            res.status(500).json({error: error.message})
        }
    }

    async actualizarPaciente(req,res){
        try{
            const paciente = await Paciente.findByPk(req.params.id)
            if(!paciente){
                return res.status(404).json({error: 'Paciente no encontrado'})
            }
            await paciente.update(req.body)
            res.status(200).json(paciente)
        }catch(error){
            console.error('Error al actualizar el paciente:', error);
            res.status(500).json({error: error.message})
        }
    }

    async exportarExcelPacientes(req, res) {
        try{
            const pacientes = await Paciente.findAll()
            const workbook = await exportPacientesToExcel(pacientes)
            const buffer = await workbook.xlsx.writeBuffer()
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            res.setHeader('Content-Disposition', 'attachment; filename=pacientes.xlsx')
            res.send(buffer)
        }catch(error){
            console.error('Error al exportar pacientes a Excel:', error);
            res.status(500).json({error: error.message})
        }
    }

    async eliminarPaciente(req,res){
        try{
            const paciente = await Paciente.findByPk(req.params.id)
            if(!paciente){
                return res.status(404).json({error: 'Paciente no encontrado'})
            }
            await paciente.destroy()
            res.status(200).json({message: 'Paciente eliminado correctamente'})
        }catch(error){
            console.error('Error al eliminar el paciente:', error);
            res.status(500).json({error: error.message})
        }
    }
}

export default new PacienteController();
