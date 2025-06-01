// config/sequelize.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('eoffice', 'axel', 'axelalv1029', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false,
});

module.exports = sequelize;