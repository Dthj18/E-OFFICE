class UsuarioDTO {
    constructor({ id, nombre, correo, contrasena }) {
      this.id = id;
      this.nombre = nombre;
      this.correo = correo;
      this.contrasena = contrasena;
    }
  }
  
  module.exports = UsuarioDTO;