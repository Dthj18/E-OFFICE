const Usuario  = require('../models/usuario.model');


const crearUsuario = async (usuarioDTO) => {
  const nuevoUsuario = await Usuario.create({
    nombre: usuarioDTO.nombre,
    correo: usuarioDTO.correo,
    contrasena: usuarioDTO.contrasena
  });
  return nuevoUsuario;
};

const buscarPorCorreo = async (correo) => {
  return await Usuario.findOne({ where: { correo } });
};

module.exports = {
  crearUsuario,
  buscarPorCorreo
};
