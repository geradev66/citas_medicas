import {Router} from 'express'
import CitasController from '../controllers/CitasController.js'
import auth from '../middleware/auth.js'

const router = Router()

export default router
router.get('/', auth, CitasController.listarCitas)
router.get('/:id', auth, CitasController.listarCitasPorId)
router.post('/', auth, CitasController.crearCita)
router.put('/:id', auth, CitasController.actualizarCita)
router.delete('/:id', auth, CitasController.eliminarCita)