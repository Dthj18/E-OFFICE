const { Pool } = require("pg");

const pool = new Pool({
  user: "axel",
  host: "localhost",
  database: "eoffice",
  password: "axelalv1029",
  port: 5432,
});

async function registrarAccion(subsistema, accion) {
  try {
    const query = `
      INSERT INTO registro_acciones (subsistema, accion, timestamp)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [subsistema, accion, new Date()]);
  } catch (error) {
    console.error("❌ Error al registrar acción:", error);
  }
}

async function registrarSensor(tipo, valor) {
  try {
    const query = `
      INSERT INTO registros_sensores (tipo, valor, timestamp)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [tipo, valor, new Date()]);
  } catch (error) {
    console.error("❌ Error al registrar sensor:", error);
  }
}

async function registrarEventoUsuario(evento) {
  try {
    const query = `
      INSERT INTO registro_acciones (subsistema, accion, timestamp)
      VALUES ('frontend', $1, $2)
    `;
    await pool.query(query, [evento, new Date()]);
  } catch (error) {
    console.error("❌ Error al registrar evento de usuario:", error);
  }
}

module.exports = {
  registrarAccion,
  registrarSensor,
  registrarEventoUsuario,
};
