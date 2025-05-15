// db.js
const { Pool } = require('pg');
const pool = new Pool({
  user: 'axel',
  host: 'localhost',
  database: 'eoffice',
  password: 'axelalv1029',
  port: 5432,
});

// Función para guardar acción en la base de datos
async function registrarAccion(subsistema, accion) {
  const query = `
    INSERT INTO registro_acciones (subsistema, accion, timestamp)
    VALUES ($1, $2, $3)
  `;
  await pool.query(query, [subsistema, accion, new Date()]);
}

// Función para guardar lectura del sensor
async function registrarSensor(tipo, valor) {
  const query = `
    INSERT INTO registros_sensores (tipo, valor, timestamp)
    VALUES ($1, $2, $3)
  `;
  await pool.query(query, [tipo, valor, new Date()]);
}

module.exports = { registrarAccion, registrarSensor };
