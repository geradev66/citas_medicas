import authRoutes from "./authRoutes.js";
import areaRoutes from "./areaRoutes.js";
import medicosRoutes from "./medicoRoute.js";
import pacientesRoutes from "./pacienteRoutes.js";
import citasRoutes from "./citasRoutes.js";
import ingresosEgresosRoutes from "./IngresosEgresos.js";

const routes = (app) => {
    app.get('/', (req, res) => {
        res.status(200).send('Bienvenido al api de la clinica');
    });
    app.use("/auth", authRoutes);
    app.use("/areas", areaRoutes);
    app.use("/medicos", medicosRoutes);
    app.use("/pacientes", pacientesRoutes);
    app.use("/citas", citasRoutes);
    app.use("/ingresos-egresos", ingresosEgresosRoutes);
};

export default routes;
