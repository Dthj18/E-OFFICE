const mqtt = require("mqtt");
const BROKER_IP = "127.0.0.1";

const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);
const TOPIC_LUCES = "eoffice/luces/actuador";
const TOPIC_ESTADO_LUCES = "eoffice/luces/estado"; // Para publicar estado real de luces

let lucesEncendidas = false;
let intensidadLuces = 100; // % de brillo

client.on("connect", () => {
    console.log("✅ Actuador de luces conectado a EMQX");
    client.subscribe(TOPIC_LUCES);
});

client.on("message", (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log(`💡 Recibido comando de luces: ${JSON.stringify(data)}`);

        if (data.accion === "encender") {
            lucesEncendidas = true;
            console.log("💡 Luces encendidas.");
        } else if (data.accion === "apagar") {
            lucesEncendidas = false;
            console.log("💡 Luces apagadas.");
        }

        if (typeof data.intensidad === "number") {
            const nuevaIntensidad = Math.min(Math.max(data.intensidad, 0), 100);
            if (nuevaIntensidad !== intensidadLuces) {
                intensidadLuces = nuevaIntensidad;
                console.log(`🔆 Intensidad de luces ajustada al ${intensidadLuces}%`);
            }
        }

        console.log(`📊 Estado actual → Encendidas: ${lucesEncendidas}, Intensidad: ${intensidadLuces}%`);

        client.publish(TOPIC_ESTADO_LUCES, JSON.stringify({
            encendidas: lucesEncendidas,
            intensidad: intensidadLuces
        }));

    } catch (e) {
        console.error("❌ Error al parsear mensaje MQTT: ", e.message);
    }
});
