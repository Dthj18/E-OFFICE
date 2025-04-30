const express = require('express');
const router = express.Router();
const comandosController = require('../controllers/comandos.controller');

// Ruta para obtener todos los comandos disponibles
router.get('/', comandosController.obtenerComandos);

// Ruta para enviar un comando
router.post('/', comandosController.enviarComando);

module.exports = router;
