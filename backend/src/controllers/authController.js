import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default {
    async register(req, res) {
        try {
            console.log('register body:', req.body);
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Faltan campos: nombre, email o password' });
            }

            const userExists = await User.findOne({ where: { email } });
            if (userExists) {
                return res.status(400).json({ success: false, message: "El usuario ya existe" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                name,
                email,
                password: hashedPassword
            });

            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.status(201).json({
                success: true,
                message: "Usuario creado",
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });

        } catch (error) {
            console.error('Error en register:', error);
            res.status(500).json({ success: false, message: "Error en registro" });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ success: false, message: "Credenciales inválidas" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Credenciales inválidas" });
            }

            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ success: false, message: "Error en login" });
        }
    }
};
