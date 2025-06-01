const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Importa la conexión

const Usuario = sequelize.define('usuarios', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'usuarios', // Nombre real de la tabla en la DB
  timestamps: false      // Si no usas createdAt y updatedAt
});

module.exports = Usuario;