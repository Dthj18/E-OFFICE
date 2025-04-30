const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_usuario'
  },
  nombre: {
    type: DataTypes.STRING,
    field: 'nombre'
  },
  correo: {
    type: DataTypes.STRING,
    unique: true,
    field: 'correo'
  },
  contrasena: {
    type: DataTypes.STRING,
    field: 'password_hash'
  }
}, {
  tableName: 'usuario',
  timestamps: false
});

module.exports = Usuario;
