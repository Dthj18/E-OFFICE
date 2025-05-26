const express = require("express");
const bodyParser = require("body-parser");
const { client, setModo, esModoAutomatico } = require("./mqttClient");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

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


app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
});
