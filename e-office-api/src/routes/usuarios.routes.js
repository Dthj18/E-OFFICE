const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios.controller');  // Asegúrate de que esta ruta esté bien

// Ruta para registrar usuario
router.post('/registro', usuarioController.registrar);

module.exports = router;
