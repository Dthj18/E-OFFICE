class LogEventos {
  constructor(id_log, id_emulador, id_accion, id_usuario, fecha_hora, observaciones) {
      this.id_log = id_log;
      this.id_emulador = id_emulador;
      this.id_accion = id_accion;
      this.id_usuario = id_usuario;
      this.fecha_hora = fecha_hora;
      this.observaciones = observaciones;
  }
}

module.exports = LogEventos;
