const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1";
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const TOPIC = "eoffice/ventanas/actuador";

client.on("connect", () => {
  console.log("✅ Actuador de ventanas conectado a EMQX");
  client.subscribe(TOPIC);
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const ventanaId = data.ventana;

    if (!ventanaId || ventanaId < 1 || ventanaId > 4) {
      console.log("⚠️ ID de ventana inválido:", ventanaId);
      return;
    }

    console.log(`🔧 Comando recibido para Ventana ${ventanaId}: ${data.accion}`);

    let estadoDescripcion = "";

    if (data.accion === "abrir") {
      estadoDescripcion = "abierta";
      console.log(`🪟 Ventana ${ventanaId} abierta.`);
    } else if (data.accion === "cerrar") {
      estadoDescripcion = "cerrada";
      console.log(`🪟 Ventana ${ventanaId} cerrada.`);
    } else if (data.porcentaje !== undefined) {
      estadoDescripcion = `ajustada al ${data.porcentaje}%`;
      console.log(`🪟 Ventana ${ventanaId} ajustada a ${data.porcentaje}%`);
    } else {
      estadoDescripcion = "estado desconocido";
    }

    const estadoTopic = `eoffice/ventanas/${ventanaId}/status`;
    const estado = {
      id: ventanaId,
      estado: estadoDescripcion,
      timestamp: Date.now()
    };
    client.publish(estadoTopic, JSON.stringify(estado));

  } catch (e) {
    console.log("❌ Error al parsear el mensaje: ", e.message);
  }
});
