const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1"; // Local
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const TOPIC = "eoffice/ventanas/actuador";

client.on("connect", () => {
  console.log("✅ Actuador de ventanas conectado a EMQX");
  client.subscribe(TOPIC);
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(`🔧 Recibido comando de ventanas: ${data.accion}`);

    if (data.accion === "abrir") {
      console.log("🪟 Ventanas abiertas.");
    } else if (data.accion === "cerrar") {
      console.log("🪟 Ventanas cerradas.");
    } else {
      console.log(`🪟 Ventanas ajustadas a ${data.porcentaje}% de apertura.`);
    }
  } catch (e) {
    console.log("❌ Error al parsear el mensaje: ", e.message);
  }
});
