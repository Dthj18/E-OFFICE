const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://127.0.0.1:1883');

let modoActual = 'manual';
let temperaturaActual = 0;
let aireEncendido = false;
let luxActual = 0;

client.on('connect', () => {
  console.log('🔌 Puente MQTT conectado al broker');
  client.subscribe('eoffice/modo');
  client.subscribe('eoffice/temperatura/sensor');
  client.subscribe('eoffice/aire/estado');
  client.subscribe('eoffice/luz/sensor');
  client.subscribe('eoffice/ruido/sensor'); 
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

      if (modoActual === 'automatico') {
        client.publish('eoffice/aire/estado/automatico', JSON.stringify(estado));
      }

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

  } else if (topic === 'eoffice/luz/sensor') {
    try {
      const payload = JSON.parse(message.toString());
      luxActual = parseFloat(payload.lux);

      if (modoActual === 'automatico') {
        client.publish('eoffice/luz/mode_automatico', JSON.stringify({
          lux: luxActual
        }));
      }

    } catch (e) {
      console.error('⚠️ Error al parsear lux:', e);
    }

  } else if (topic === 'eoffice/ruido/sensor') {
    try {
      const payload = JSON.parse(message.toString());
      const ruidoActual = parseFloat(payload.ruido);
      const cancion = payload.cancion || '';

      if (modoActual === 'automatico') {
        client.publish('eoffice/ruido/sensor/automatico', JSON.stringify({
          ruido: ruidoActual,
          cancion: cancion
        }));
      }

    } catch (e) {
      console.error('⚠️ Error al parsear ruido:', e);
    }
  }
});
