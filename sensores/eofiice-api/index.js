 /*const express = require("express");
const mqtt = require("mqtt");

const app = express();
const PORT = 3000;

// 📡 Conexión al broker
const MQTT_BROKER = "mqtt://127.0.0.1";

// 🧭 Tópicos sensores
const TOPIC_SENSOR_TEMP = "eoffice/temperatura/sensor";
const TOPIC_SENSOR_LUZ = "eoffice/luz/sensor";
const TOPIC_SENSOR_RUIDO = "eoffice/ruido/sensor";

// 🧭 Tópicos triggers
const TOPIC_TRIGGER_ENCENDER_AIRE = "eoffice/aire/trigger";
const TOPIC_TRIGGER_APAGAR_AIRE = "eoffice/aire/trigger_apagar";
const TOPIC_TRIGGER_ABRIR_PERSIANAS = "eoffice/persianas/trigger_abrir";
const TOPIC_TRIGGER_CERRAR_PERSIANAS = "eoffice/persianas/trigger_cerrar";
const TOPIC_TRIGGER_ENCENDER_LUCES = "eoffice/luces/trigger_encender";
const TOPIC_TRIGGER_APAGAR_LUCES = "eoffice/luces/trigger_apagar";
const TOPIC_TRIGGER_SUBIR_VOLUMEN = "eoffice/audio/trigger_subir_volumen";
const TOPIC_TRIGGER_BAJAR_VOLUMEN = "eoffice/audio/trigger_bajar_volumen";

// 🧭 Tópicos actuadores
const TOPIC_ACTUADOR_AIRE = "eoffice/aire/actuador";
const TOPIC_ACTUADOR_PERSIANAS = "eoffice/persianas/actuador";
const TOPIC_ACTUADOR_LUCES = "eoffice/luces/actuador";
const TOPIC_ACTUADOR_AUDIO = "eoffice/audio/actuador";

// 🔘 Estado de los subsistemas
const estadoSubsistemas = {
  aire: { encendido: false },
  persianas: { abiertas: true },
  luces: { encendidas: false },
  audio: { encendido: false }
};

// 🔌 Conexión MQTT
const client = mqtt.connect(MQTT_BROKER);

client.on("connect", () => {
  console.log("🔌 Conectado al broker MQTT");

  client.subscribe([
    TOPIC_SENSOR_TEMP,
    TOPIC_SENSOR_LUZ,
    TOPIC_SENSOR_RUIDO,
    TOPIC_TRIGGER_ENCENDER_AIRE,
    TOPIC_TRIGGER_APAGAR_AIRE,
    TOPIC_TRIGGER_ABRIR_PERSIANAS,
    TOPIC_TRIGGER_CERRAR_PERSIANAS,
    TOPIC_TRIGGER_ENCENDER_LUCES,
    TOPIC_TRIGGER_APAGAR_LUCES,
    TOPIC_TRIGGER_SUBIR_VOLUMEN,
    TOPIC_TRIGGER_BAJAR_VOLUMEN
  ]);
});

client.on("message", (topic, message) => {
  const payload = JSON.parse(message.toString());

  // 🌡️ Mostrar datos sensores
  if (topic === TOPIC_SENSOR_TEMP && payload.temperatura !== undefined) {
    console.log(`🌡️ Temperatura: ${payload.temperatura}°C`);
  }
  if (topic === TOPIC_SENSOR_LUZ && payload.lux !== undefined) {
    console.log(`🔆 Luz: ${payload.lux} lux`);
  }
  if (topic === TOPIC_SENSOR_RUIDO && payload.ruido !== undefined) {
    console.log(`🔊 Ruido: ${payload.ruido} dB`);
  }

  // 🚨 Triggers de aire
  if (topic === TOPIC_TRIGGER_ENCENDER_AIRE) {
    if (!estadoSubsistemas.aire.encendido) {
      estadoSubsistemas.aire.encendido = true;
      console.log("🚦 API decide: encender aire");
      client.publish(TOPIC_ACTUADOR_AIRE, JSON.stringify({ accion: "encender" }));
    } else {
      console.log("⛔ Aire ya encendido. Ignorando.");
    }
  }
  if (topic === TOPIC_TRIGGER_APAGAR_AIRE) {
    if (estadoSubsistemas.aire.encendido) {
      estadoSubsistemas.aire.encendido = false;
      console.log("🚦 API decide: apagar aire");
      client.publish(TOPIC_ACTUADOR_AIRE, JSON.stringify({ accion: "apagar" }));
    } else {
      console.log("⛔ Aire ya apagado. Ignorando.");
    }
  }

  // 🪟 Triggers de persianas
  if (topic === TOPIC_TRIGGER_ABRIR_PERSIANAS) {
    if (!estadoSubsistemas.persianas.abiertas) {
      estadoSubsistemas.persianas.abiertas = true;
      console.log("🪟 API decide: abrir persianas");
      client.publish(TOPIC_ACTUADOR_PERSIANAS, JSON.stringify({ accion: "abrir" }));
    } else {
      console.log("⛔ Persianas ya abiertas. Ignorando.");
    }
  }
  if (topic === TOPIC_TRIGGER_CERRAR_PERSIANAS) {
    if (estadoSubsistemas.persianas.abiertas) {
      estadoSubsistemas.persianas.abiertas = false;
      console.log("🪟 API decide: cerrar persianas");
      client.publish(TOPIC_ACTUADOR_PERSIANAS, JSON.stringify({ accion: "cerrar" }));
    } else {
      console.log("⛔ Persianas ya cerradas. Ignorando.");
    }
  }

  // 💡 Triggers de luces
  if (topic === TOPIC_TRIGGER_ENCENDER_LUCES) {
    if (!estadoSubsistemas.luces.encendidas) {
      estadoSubsistemas.luces.encendidas = true;
      console.log("💡 API decide: encender luces");
      client.publish(TOPIC_ACTUADOR_LUCES, JSON.stringify({ accion: "encender" }));
    } else {
      console.log("⛔ Luces ya encendidas. Ignorando.");
    }
  }
  if (topic === TOPIC_TRIGGER_APAGAR_LUCES) {
    if (estadoSubsistemas.luces.encendidas) {
      estadoSubsistemas.luces.encendidas = false;
      console.log("💡 API decide: apagar luces");
      client.publish(TOPIC_ACTUADOR_LUCES, JSON.stringify({ accion: "apagar" }));
    } else {
      console.log("⛔ Luces ya apagadas. Ignorando.");
    }
  }

  // 🎶 Triggers de audio
  if (topic === TOPIC_TRIGGER_SUBIR_VOLUMEN) {
    if (estadoSubsistemas.audio.encendido) {
      console.log("🎶 API decide: subir volumen");
      client.publish(TOPIC_ACTUADOR_AUDIO, JSON.stringify({ accion: "subir_volumen" }));
    } else {
      console.log("⛔ Audio apagado. No se puede subir volumen.");
    }
  }
  if (topic === TOPIC_TRIGGER_BAJAR_VOLUMEN) {
    if (estadoSubsistemas.audio.encendido) {
      console.log("🎶 API decide: bajar volumen");
      client.publish(TOPIC_ACTUADOR_AUDIO, JSON.stringify({ accion: "bajar_volumen" }));
    } else {
      console.log("⛔ Audio apagado. No se puede bajar volumen.");
    }
  }
});

app.get("/", (req, res) => {
  res.send("✅ API E-Office funcionando");
});

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});

*/

// index.js
const express = require("express");
const app = express();
const PORT = 3000;

require("./mqttClient"); // Inicializa conexión MQTT

app.get("/", (req, res) => {
  res.send("✅ API E-Office funcionando");
});

app.listen(PORT, () => {
  console.log(`🚀 API en http://localhost:${PORT}`);
});
