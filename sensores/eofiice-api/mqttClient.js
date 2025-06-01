const mqtt = require("mqtt");
const { registrarSensor, registrarAccion } = require("./config/db");

const MQTT_BROKER = "mqtt://127.0.0.1";
const client = mqtt.connect(MQTT_BROKER);

const TOPIC_SENSOR_TEMP = "eoffice/temperatura/sensor";
const TOPIC_SENSOR_LUZ = "eoffice/luz/sensor";
const TOPIC_SENSOR_RUIDO = "eoffice/ruido/sensor";

const TOPIC_ACTUADOR_AIRE = "eoffice/aire/actuador";
const TOPIC_ACTUADOR_LUCES = "eoffice/luces/actuador";
const TOPIC_ACTUADOR_PERSIANAS = "eoffice/persianas/actuador";
const TOPIC_ACTUADOR_AUDIO = "eoffice/audio/actuador";
const TOPIC_ACTUADOR_VENTANAS = "eoffice/ventanas/actuador";

const TOPIC_MODO = "eoffice/modo";

let modoActual = "manual";

function setModo(valor) {
  const nuevoModo = valor.toLowerCase();
  if (modoActual !== nuevoModo) {
    modoActual = nuevoModo;
    console.log(`🔃 Modo actualizado: ${nuevoModo}`);
    registrarAccion("sistema", `cambio de modo a ${nuevoModo}`, "Sistema", "sistema@eoffice.com");

    client.publish(TOPIC_MODO, nuevoModo, { qos: 1, retain: true });
  }
}

function getModo() {
  return modoActual;
}

function esModoAutomatico() {
  return modoActual === "automatico";
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
    TOPIC_ACTUADOR_AUDIO,
    TOPIC_ACTUADOR_VENTANAS,
    TOPIC_MODO,
  ]);

  client.publish(TOPIC_MODO, modoActual, { qos: 1, retain: true });
});

client.on("message", async (topic, message) => {
  try {
    const payloadStr = message.toString();

    const payload = topic === TOPIC_MODO ? null : JSON.parse(payloadStr);

    switch (topic) {
      case TOPIC_SENSOR_TEMP:
        if (payload?.temperatura !== undefined) {
          await registrarSensor("temperatura", payload.temperatura);
        }
        break;

      case TOPIC_SENSOR_LUZ:
        if (payload?.lux !== undefined) {
          await registrarSensor("luz", payload.lux);
        }
        break;

      case TOPIC_SENSOR_RUIDO:
        if (payload?.ruido !== undefined) {
          await registrarSensor("ruido", payload.ruido);
        }
        break;

      case TOPIC_ACTUADOR_AIRE:
        if (payload?.accion) {
          const nombre = payload.nombre || "Actuador Aire";
          const correo = payload.correo || "actuador-aire@eoffice.com";
          console.log(`💨 Acción aire: ${payload.accion}`);
          await registrarAccion("aire", payload.accion, nombre, correo);
        }
        break;

      case TOPIC_ACTUADOR_LUCES:
        if (payload?.accion) {
          const nombre = payload.nombre || "Actuador Luces";
          const correo = payload.correo || "actuador-luces@eoffice.com";
          console.log(`💡 Acción luces: ${payload.accion}`);
          await registrarAccion("luces", payload.accion, nombre, correo);
        }
        break;

      case TOPIC_ACTUADOR_PERSIANAS:
        if (payload?.accion) {
          const nombre = payload.nombre || "Actuador Persianas";
          const correo = payload.correo || "actuador-persianas@eoffice.com";
          console.log(`🪟 Acción persianas: ${payload.accion}`);
          await registrarAccion("persianas", payload.accion, nombre, correo);
        }
        break;

      case TOPIC_ACTUADOR_AUDIO:
        if (payload?.accion) {
          const nombre = payload.nombre || "Actuador Audio";
          const correo = payload.correo || "actuador-audio@eoffice.com";
          console.log(`🔊 Acción audio: ${payload.accion}`);
          await registrarAccion("audio", payload.accion, nombre, correo);
        }
        break;

      case TOPIC_ACTUADOR_VENTANAS:
        if (payload?.accion) {
          const nombre = payload.nombre || "Actuador Ventanas";
          const correo = payload.correo || "actuador-ventanas@eoffice.com";
          console.log(`🪟 Acción ventanas: ${payload.accion}`);
          await registrarAccion("ventanas", payload.accion, nombre, correo);
        }
        break;

      case TOPIC_MODO:
        const nuevoModo = payloadStr.toLowerCase();
        if (modoActual !== nuevoModo) {
          modoActual = nuevoModo;
          console.log(`🎛️ Modo cambiado externamente a: ${nuevoModo}`);
          await registrarAccion("sistema", `modo actualizado a ${nuevoModo}`, "Sistema", "sistema@eoffice.com");
        }
        break;
    }
  } catch (error) {
    console.error("Error procesando mensaje MQTT:", error);
  }
});

module.exports = {
  client,
  setModo,
  getModo,
  esModoAutomatico,
};


