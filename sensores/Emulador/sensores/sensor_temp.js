const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1";
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const TOPIC_SENSOR = "eoffice/temperatura/sensor";
const TOPIC_AIRE = "eoffice/aire/actuador";
const TOPIC_ESTADO_AIRE = "eoffice/aire/estado";

let temperaturaActual = Math.random() * (35 - 25) + 25;
let temperaturaObjetivo = temperaturaActual;
let aireEncendido = false;

function actualizarTemperatura() {
    if (aireEncendido) {
        if (temperaturaActual > temperaturaObjetivo) {
            temperaturaActual -= Math.random() * 0.5;
        } else if (temperaturaActual < temperaturaObjetivo) {
            temperaturaActual += Math.random() * 0.5;
        }
    } else {
        temperaturaActual += Math.random() * 0.4 - 0.2;
    }

    temperaturaActual = Math.max(15, Math.min(35, temperaturaActual));
}

client.on("connect", () => {
    console.log("📡 Conectado a EMQX (Sensor de Temperatura)");
    client.subscribe(TOPIC_AIRE);

    setInterval(() => {
        actualizarTemperatura();

        const tempData = {
            temperatura: temperaturaActual.toFixed(2)
        };

        console.log(`🌡️ Enviando temperatura: ${tempData.temperatura}°C`);
        client.publish(TOPIC_SENSOR, JSON.stringify(tempData));
    }, 4000);
});

client.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());

    if (data.accion === "encender") {
        aireEncendido = true;
        temperaturaObjetivo = Math.max(15, temperaturaActual - 4); // Baja 4°C al encender
        console.log("❄️ Aire acondicionado encendido.");
        console.log(`🎯 Temperatura objetivo ajustada automáticamente a ${temperaturaObjetivo.toFixed(2)}°C`);
    } else if (data.accion === "apagar") {
        aireEncendido = false;
        temperaturaObjetivo = Math.min(35, temperaturaActual + 4); // Sube 4°C al apagar
        console.log("🔴 Aire acondicionado apagado.");
        console.log(`🎯 Temperatura ajustada a ${temperaturaObjetivo.toFixed(2)}°C`);
    } else if (data.accion === "ajustar" && data.temperatura !== undefined) {
        temperaturaObjetivo = parseFloat(data.temperatura);
        console.log(`🌡️ Ajustando temperatura a ${temperaturaObjetivo}°C.`);
    }
});
