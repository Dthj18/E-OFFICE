const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

// Registro de usuario
const register = async (req, res) => {
  try {
    const { name, lastname, mail, password } = req.body;

    // Validación básica
    if (!name || !lastname || !mail || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Verifica si el usuario ya existe
    const existingUser = await Usuario.findOne({ where: { mail } });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    // Encripta la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el usuario
    const newUser = await Usuario.create({
      name,
      lastname,
      mail,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  }
};

// Inicio de sesión
const login = async (req, res) => {
  try {
    const { mail, password } = req.body;

    const user = await Usuario.findOne({ where: { mail } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: user.id, mail: user.mail },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        name: user.name,
        mail: user.mail
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};

module.exports = {
  register,
  login
};