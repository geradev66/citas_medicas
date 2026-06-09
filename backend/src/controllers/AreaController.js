import Area from '../models/Area.js';

class AreaController {
    async getAllAreas(req, res) {
        try {
            const areas = await Area.findAll();
            res.status(200).json(areas);
        } catch (error) {
            console.error('Error al obtener las áreas:', error);
            res.status(500).json({ error: 'Error al obtener las áreas' });
        }
    }

    async createArea(req, res) {
        try {
            const nuevaArea = await Area.create(req.body);
            res.status(201).json(nuevaArea);
        } catch (error) {
            console.error('Error al crear la nueva area:', error);
            res.status(500).json({ error: 'Error al crear la nueva area' });
        }
    }

    async listarAreaPorId(req, res) {
        try {
            const area = await Area.findByPk(req.params.id);
            if (!area) {
                return res.status(404).json({ error: 'Area no encontrada' });
            }
            res.status(200).json(area);
        } catch (error) {
            console.error('Error al obtener la area por ID:', error);
            res.status(500).json({ error: 'Error al obtener la area por ID' });
        }
    }

    async actualizacionArea(req, res) {
        try {
            const area = await Area.findByPk(req.params.id);
            if (!area) {
                return res.status(404).json({ error: 'Area no encontrada' });
            }
            await area.update(req.body);
            res.status(200).json(area);
        } catch (error) {
            console.error('Error al actualizar la area:', error);
            res.status(500).json({ error: 'Error al actualizar la area' });
        }
    }

    async eliminarArea(req, res) {
        try {
            const area = await Area.findByPk(req.params.id);
            if (!area) {
                return res.status(404).json({ error: 'Area no encontrada' });
            }
            await area.destroy();
            res.status(200).json({ message: 'Area eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la area:', error);
            res.status(500).json({ error: 'Error al eliminar la area' });
        }
    }
}

export default new AreaController();
