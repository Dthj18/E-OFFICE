const bcrypt = require('bcryptjs');
const UsuarioDTO = require('../dtos/UsuarioDTO');
const usuarioRepo = require('../repositories/usuario.repository');

const registrarUsuario = async ({ nombre, correo, contrasena }) => {
  const existe = await usuarioRepo.buscarPorCorreo(correo);
  if (existe) throw new Error('El correo ya está registrado');

  const hash = await bcrypt.hash(contrasena, 10);
  const usuarioDTO = new UsuarioDTO({ nombre, correo, contrasena: hash });

  const usuarioGuardado = await usuarioRepo.crearUsuario(usuarioDTO);
  return new UsuarioDTO({
    id: usuarioGuardado.id_usuario,
    nombre: usuarioGuardado.nombre,
    correo: usuarioGuardado.correo
  });
};

module.exports = {
  registrarUsuario
};
