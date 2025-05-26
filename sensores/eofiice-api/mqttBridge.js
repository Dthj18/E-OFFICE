const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://127.0.0.1:1883');

let modoActual = 'manual';
let temperaturaActual = 0;
let aireEncendido = false;

client.on('connect', () => {
  console.log('🔌 Puente MQTT conectado al broker');
  client.subscribe('eoffice/modo');
  client.subscribe('eoffice/temperatura/sensor');
  client.subscribe('eoffice/aire/estado'); 
});

client.on('message', (topic, message) => {
  if (topic === 'eoffice/modo') {
    modoActual = message.toString();
    console.log(`🎛️ Modo actualizado a: ${modoActual}`);

  } else if (topic === 'eoffice/aire/estado') {
    try {
      const estado = JSON.parse(message.toString());
      aireEncendido = estado.estado === 'encendido';
      console.log(`🔄 Estado del aire: ${estado.estado}`);
    } catch (e) {
      console.error('⚠️ Error al parsear estado del aire:', e);
    }

  } else if (topic === 'eoffice/temperatura/sensor') {
    try {
      const payload = JSON.parse(message.toString());
      temperaturaActual = parseFloat(payload.temperatura);
      if (modoActual === 'automatico') {
        client.publish('eoffice/temperatura/mode_automatico', JSON.stringify({
          temperatura: temperaturaActual
        }));
      }

    } catch (e) {
      console.error('⚠️ Error al parsear temperatura:', e);
    }
  }
});
