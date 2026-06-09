import { Router } from 'express';
import AreaController from '../controllers/AreaController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', AreaController.getAllAreas);
router.get('/:id', AreaController.listarAreaPorId);
router.post('/', auth, AreaController.createArea);
router.put('/:id', auth, AreaController.actualizacionArea);
router.delete('/:id', auth, AreaController.eliminarArea);

export default router;
