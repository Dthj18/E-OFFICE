const mqtt = require("mqtt");

const BROKER_IP = "127.0.0.1";
const client = mqtt.connect(`mqtt://${BROKER_IP}:1883`);

const TOPIC_AUDIO = "eoffice/audio/actuador";
const TOPIC_ESTADO = "eoffice/audio/estado";

let audioEncendido = false;
let audioPausado = false;
let volumenActual = 0;

function publicarEstado() {
  const estado = {
    encendido: audioEncendido,
    pausado: audioPausado,
    volumen: volumenActual,
  };
  client.publish(TOPIC_ESTADO, JSON.stringify(estado));
}

client.on("connect", () => {
  console.log("✅ Actuador de audio conectado");
  client.subscribe(TOPIC_AUDIO);
  publicarEstado(); 
});

client.on("message", (topic, message) => {
  const data = JSON.parse(message.toString());
  console.log(`🎵 Comando recibido: ${JSON.stringify(data)}`);

  let estadoCambiado = false;

  if (data.accion === "encender" && !audioEncendido) {
    audioEncendido = true;
    audioPausado = false;
    volumenActual = 50;
    estadoCambiado = true;
    console.log("🔊 Audio encendido.");
  } else if (data.accion === "apagar" && audioEncendido) {
    audioEncendido = false;
    audioPausado = false;
    volumenActual = 0;
    estadoCambiado = true;
    console.log("🔇 Audio apagado.");
  } else if (data.accion === "pausar" && audioEncendido && !audioPausado) {
    audioPausado = true;
    estadoCambiado = true;
    console.log("⏸️ Audio pausado.");
  } else if (data.accion === "reanudar" && audioEncendido && audioPausado) {
    audioPausado = false;
    estadoCambiado = true;
    console.log("▶️ Audio reanudado.");
  } else if (data.accion === "ajustar" && typeof data.volumen === "number" && audioEncendido) {
    const nuevoVolumen = Math.max(0, Math.min(100, data.volumen));
    if (nuevoVolumen !== volumenActual) {
      volumenActual = nuevoVolumen;
      estadoCambiado = true;
      console.log(`🎚️ Volumen ajustado a ${volumenActual}%.`);
    }
  } else if (data.accion === "subir_volumen" && audioEncendido) {
    if (volumenActual < 100) {
      volumenActual = Math.min(100, volumenActual + 10);
      estadoCambiado = true;
      console.log(`🔊 Subiendo volumen a ${volumenActual}%.`);
    }
  } else if (data.accion === "bajar_volumen" && audioEncendido) {
    if (volumenActual > 0) {
      volumenActual = Math.max(0, volumenActual - 10);
      estadoCambiado = true;
      console.log(`🔉 Bajando volumen a ${volumenActual}%.`);
    }
  } else if (data.accion === "siguiente") {
    console.log("⏭️ Siguiente canción solicitada (sensor cambiará automáticamente).");
  } else {
    console.log("⚠️ Comando no reconocido o no aplicable.");
  }

  if (estadoCambiado) {
    publicarEstado();
  }
});
