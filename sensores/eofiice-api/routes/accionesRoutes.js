const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddeleware');
const { registrarAccion } = require('../controllers/user'); // tu archivo original

router.post('/accion', authenticateToken, async (req, res) => {
  const { subsistema, accion } = req.body;
  const correo = req.user.mail;

  // Si quieres también usar el nombre, puedes consultarlo desde la DB:
  const { Pool } = require("pg");
  const pool = new Pool({
    user: "axel",
    host: "localhost",
    database: "eoffice",
    password: "axelalv1029",
    port: 5432,
  });

  try {
    const result = await pool.query('SELECT name FROM usuarios WHERE mail = $1', [correo]);
    const nombre = result.rows[0]?.name || 'Desconocido';

    await registrarAccion(subsistema, accion, nombre, correo);
    res.json({ message: 'Acción registrada correctamente' });
  } catch (error) {
    console.error('Error al registrar acción:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;