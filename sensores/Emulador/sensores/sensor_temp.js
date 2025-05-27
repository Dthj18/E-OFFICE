const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1";
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const TOPIC_SENSOR = "eoffice/temperatura/sensor";
const TOPIC_ESTADO_AIRE = "eoffice/aire/estado";
const TOPIC_AJUSTAR_TEMP = "eoffice/temperatura/ajustar";

let temperaturaAmbiente = 26.5;
let temperaturaObjetivo = null;
let aireEncendido = false;

function actualizarTemperatura() {
    let variacionNatural = (Math.random() * 0.2) - 0.1;

    if (aireEncendido && temperaturaObjetivo !== null) {
        const diferencia = temperaturaObjetivo - temperaturaAmbiente;
        const enfriamiento = Math.sign(diferencia) * Math.min(0.3, Math.abs(diferencia) * 0.2);
        temperaturaAmbiente += enfriamiento + variacionNatural;
    } else {
        if (temperaturaAmbiente < 24) {
            const subida = 0.05 + Math.random() * 0.1;
            temperaturaAmbiente += subida + variacionNatural;
        } else {
            temperaturaAmbiente += variacionNatural;
        }
    }

    temperaturaAmbiente = Math.max(15, Math.min(40, temperaturaAmbiente));
}

client.on("connect", () => {
    console.log("📡 Sensor de temperatura conectado a EMQX");
    client.subscribe(TOPIC_ESTADO_AIRE);
    client.subscribe(TOPIC_AJUSTAR_TEMP);

    setInterval(() => {
        actualizarTemperatura();
        const tempData = {
            temperatura: parseFloat(temperaturaAmbiente.toFixed(2))
        };

        console.log(`🌡️ Temperatura actual: ${tempData.temperatura}°C`);
        client.publish(TOPIC_SENSOR, JSON.stringify(tempData));
    }, 4000);
});

client.on("message", (topic, message) => {
    if (topic === TOPIC_ESTADO_AIRE) {
        const data = JSON.parse(message.toString());

        if (data.estado === "encendido") {
            aireEncendido = true;
            temperaturaObjetivo = parseFloat(data.temperatura);
            console.log(`❄️ Aire encendido. Temperatura objetivo: ${temperaturaObjetivo}°C`);
        } else if (data.estado === "apagado") {
            aireEncendido = false;
            temperaturaObjetivo = null;
            console.log(`🔴 Aire apagado.`);
        } else {
            console.log(`⚠️ Estado del aire desconocido: ${JSON.stringify(data)}`);
        }

    } else if (topic === TOPIC_AJUSTAR_TEMP) {
        try {
            const payload = JSON.parse(message.toString());
            if (payload.temperatura !== undefined) {
                temperaturaAmbiente = parseFloat(payload.temperatura);
                console.log(`✏️ Temperatura ambiente ajustada manualmente a: ${temperaturaAmbiente}°C`);
            } else {
                console.log("⚠️ Mensaje sin propiedad 'temperatura'");
            }
        } catch (err) {
            console.error("⚠️ Error al parsear mensaje:", err.message);
        }
    }
});
