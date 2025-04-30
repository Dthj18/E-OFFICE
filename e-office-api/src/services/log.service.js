const sequelize = require('../config/db'); // tu instancia Sequelize

async function registrarAccion(comando, emuladorCve, parametros = {}, idUsuario = 2) {
  try {
    await sequelize.query(
      `
      INSERT INTO LogEventos (id_emulador, id_accion, id_usuario, fecha_hora, observaciones)
      VALUES (
        (SELECT id_emulador FROM emulador WHERE cve = ?),
        (SELECT id_accion FROM accion WHERE cve = ?),
        ?,
        NOW(),
        ?
      )
      `,
      {
        replacements: [
          emuladorCve,
          comando,
          idUsuario,
          JSON.stringify(parametros),
        ],
      }
    );

    console.log(`📝 Acción registrada en BD: ${comando} - ${emuladorCve} (Usuario: ${idUsuario})`);
  } catch (error) {
    console.error('❌ Error al registrar acción en BD:', error);
  }
}



module.exports = { registrarAccion };
