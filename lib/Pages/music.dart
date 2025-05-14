import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

class MusicControlPage extends StatefulWidget {
  @override
  State<MusicControlPage> createState() => _MusicControlPageState();
}

class _MusicControlPageState extends State<MusicControlPage> {
  late MqttServerClient client;
  double volumen = 50;
  String cancionActual = 'Desconocida';
  bool audioEncendido = false;

  @override
  void initState() {
    super.initState();
    _connectToMqtt();
  }

  Future<void> _connectToMqtt() async {
    client = MqttServerClient('192.168.137.147', '');
    client.port = 1883;
    client.keepAlivePeriod = 20;
    client.onDisconnected = _onDisconnected;
    client.logging(on: false);

    final connMessage = MqttConnectMessage()
        .withClientIdentifier('flutter_music_client')
        .startClean()
        .withWillQos(MqttQos.atMostOnce);

    client.connectionMessage = connMessage;

    try {
      await client.connect();
      log('✅ Conectado al broker MQTT');

      client.subscribe('eoffice/audio/actuador', MqttQos.atMostOnce);

      client.updates!.listen((List<MqttReceivedMessage<MqttMessage?>>? c) {
        final recMess = c![0].payload as MqttPublishMessage;
        final message = MqttPublishPayload.bytesToStringAsString(
          recMess.payload.message,
        );
        setState(() {
          cancionActual = message;
        });
      });
    } catch (e) {
      log('❌ Error de conexión: $e');
    }
  }

  void _onDisconnected() {
    log('🔌 Desconectado del broker MQTT');
  }

  void _publishAction(String accion) {
    final builder = MqttClientPayloadBuilder();
    builder.addString('{"accion": "$accion"}');
    client.publishMessage(
      'eoffice/audio/actuador',
      MqttQos.exactlyOnce,
      builder.payload!,
    );
  }

  void _publishVolume(int volumen) {
    final builder = MqttClientPayloadBuilder();
    builder.addString('{"accion": "ajustar", "volumen": $volumen}');
    client.publishMessage(
      'eoffice/audio/actuador',
      MqttQos.exactlyOnce,
      builder.payload!,
    );
  }

  Widget _buildMusicButton(IconData icon, String accion, String tooltip) {
    return Tooltip(
      message: tooltip,
      child: ElevatedButton(
        onPressed: audioEncendido ? () => _publishAction(accion) : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.indigo.shade700,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: EdgeInsets.all(20),
        ),
        child: Icon(icon, size: 28, color: Colors.white),
      ),
    );
  }

  Widget _buildTogglePowerButton() {
    return ElevatedButton.icon(
      onPressed: () {
        setState(() => audioEncendido = !audioEncendido);
        _publishAction(audioEncendido ? "encender" : "apagar");
      },
      icon: Icon(audioEncendido ? Icons.power_settings_new : Icons.power_off),
      label: Text(audioEncendido ? "Apagar" : "Encender"),
      style: ElevatedButton.styleFrom(
        backgroundColor: audioEncendido ? Colors.red : Colors.green,
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        textStyle: TextStyle(fontSize: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.indigo.shade50,
      appBar: AppBar(
        title: Text('Control de Música'),
        backgroundColor: Colors.indigo.shade50,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    RotatedBox(
                      quarterTurns: -1,
                      child: SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          trackHeight: 10,
                          thumbShape: RoundSliderThumbShape(
                            enabledThumbRadius: 10,
                          ),
                          thumbColor: Colors.indigo,
                          activeTrackColor: Colors.indigoAccent,
                          inactiveTrackColor: Colors.indigo.shade100,
                          overlayColor: Colors.indigo.withOpacity(0.2),
                        ),
                        child: Slider(
                          value: volumen,
                          min: 0,
                          max: 100,
                          onChanged:
                              audioEncendido
                                  ? (value) {
                                    setState(() => volumen = value);
                                    _publishVolume(volumen.toInt());
                                  }
                                  : null,
                        ),
                      ),
                    ),
                    SizedBox(width: 40),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildMusicButton(
                          Icons.play_arrow,
                          'reanudar',
                          'Reanudar',
                        ),
                        SizedBox(height: 20),
                        _buildMusicButton(Icons.pause, 'pausar', 'Pausar'),
                        SizedBox(height: 20),
                        _buildMusicButton(
                          Icons.skip_next,
                          'siguiente',
                          'Siguiente',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 20),

            _buildTogglePowerButton(),

            SizedBox(height: 20),

            Text(
              'Reproduciendo:\n$cancionActual',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    client.disconnect();
    super.dispose();
  }
}
