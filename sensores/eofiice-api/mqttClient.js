const mqtt = require("mqtt");
const {
  registrarSensor,
  registrarAccion
} = require("./db");

const MQTT_BROKER = "mqtt://192.168.79.151";
const client = mqtt.connect(MQTT_BROKER);

// Tópicos de sensores
const TOPIC_SENSOR_TEMP = "eoffice/temperatura/sensor";
const TOPIC_SENSOR_LUZ = "eoffice/luz/sensor";
const TOPIC_SENSOR_RUIDO = "eoffice/ruido/sensor";

// Tópicos de actuadores
const TOPIC_ACTUADOR_AIRE = "eoffice/aire/actuador";
const TOPIC_ACTUADOR_LUCES = "eoffice/luces/actuador";
const TOPIC_ACTUADOR_PERSIANAS = "eoffice/persianas/actuador";
const TOPIC_ACTUADOR_AUDIO = "eoffice/audio/actuador";

let modoAutomatico = true;

function setModoAutomatico(valor) {
  modoAutomatico = valor;
  console.log(`🔃 Modo actualizado: ${modoAutomatico ? "automático" : "manual"}`);
  registrarAccion("sistema", `cambio de modo a ${modoAutomatico ? "automático" : "manual"}`);
}

function getModoAutomatico() {
  return modoAutomatico;
}

client.on("connect", () => {
  console.log("🔌 Conectado al broker MQTT");

  client.subscribe([
    TOPIC_SENSOR_TEMP,
    TOPIC_SENSOR_LUZ,
    TOPIC_SENSOR_RUIDO,
    TOPIC_ACTUADOR_AIRE,
    TOPIC_ACTUADOR_LUCES,
    TOPIC_ACTUADOR_PERSIANAS,
    TOPIC_ACTUADOR_AUDIO
  ]);
});

client.on("message", async (topic, message) => {
  const payload = JSON.parse(message.toString());

  if (topic === TOPIC_SENSOR_TEMP && payload.temperatura !== undefined) {
    console.log(`🌡️ Temperatura: ${payload.temperatura}°C`);
    await registrarSensor("temperatura", payload.temperatura);
  }

  if (topic === TOPIC_SENSOR_LUZ && payload.lux !== undefined) {
    console.log(`🔆 Luz: ${payload.lux} lux`);
    await registrarSensor("luz", payload.lux);
  }

  if (topic === TOPIC_SENSOR_RUIDO && payload.ruido !== undefined) {
    console.log(`🔊 Ruido: ${payload.ruido} dB`);
    await registrarSensor("ruido", payload.ruido);
  }

  if (topic === TOPIC_ACTUADOR_AIRE && payload.accion) {
    console.log(`💨 Acción aire: ${payload.accion}`);
    await registrarAccion("aire", payload.accion);
  }

  if (topic === TOPIC_ACTUADOR_LUCES && payload.accion) {
    console.log(`💡 Acción luces: ${payload.accion}`);
    await registrarAccion("luces", payload.accion);
  }

  if (topic === TOPIC_ACTUADOR_PERSIANAS && payload.accion) {
    console.log(`🪟 Acción persianas: ${payload.accion}`);
    await registrarAccion("persianas", payload.accion);
  }

  if (topic === TOPIC_ACTUADOR_AUDIO && payload.accion) {
    console.log(`🔊 Acción audio: ${payload.accion}`);
    await registrarAccion("audio", payload.accion);
  }
});

module.exports = {
  client,
  setModoAutomatico,
  getModoAutomatico
};
