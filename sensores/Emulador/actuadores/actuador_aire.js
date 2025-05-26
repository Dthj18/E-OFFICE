const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1";
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const TOPIC_AIRE = "eoffice/aire/actuador";
const TOPIC_ESTADO_AIRE = "eoffice/aire/estado";

let aireEncendido = false;
let temperaturaObjetivo = 24;

function publicarEstado() {
    const estado = {
        estado: aireEncendido ? "encendido" : "apagado",
        temperatura: temperaturaObjetivo 
    };
    client.publish(TOPIC_ESTADO_AIRE, JSON.stringify(estado));
}

client.on("connect", () => {
    console.log("✅ Actuador de aire acondicionado conectado a EMQX");
    client.subscribe(TOPIC_AIRE);
});

client.on("message", (topic, message) => {
    const msg = message.toString().trim();
    let data = {};

    try {
        data = JSON.parse(msg);
    } catch (err) {
        console.error("⚠ Error al parsear JSON:", err.message);
        return;
    }

    console.log(`📥 Comando recibido: ${JSON.stringify(data)}`);

    if (data.accion === "encender") {
        aireEncendido = true;
        console.log("❄️ Aire acondicionado encendido.");
    } else if (data.accion === "apagar") {
        aireEncendido = false;
        console.log("🔴 Aire acondicionado apagado.");
    } else if (data.accion === "ajustar" && data.temperatura !== undefined) {
        temperaturaObjetivo = parseFloat(data.temperatura);
        console.log(`🌡️ Temperatura objetivo ajustada a ${temperaturaObjetivo}°C.`);
    } else {
        console.log("⚠️ Comando no reconocido.");
    }

    publicarEstado();
});
