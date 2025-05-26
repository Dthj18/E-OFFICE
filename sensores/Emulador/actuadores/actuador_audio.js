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
  console.log(`🔊 Comando recibido: ${JSON.stringify(data)}`);

  if (data.accion === "encender") {
    if (!audioEncendido) {
      audioEncendido = true;
      audioPausado = false;
      volumenActual = 50;
      console.log("🔊 Audio encendido.");
    }
  } else if (data.accion === "apagar") {
    if (audioEncendido) {
      audioEncendido = false;
      audioPausado = false;
      volumenActual = 0;
      console.log("🔇 Audio apagado.");
    }
  } else if (data.accion === "pausar") {
    if (audioEncendido && !audioPausado) {
      audioPausado = true;
      console.log("⏸️ Audio pausado.");
    }
  } else if (data.accion === "reanudar") {
    if (audioEncendido && audioPausado) {
      audioPausado = false;
      console.log("▶️ Audio reanudado.");
    }
  } else if (data.accion === "ajustar" && typeof data.volumen === "number") {
    if (audioEncendido && !audioPausado) {
      volumenActual = Math.max(0, Math.min(100, data.volumen));
      console.log(`🎚️ Volumen ajustado a ${volumenActual}%.`);
    }
  } else if (data.accion === "subir_volumen") {
    if (audioEncendido && !audioPausado) {
      volumenActual = Math.min(100, volumenActual + 10);
      console.log(`🔊 Subiendo volumen a ${volumenActual}%.`);
    }
  } else if (data.accion === "bajar_volumen") {
    if (audioEncendido && !audioPausado) {
      volumenActual = Math.max(0, volumenActual - 10);
      console.log(`🔉 Bajando volumen a ${volumenActual}%.`);
    }
  } else if (data.accion === "siguiente") {
    console.log("⏭️ Pasar a siguiente canción solicitado.");
  } else {
    console.log("⚠️ Comando no reconocido.");
  }

  publicarEstado();
});
