const mqtt = require('mqtt');


// Verificar que se cargó correctamente
console.log("✅ MQTT_URL cargada:", process.env.MQTT_BROKER_URL);

// Conectar al broker usando MQTT_BROKER_URL del .env
const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
  clean: true,
  reconnectPeriod: 5000,
});

client.on('connect', () => {
  console.log('📡 Conectado al broker MQTT');

  client.subscribe(['eoffice/comandos', 'eoffice/respuestas'], (err) => {
    if (err) {
      console.error('❌ Error al suscribirse a tópicos:', err);
    } else {
      console.log('✅ Suscrito a comandos y respuestas');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`📨 Mensaje recibido en ${topic}: ${message.toString()}`);
});

client.on('error', (err) => {
  console.error('⚠️ Error en MQTT:', err);
});

client.on('reconnect', () => {
  console.log('🔄 Reintentando conexión a MQTT...');
});

client.on('close', () => {
  console.log('🔌 Conexión MQTT cerrada');
});

const enviarComando = (comando, parametros = {}) => {
  const payload = JSON.stringify({ comando, parametros });
  client.publish('eoffice/comandos', payload);
  console.log(`📤 Comando enviado: ${payload}`);
};

module.exports = { enviarComando };
