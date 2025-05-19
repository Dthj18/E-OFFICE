const mqtt = require("mqtt");
const BROKER_IP = "192.168.79.151";

const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);
const TOPIC_PERSIANAS = "eoffice/persianas/actuador";
const TOPIC_ESTADO_PERSIANAS = "eoffice/persianas/estado";

let persianas = {
    1: 0, // Persiana 1
    2: 0, // Persiana 2
    3: 0, // Persiana 3
    4: 0  // Persiana 4
};

client.on("connect", () => {
    console.log("✅ Actuador de persianas conectado a EMQX");
    client.subscribe(TOPIC_PERSIANAS);
});

client.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());
    const id = data.persiana;

    if (!id || ![1, 2, 3, 4].includes(id)) {
        console.log("⚠️ ID de persiana inválido.");
        return;
    }

    if (data.accion === "abrir") {
        persianas[id] = 100;
    } else if (data.accion === "cerrar") {
        persianas[id] = 0;
    } else if (data.accion === "ajustar" && typeof data.nivel === "number") {
        persianas[id] = Math.max(0, Math.min(100, data.nivel));
    } else {
        console.log("⚠️ Comando no reconocido para persianas.");
        return;
    }

    console.log(`🪟 Persiana ${id} ajustada a ${persianas[id]}%`);

    client.publish(TOPIC_ESTADO_PERSIANAS, JSON.stringify({ persianas }));
});
