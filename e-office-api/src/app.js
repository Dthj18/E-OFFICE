require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const express = require("express");
const path = require("path");

const comandosRoutes = require("./routes/comandos.routes");
const usuariosRoutes = require("./routes/usuarios.routes");

require("./services/cron.service"); 

const app = express();
app.use(express.json());

// Rutas
app.use("/api/comandos", comandosRoutes);
app.use("/api/usuarios", usuariosRoutes);


app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});


const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
