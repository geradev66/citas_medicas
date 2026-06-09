import {Router} from 'express'
import PacienteController from '../controllers/PacienteController.js'
import auth from '../middleware/auth.js'

const router = Router()
router.get('/', auth, PacienteController.listarPacientes)
router.get('/export/excel', auth, PacienteController.exportarExcelPacientes)
router.get('/:id', auth, PacienteController.listarPacientePorId)
router.post('/', auth, PacienteController.crearPaciente)
router.put('/:id', auth, PacienteController.actualizarPaciente)
router.delete('/:id', auth, PacienteController.eliminarPaciente)

export default router