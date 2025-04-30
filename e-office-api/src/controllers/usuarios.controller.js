const usuarioService = require('../services/usuario.service');

exports.registrar = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    const usuario = await usuarioService.registrarUsuario({ nombre, correo, contrasena });
    res.status(201).json({ mensaje: 'Usuario registrado', usuario });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};
