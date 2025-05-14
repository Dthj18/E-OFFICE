import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

class LuzControlPage extends StatefulWidget {
  @override
  _LuzControlPageState createState() => _LuzControlPageState();
}

class _LuzControlPageState extends State<LuzControlPage> {
  late MqttServerClient client;
  double intensidad = 50;

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
        .withClientIdentifier('flutter_luz_client')
        .startClean()
        .withWillQos(MqttQos.atMostOnce);

    client.connectionMessage = connMessage;

    try {
      await client.connect();
      log('Conectado al broker MQTT');
    } catch (e) {
      log('Error de conexión: $e');
    }
  }

  void _onDisconnected() {
    log('Desconectado del broker MQTT');
  }

  void _publishMessage(String topic, String message) {
    final builder = MqttClientPayloadBuilder();
    builder.addString(message);
    client.publishMessage(topic, MqttQos.exactlyOnce, builder.payload!);
  }

  void _encenderLuz() {
    _publishMessage('eoffice/luces/actuador', '{"accion": "encender"}');
    log('Luz encendida');
  }

  void _apagarLuz() {
    _publishMessage('eoffice/luces/actuador', '{"accion": "apagar"}');
    log('Luz apagada');
  }

  void _ajustarIntensidad(double value) {
    setState(() {
      intensidad = value;
    });

    final mensaje =
        '{"accion": "ajustar", "intensidad": ${intensidad.toInt()}}';
    _publishMessage('eoffice/luces/actuador', mensaje);
    log('Intensidad ajustada a ${intensidad.toInt()}%');
  }

  Widget _buildLuzButton(String label, IconData icon, VoidCallback onPressed) {
    return SizedBox(
      width: 140,
      height: 60,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon, color: Colors.white),
        label: Text(label, style: TextStyle(color: Colors.white)),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.indigo.shade700,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    client.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.indigo.shade50,
      appBar: AppBar(
        title: Text('Control de Luces'),
        backgroundColor: Colors.indigo.shade50,
      ),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Ajustar intensidad de luz',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            Text('${intensidad.toInt()}%', style: TextStyle(fontSize: 16)),
            SliderTheme(
              data: SliderTheme.of(context).copyWith(
                activeTrackColor: Colors.indigo.shade700,
                inactiveTrackColor: Colors.indigo.shade100,
                trackHeight: 10,
                thumbColor: Colors.indigo.shade900,
                overlayColor: Colors.indigo.withOpacity(0.3),
                valueIndicatorColor: Colors.indigo,
              ),
              child: Slider(
                value: intensidad,
                min: 0,
                max: 100,
                divisions: 20,
                label: '${intensidad.toInt()}%',
                onChanged: _ajustarIntensidad,
              ),
            ),
            SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildLuzButton(
                  'Encender',
                  Icons.lightbulb_outline,
                  _encenderLuz,
                ),
                _buildLuzButton('Apagar', Icons.power_settings_new, _apagarLuz),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
