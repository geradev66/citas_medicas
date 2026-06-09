import { Router } from "express";
import ingresosEgresosController from "../controllers/IngresosEgresosController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get('/', auth, ingresosEgresosController.listar);
router.get('/balance', auth, ingresosEgresosController.balance);
router.get('/resumen/periodo', auth, ingresosEgresosController.resumenPorPeriodo);
router.get('/resumen/area', auth, ingresosEgresosController.resumenPorArea);
router.get('/:id', auth, ingresosEgresosController.listarPorId);
router.post('/', auth, ingresosEgresosController.crear);
router.put('/:id', auth, ingresosEgresosController.actualizar);
router.delete('/:id', auth, ingresosEgresosController.eliminar);

export default router;