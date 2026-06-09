import { Router } from "express";
import medicoController from "../controllers/MedicoController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get('/', auth, medicoController.listarMedicos);
router.get('/export/excel', auth, medicoController.exportarExcel);
router.get('/:id', auth, medicoController.listarMedicoPorId);
router.post('/', auth, medicoController.crearMedico);
router.put('/:id', auth, medicoController.actualizarMedico);
router.delete('/:id', auth, medicoController.eliminarMedico);

export default router;