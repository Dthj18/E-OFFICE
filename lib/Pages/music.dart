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

  @override
  void initState() {
    super.initState();
    _connectToMqtt();
  }

  Future<void> _connectToMqtt() async {
    client = MqttServerClient('192.168.212.151', '');
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
      print('Conectado al broker MQTT');

      client.subscribe('musica/cancion', MqttQos.atMostOnce);

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
      print('Error de conexión: $e');
    }
  }

  void _onDisconnected() {
    print('Desconectado del broker MQTT');
  }

  void _publishMessage(String topic, String message) {
    final builder = MqttClientPayloadBuilder();
    builder.addString(message);
    client.publishMessage(topic, MqttQos.exactlyOnce, builder.payload!);
  }

  Widget _buildMusicButton(IconData icon, String action) {
    return SizedBox(
      width: 80,
      height: 80,
      child: ElevatedButton(
        onPressed: () => _publishMessage('musica/control', action),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.indigo.shade700,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
        ),
        child: Icon(icon, color: Colors.white, size: 35),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Control de Música')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Slider Vertical
                    Container(
                      height: 300,
                      width: 80,
                      padding: EdgeInsets.symmetric(horizontal: 8),
                      child: RotatedBox(
                        quarterTurns: -1,
                        child: SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            trackHeight: 12,
                            thumbShape: RoundSliderThumbShape(
                              enabledThumbRadius: 12,
                            ),
                            thumbColor: Colors.indigo,
                            activeTrackColor: Colors.indigoAccent,
                            inactiveTrackColor: Colors.grey.shade300,
                            overlayColor: Colors.indigo.withOpacity(0.2),
                          ),
                          child: Slider(
                            value: volumen,
                            min: 0,
                            max: 100,
                            onChanged: (newValue) {
                              setState(() => volumen = newValue);
                              _publishMessage(
                                'musica/volumen',
                                volumen.toInt().toString(),
                              );
                            },
                          ),
                        ),
                      ),
                    ),

                    // Espacio entre slider y botones
                    SizedBox(width: 30),

                    // Botones grandes
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildMusicButton(Icons.skip_previous, 'anterior'),
                        SizedBox(height: 30),
                        _buildMusicButton(Icons.pause, 'pausar'),
                        SizedBox(height: 30),
                        _buildMusicButton(Icons.skip_next, 'siguiente'),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 20),
            Text(
              'Reproduciendo: $cancionActual',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
