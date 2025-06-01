const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1";
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const SENSOR_TOPIC = "eoffice/ruido/sensor";
const ESTADO_AUDIO_TOPIC = "eoffice/audio/estado";

let volumenActual = 0;
let audioEncendido = false;
let audioPausado = false;
let cancionActual = "silencio";

const canciones = {
  silencio: { min: 8, max: 15 },
  balada: { min: 30, max: 50 },
  rock: { min: 50, max: 70 },
  electronica: { min: 65, max: 85 },
  pop: { min: 45, max: 65 },
};

const listaCanciones = Object.keys(canciones);
let intervaloRuido = null;

function getRandomDecibels(cancion, volumen) {
  const rango = canciones[cancion] || canciones["silencio"];
  let ruidoBase = Math.floor(Math.random() * (rango.max - rango.min) + rango.min);
  return Math.floor(ruidoBase * (volumen / 100));
}

function publicarRuido() {
  let cancion = audioEncendido && !audioPausado ? cancionActual : "silencio";
  let volumen = audioEncendido && !audioPausado ? volumenActual : 0; // volumen = 0 si está apagado
  let ruido = getRandomDecibels(cancion, volumen);

  console.log(`📢 Publicando ruido: ${ruido} dB | Canción: ${cancion} | Volumen: ${volumen}%`);
  client.publish(SENSOR_TOPIC, JSON.stringify({ ruido, cancion }));
}

function cambiarCancionAleatoria() {
  if (!audioEncendido || audioPausado) return;
  const nueva = listaCanciones[Math.floor(Math.random() * listaCanciones.length)];
  if (nueva !== cancionActual && nueva !== "silencio") {
    cancionActual = nueva;
    console.log(`🎶 Nueva canción seleccionada: ${cancionActual}`);
  }
}

client.on("connect", () => {
  console.log("📡 Sensor de ruido conectado al broker MQTT");
  client.subscribe(ESTADO_AUDIO_TOPIC);

  intervaloRuido = setInterval(() => {
    publicarRuido();
  }, 4000);

  setInterval(() => {
    cambiarCancionAleatoria();
  }, 20000);
});

client.on("message", (topic, message) => {
  if (topic === ESTADO_AUDIO_TOPIC) {
    try {
      const estado = JSON.parse(message.toString());
      audioEncendido = estado.encendido;
      audioPausado = estado.pausado;
      volumenActual = estado.volumen || 0;

      console.log("🎧 Estado de audio recibido:", estado);

      if (audioEncendido && !audioPausado) {
        if (cancionActual === "silencio") {
          const nueva = listaCanciones[Math.floor(Math.random() * listaCanciones.length)];
          if (nueva !== "silencio") {
            cancionActual = nueva;
            console.log(`🎶 Canción reproducida inmediatamente al encender: ${cancionActual}`);
          }
        }
      }

    } catch (err) {
      console.error("❌ Error al parsear estado de audio:", err);
    }
  }
});
