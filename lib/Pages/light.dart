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
    client = MqttServerClient('192.168.212.151', '');
    client.port = 1883;
    client.keepAlivePeriod = 20;
    client.onDisconnected = _onDisconnected;
    client.logging(on: false);

    final connMessage = MqttConnectMessage()
        .withClientIdentifier('flutter_client')
        .startClean()
        .withWillQos(MqttQos.atMostOnce);

    client.connectionMessage = connMessage;

    try {
      await client.connect();
      print('Conectado al broker EMQX');
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

  void _encenderLuz() {
    _publishMessage('eoffice/luces/actuador', '{"accion": "encender"}');
    print('Luz encendida');
  }

  void _apagarLuz() {
    _publishMessage('eoffice/luces/actuador', '{"accion": "apagar"}');
    print('Luz apagada');
  }

  void _ajustarIntensidad(double value) {
    setState(() {
      intensidad = value;
    });

    String mensaje =
        '{"accion": "ajustar", "intensidad": ${intensidad.toInt()}}';

    _publishMessage('eoffice/luces/actuador', mensaje);

    print('Intensidad ajustada a $intensidad%');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Control de Luces')),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text('Intensidad: ${intensidad.toInt()}%'),
            SizedBox(
              width: 300,
              child: SliderTheme(
                data: SliderTheme.of(context).copyWith(
                  activeTrackColor: Colors.indigo.shade700,
                  inactiveTrackColor: Colors.indigo.shade100,
                  trackHeight: 12.0,
                  thumbColor: Colors.indigo.shade900,
                  thumbShape: RoundSliderThumbShape(enabledThumbRadius: 14.0),
                  overlayColor: Colors.indigo.withOpacity(0.3),
                  overlayShape: RoundSliderOverlayShape(overlayRadius: 24.0),
                  valueIndicatorColor: Colors.indigo,
                  valueIndicatorTextStyle: TextStyle(color: Colors.white),
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
            ),

            SizedBox(height: 40),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 120,
                  height: 100,
                  child: ElevatedButton(
                    onPressed: _encenderLuz,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.wb_incandescent,
                          color: Colors.white,
                          size: 30,
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Luz Cálida',
                          style: TextStyle(color: Colors.white),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(width: 20),
                SizedBox(
                  width: 120,
                  height: 100,
                  child: ElevatedButton(
                    onPressed: _apagarLuz,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.ac_unit, color: Colors.white, size: 30),
                        SizedBox(height: 8),
                        Text(
                          'Luz Fría',
                          style: TextStyle(color: Colors.white),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
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
