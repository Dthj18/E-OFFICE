const cron = require('node-cron');
const reglas = require('../rules');
const mqttService = require('./mqtt.service');
const logService = require('./log.service');

function programarAutomatizaciones() {
  // LUZ
  cron.schedule('* * * * *', async () => {
    const { comando, parametros } = reglas.LUZ.evaluar('mañana');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'LUZ', parametros);
    console.log('💡 LUZ encendida a las 07:00');
  });

  cron.schedule('0 12 * * *', async () => {
    const { comando, parametros } = reglas.LUZ.evaluar('tarde');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'LUZ', parametros);
    console.log('💡 LUZ apagada a las 12:00');
  });

  cron.schedule('0 19 * * *', async () => {
    const { comando, parametros } = reglas.LUZ.evaluar('noche');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'LUZ', parametros);
    console.log('💡 LUZ encendida a las 19:00');
  });

  // PERSIANAS
  cron.schedule('0 8 * * *', async () => {
    const { comando, parametros } = reglas.PERSIANA.evaluar('mañana');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'PERSIANA', parametros);
    console.log('🪟 Persianas abiertas a las 08:00');
  });

  cron.schedule('0 14 * * *', async () => {
    const { comando, parametros } = reglas.PERSIANA.evaluar('tarde');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'PERSIANA', parametros);
    console.log('🪟 Persianas a media sombra a las 14:00');
  });

  cron.schedule('0 19 * * *', async () => {
    const { comando, parametros } = reglas.PERSIANA.evaluar('noche');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'PERSIANA', parametros);
    console.log('🪟 Persianas cerradas a las 19:00');
  });

  // AIRE ACONDICIONADO
  cron.schedule('0 10 * * *', async () => {
    const { comando, parametros } = reglas.AC.evaluar('mañana');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'AC', parametros);
    console.log('❄️ A/C encendido a las 10:00');
  });

  cron.schedule('0 15 * * *', async () => {
    const { comando, parametros } = reglas.AC.evaluar('tarde');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'AC', parametros);
    console.log('❄️ A/C ajustado a 22°C a las 15:00');
  });

  cron.schedule('0 21 * * *', async () => {
    const { comando, parametros } = reglas.AC.evaluar('noche');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'AC', parametros);
    console.log('❄️ A/C apagado a las 21:00');
  });

  // VENTANAS
  cron.schedule('0 9 * * *', async () => {
    const { comando, parametros } = reglas.VENTANA.evaluar('mañana');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'VENTANA', parametros);
    console.log('🪟 VENTANAS abiertas al 50% a las 09:00');
  });

  cron.schedule('0 10 * * *', async () => {
    const { comando, parametros } = reglas.VENTANA.evaluar('aireEncendido');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'VENTANA', parametros);
    console.log('🪟 VENTANAS cerradas a las 10:00 (por A/C)');
  });

  cron.schedule('0 19 * * *', async () => {
    const { comando, parametros } = reglas.VENTANA.evaluar('noche');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'VENTANA', parametros);
    console.log('🪟 VENTANAS abiertas al 70% a las 19:00');
  });

  // AUDIO
  cron.schedule('0 9 * * *', async () => {
    const { comando, parametros } = reglas.AUDIO.evaluar('mañana');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'AUDIO', parametros);
    console.log('🔊 AUDIO encendido a las 09:00 con volumen 45');
  });

  cron.schedule('0 14 * * *', async () => {
    const { comando, parametros } = reglas.AUDIO.evaluar('tarde');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'AUDIO', parametros);
    console.log('🔊 AUDIO volumen subido a 60 a las 14:00');
  });

  cron.schedule('0 18 * * *', async () => {
    const { comando, parametros } = reglas.AUDIO.evaluar('noche');
    mqttService.enviarComando(comando, parametros);
    await logService.registrarAccion(comando, 'AUDIO', parametros);
    console.log('🔇 AUDIO apagado a las 18:00');
  });
}

programarAutomatizaciones();
