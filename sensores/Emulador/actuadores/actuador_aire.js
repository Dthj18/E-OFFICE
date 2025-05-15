const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1";
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const TOPIC_AIRE = "eoffice/aire/actuador";
const TOPIC_SUBIR_TEMP = "eoffice/aire/subir";
const TOPIC_BAJAR_TEMP = "eoffice/aire/bajar";
const TOPIC_ESTADO_AIRE = "eoffice/aire/estado";

let aireEncendido = false;
let temperaturaActual = 24;

function publicarEstado() {
    const estado = {
        estado: aireEncendido ? "encendido" : "apagado",
        temperatura: temperaturaActual
    };
    client.publish(TOPIC_ESTADO_AIRE, JSON.stringify(estado));
}

client.on("connect", () => {
    console.log("✅ Actuador de aire acondicionado conectado a EMQX");
    client.subscribe(TOPIC_AIRE);
    client.subscribe(TOPIC_SUBIR_TEMP);
    client.subscribe(TOPIC_BAJAR_TEMP);
});

client.on("message", (topic, message) => {
    const msg = message.toString().trim();

    let data = {};
    if (msg.length > 0) {
        try {
            data = JSON.parse(msg);
        } catch (err) {
            console.error("⚠ Error al parsear JSON:", err.message);
            return;
        }
    }

    console.log(`📥 Comando recibido en '${topic}': ${JSON.stringify(data)}`);

    if (topic === TOPIC_AIRE) {
        if (data.accion === "encender") {
            aireEncendido = true;
            console.log("❄️ Aire acondicionado encendido.");
        } else if (data.accion === "apagar") {
            aireEncendido = false;
            console.log("🔴 Aire acondicionado apagado.");
        } else if (data.accion === "ajustar" && data.temperatura !== undefined) {
            if (aireEncendido) {
                temperaturaActual = parseFloat(data.temperatura);
                console.log(`🌡️ Aire acondicionado ajustado a ${temperaturaActual}°C.`);
            } else {
                console.log("⚠️ No se puede ajustar la temperatura. El aire está apagado.");
            }
        } else {
            console.log("⚠️ Comando no reconocido.");
        }

        publicarEstado();
    }

    if (topic === TOPIC_SUBIR_TEMP && aireEncendido) {
        temperaturaActual++;
        temperaturaActual = Math.min(35, temperaturaActual);
        console.log(`🔼 Subiendo temperatura a ${temperaturaActual}°C.`);
        publicarEstado();
    }

    if (topic === TOPIC_BAJAR_TEMP && aireEncendido) {
        temperaturaActual--;
        temperaturaActual = Math.max(15, temperaturaActual);
        console.log(`🔽 Bajando temperatura a ${temperaturaActual}°C.`);
        publicarEstado();
    }
});
