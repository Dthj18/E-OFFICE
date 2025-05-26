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
        const enfriamiento = Math.sign(diferencia) * Math.min(0.4, Math.abs(diferencia));
        temperaturaAmbiente += enfriamiento + variacionNatural;
    } else {
        if (temperaturaAmbiente < 17) {
            const subida = 0.2 + Math.random() * 0.2;
            temperaturaAmbiente += subida + variacionNatural;
        } else {
            temperaturaAmbiente += variacionNatural;
        }
    }

    temperaturaAmbiente = Math.max(10, Math.min(40, temperaturaAmbiente));
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
            temperaturaAmbiente = temperaturaAmbiente - 3;
            console.log(`❄️ Aire encendido. Temperatura objetivo: ${temperaturaObjetivo}°C. Temperatura ambiente ajustada a: ${temperaturaAmbiente.toFixed(2)}°C`);
        } else if (data.estado === "apagado") {
            aireEncendido = false;
            temperaturaAmbiente = temperaturaAmbiente + 3;
            temperaturaObjetivo = null;
            console.log(`🔴 Aire apagado. Temperatura ambiente ajustada a: ${temperaturaAmbiente.toFixed(2)}°C`);
        } else {
            console.log(`⚠️ Estado del aire desconocido o sin acción: ${JSON.stringify(data)}`);
        }

    } else if (topic === TOPIC_AJUSTAR_TEMP) {
        try {
            const payload = JSON.parse(message.toString());
            if (payload.temperatura !== undefined) {
                temperaturaAmbiente = parseFloat(payload.temperatura);
                console.log(`✏️ Temperatura ambiente ajustada manualmente a: ${temperaturaAmbiente}°C`);
            } else {
                console.log("⚠️ Mensaje para ajustar temperatura sin propiedad 'temperatura'");
            }
        } catch (err) {
            console.error("⚠️ Error al parsear mensaje para ajustar temperatura:", err.message);
        }
    }
});
