require('dotenv').config(); // Carga variables del .env
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { client, setModo, esModoAutomatico } = require("./mqttClient");
const sequelize = require("./config/sequelize");
const userRoutes = require("./routes/userRoutes");
const accionesRoutes = require('./routes/accionesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middlewares para procesar JSON y formularios
app.use(cors());
app.use(express.json()); // ✅ Recomendado en lugar de bodyParser.json()
app.use(express.urlencoded({ extended: true })); // ✅ Para leer datos tipo form
app.use('/api', accionesRoutes);

// Rutas MQTT
app.post("/modo", (req, res) => {
  const { modo } = req.body;

  if (!modo || typeof modo !== "string") {
    return res.status(400).json({ error: "modo debe ser un string válido" });
  }

  const modoValido = modo.toLowerCase();
  const modosPermitidos = ["automatico", "manual", "vacaciones", "noche"];

  if (!modosPermitidos.includes(modoValido)) {
    return res.status(400).json({ error: "modo no reconocido" });
  }

  setModo(modoValido);
  res.json({ mensaje: `Modo actualizado a ${modoValido}` });
});

// Rutas de usuarios (registro, login)
app.use("/api/users", userRoutes);

// Conectar a base de datos y arrancar el servidor
sequelize.authenticate()
  .then(() => {
    console.log("✅ Conectado a PostgreSQL");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API escuchando en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Error al conectar a la base de datos:", err);
  });