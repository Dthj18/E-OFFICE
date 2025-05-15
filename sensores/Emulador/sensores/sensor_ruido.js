const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1";
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const SENSOR_TOPIC = "eoffice/ruido/sensor";
const ACTUATOR_TOPIC = "eoffice/audio/actuador";

let volumenActual = 0;
let audioEncendido = false;
let audioPausado = false;
let cancionActual = "silencio";
let publicadorRuido = null;
let cambiadorCanciones = null;

const canciones = {
  silencio: { min: 20, max: 30 },
  balada: { min: 30, max: 50 },
  rock: { min: 50, max: 70 },
  electronica: { min: 65, max: 85 },
  pop: { min: 45, max: 65 },
};

const listaCanciones = Object.keys(canciones);

function getRandomDecibels(cancion) {
  const rango = canciones[cancion] || canciones["silencio"];
  let ruidoBase = Math.floor(Math.random() * (rango.max - rango.min) + rango.min);

  if (volumenActual > 0) {
    ruidoBase = Math.floor(ruidoBase * (volumenActual / 100));
  } else {
    ruidoBase = Math.floor(Math.random() * (30 - 20) + 20); 
  }

  return ruidoBase;
}

client.on("connect", () => {
  client.subscribe(ACTUATOR_TOPIC);
});

client.on("message", (topic, message) => {
  if (topic !== ACTUATOR_TOPIC) return;
  const data = JSON.parse(message.toString());

  if (data.accion === "encender") {
    encenderAudio();
  } else if (data.accion === "pausar") {
    audioPausado = true;
  } else if (data.accion === "reanudar") {
    if (audioEncendido) audioPausado = false;
  } else if (data.accion === "apagar") {
    apagarAudio();
  } else if (data.accion === "ajustar" && typeof data.volumen === "number") {
    volumenActual = data.volumen;
  } else if (data.accion === "siguiente") {
    pasarASiguienteCancion();
  }
});

function encenderAudio() {
  if (audioEncendido) return;

  audioEncendido = true;
  audioPausado = false;
  volumenActual = 50;
  cancionActual = "balada";

  publicadorRuido = setInterval(() => {
    if (!audioEncendido || audioPausado) return;
    const ruido = getRandomDecibels(cancionActual);
    client.publish(SENSOR_TOPIC, JSON.stringify({ ruido, cancion: cancionActual }));
  }, 4000);

  cambiadorCanciones = setInterval(() => {
    cambiarCancionAleatoria();
  }, 20000);
}

function apagarAudio() {
  if (!audioEncendido) return;

  audioEncendido = false;
  volumenActual = 0;
  cancionActual = "silencio";

  clearInterval(publicadorRuido);
  clearInterval(cambiadorCanciones);
  publicadorRuido = null;
  cambiadorCanciones = null;
}

function cambiarCancionAleatoria() {
  if (!audioEncendido || audioPausado) return;

  const nueva = listaCanciones[Math.floor(Math.random() * listaCanciones.length)];
  if (nueva !== cancionActual) {
    cancionActual = nueva;
  }
}

function pasarASiguienteCancion() {
  if (!audioEncendido || audioPausado) return;

  const actual = listaCanciones.indexOf(cancionActual);
  const siguiente = (actual + 1) % listaCanciones.length;
  cancionActual = listaCanciones[siguiente];
}
