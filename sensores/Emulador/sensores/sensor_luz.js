const mqtt = require("mqtt");
const BROKER_IP = "127.0.0.1";

const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const SENSOR_TOPIC = "eoffice/luz/sensor";
const ESTADO_PERSIANAS_TOPIC = "eoffice/persianas/estado";
const ESTADO_LUCES_TOPIC = "eoffice/luces/estado";

let persianas = { 1: 0, 2: 0, 3: 0, 4: 0 };
let lucesEncendidas = false;
let intensidadLuces = 100;

function calcularLuzNatural() {
    const totalApertura = Object.values(persianas).reduce((acc, val) => acc + val, 0);
    const lux = (totalApertura / 100) * 150; // cada persiana 100% = 150 lux
    return lux + (Math.random() * 10 - 5); // leve variación
}

function calcularLuzArtificial() {
    return lucesEncendidas ? intensidadLuces * 2 : 0; // hasta 200 lux
}

function publicarLux() {
    const natural = calcularLuzNatural();
    const artificial = calcularLuzArtificial();
    const total = Math.max(0, Math.floor(natural + artificial));

    console.log(`📡 Luz total: ${total} lux (natural: ${Math.floor(natural)}, artificial: ${Math.floor(artificial)})`);
    client.publish(SENSOR_TOPIC, JSON.stringify({ lux: total }));
}

client.on("connect", () => {
    console.log("📡 Sensor de luz conectado a EMQX");
    client.subscribe(ESTADO_PERSIANAS_TOPIC);
    client.subscribe(ESTADO_LUCES_TOPIC);
    setInterval(publicarLux, 4000);
});

client.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());

    if (topic === ESTADO_PERSIANAS_TOPIC && data.persianas) {
        persianas = { ...persianas, ...data.persianas };
        console.log(`🪟 Estado actualizado: ${JSON.stringify(persianas)}`);
    }

    if (topic === ESTADO_LUCES_TOPIC) {
        if (data.encendidas !== undefined) lucesEncendidas = data.encendidas;
        if (data.intensidad !== undefined) intensidadLuces = data.intensidad;
        console.log(`💡 Luces ${lucesEncendidas ? "encendidas" : "apagadas"} con intensidad ${intensidadLuces}%`);
    }
});
