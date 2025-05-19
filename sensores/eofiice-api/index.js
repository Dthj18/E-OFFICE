const express = require("express");
const app = express();
const PORT = 3000;

const { client, getModoAutomatico, setModoAutomatico } = require("./mqttClient");
const { registrarEventoUsuario } = require("./db");

app.use(express.json());

const estadoSubsistemas = {
  aire: { encendido: false },
  persianas: { abiertas: true },
  luces: { encendidas: false },
  audio: { encendido: false },
};

client.on("message", (topic, message) => {
  const payload = JSON.parse(message.toString());

  const esTrigger = topic.includes("trigger");
  if (!getModoAutomatico() && esTrigger) {
    console.log("⚠️ Modo manual: ignorando trigger automático");
    return;
  }

  // Aire acondicionado
  if (topic === "eoffice/aire/trigger" && !estadoSubsistemas.aire.encendido) {
    estadoSubsistemas.aire.encendido = true;
    console.log("🚦 Encender aire");
    client.publish("eoffice/aire/actuador", JSON.stringify({ accion: "encender" }));
  }

  if (topic === "eoffice/aire/trigger_apagar" && estadoSubsistemas.aire.encendido) {
    estadoSubsistemas.aire.encendido = false;
    console.log("🚦 Apagar aire");
    client.publish("eoffice/aire/actuador", JSON.stringify({ accion: "apagar" }));
  }

  // Persianas
  if (topic === "eoffice/persianas/trigger_abrir" && !estadoSubsistemas.persianas.abiertas) {
    estadoSubsistemas.persianas.abiertas = true;
    console.log("🪟 Abrir persianas");
    client.publish("eoffice/persianas/actuador", JSON.stringify({ accion: "abrir" }));
  }

  if (topic === "eoffice/persianas/trigger_cerrar" && estadoSubsistemas.persianas.abiertas) {
    estadoSubsistemas.persianas.abiertas = false;
    console.log("🪟 Cerrar persianas");
    client.publish("eoffice/persianas/actuador", JSON.stringify({ accion: "cerrar" }));
  }

  // Luces
  if (topic === "eoffice/luces/trigger_encender" && !estadoSubsistemas.luces.encendidas) {
    estadoSubsistemas.luces.encendidas = true;
    console.log("💡 Encender luces");
    client.publish("eoffice/luces/actuador", JSON.stringify({ accion: "encender" }));
  }

  if (topic === "eoffice/luces/trigger_apagar" && estadoSubsistemas.luces.encendidas) {
    estadoSubsistemas.luces.encendidas = false;
    console.log("💡 Apagar luces");
    client.publish("eoffice/luces/actuador", JSON.stringify({ accion: "apagar" }));
  }

  // Audio
  if (topic === "eoffice/audio/trigger_subir_volumen" && estadoSubsistemas.audio.encendido) {
    console.log("🎶 Subir volumen");
    client.publish("eoffice/audio/actuador", JSON.stringify({ accion: "subir_volumen" }));
  }

  if (topic === "eoffice/audio/trigger_bajar_volumen" && estadoSubsistemas.audio.encendido) {
    console.log("🎶 Bajar volumen");
    client.publish("eoffice/audio/actuador", JSON.stringify({ accion: "bajar_volumen" }));
  }
});

// Endpoints REST
app.get("/", (req, res) => {
  res.send("✅ API E-Office funcionando");
});

app.get("/modo", (req, res) => {
  res.json({ modo: getModoAutomatico() ? "automático" : "manual" });
});

app.post("/modo", async (req, res) => {
  const { automatico } = req.body;
  if (typeof automatico !== "boolean") {
    return res.status(400).json({ error: "Debe enviar un valor booleano" });
  }
  setModoAutomatico(automatico);
  res.json({ mensaje: `Modo cambiado a ${automatico ? "automático" : "manual"}` });
});

// Nuevo endpoint para registrar acciones manuales del usuario desde frontend
app.post("/accion", async (req, res) => {
  const { accion } = req.body;
  if (typeof accion !== "string" || !accion.trim()) {
    return res.status(400).json({ error: "Debe enviar una acción válida (texto)" });
  }
  await registrarEventoUsuario(accion);
  res.json({ mensaje: `Acción registrada: ${accion}` });
});

app.listen(PORT, () => {
  console.log(`🚀 API en http://localhost:${PORT}`);
});
