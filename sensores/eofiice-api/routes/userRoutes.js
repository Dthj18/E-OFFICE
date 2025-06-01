const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/user');

// Ruta para registrar
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

module.exports = router;