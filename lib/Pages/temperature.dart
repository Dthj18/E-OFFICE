import 'dart:convert';
import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

class TemperaturePage extends StatefulWidget {
  const TemperaturePage({Key? key}) : super(key: key);

  @override
  _TemperaturePageState createState() => _TemperaturePageState();
}

class _TemperaturePageState extends State<TemperaturePage> {
  int temperature = 24;
  bool isOn = false;
  late MqttServerClient client;

  final String broker = '192.168.137.147';
  final String topicAire = 'eoffice/aire/actuador';
  final String topicSubir = 'eoffice/aire/subir';
  final String topicBajar = 'eoffice/aire/bajar';

  @override
  void initState() {
    super.initState();
    _connectToMqtt();
  }

  Future<void> _connectToMqtt() async {
    client = MqttServerClient(broker, 'flutter_client');
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
      log('✅ Conectado a MQTT');
    } catch (e) {
      log('❌ Error al conectar: $e');
    }
  }

  void _onDisconnected() {
    log('🔌 Desconectado del broker MQTT');
  }

  void _publishJson(String topic, Map<String, dynamic> payload) {
    final builder = MqttClientPayloadBuilder();
    builder.addString(jsonEncode(payload));
    client.publishMessage(topic, MqttQos.atMostOnce, builder.payload!);
  }

  void _togglePower(bool turnOn) {
    setState(() {
      isOn = turnOn;
      if (turnOn) {
        _publishJson(topicAire, {"accion": "encender"});
      } else {
        _publishJson(topicAire, {"accion": "apagar"});
      }
    });
  }

  void _changeTemperature(bool increase) {
    if (!isOn) return;
    setState(() {
      if (increase) {
        temperature++;
        _publishJson(topicAire, {
          "accion": "ajustar",
          "temperatura": temperature,
        });
      } else {
        temperature--;
        _publishJson(topicAire, {
          "accion": "ajustar",
          "temperatura": temperature,
        });
      }
    });
  }

  void _setTemperature(int newTemp) {
    if (!isOn) return;
    setState(() {
      temperature = newTemp;
      _publishJson(topicAire, {
        "accion": "ajustar",
        "temperatura": temperature,
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.indigo.shade50,
      appBar: AppBar(
        title: Text('Control del Aire Acondicionado'),
        backgroundColor: Colors.indigo.shade50,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                color: Colors.white,
                child: Container(
                  width: double.infinity,
                  padding: EdgeInsets.symmetric(vertical: 30),
                  child: Column(
                    children: [
                      Icon(Icons.ac_unit, size: 50, color: Colors.indigo),
                      SizedBox(height: 10),
                      Text(
                        '$temperature°C',
                        style: TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: Colors.indigo.shade700,
                        ),
                      ),
                      SizedBox(height: 10),
                      Text(
                        isOn ? 'A/C Encendido' : 'A/C Apagado',
                        style: TextStyle(
                          fontSize: 18,
                          color: isOn ? Colors.green : Colors.red,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 20),
              SwitchListTile(
                title: Text(
                  'Encender / Apagar',
                  style: TextStyle(fontSize: 18),
                ),
                value: isOn,
                onChanged: _togglePower,
                activeColor: Colors.indigo,
              ),
              SizedBox(height: 10),
              if (isOn) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _changeTemperature(true),
                      icon: Icon(Icons.arrow_upward),
                      label: Text('Subir'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.indigo,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    SizedBox(width: 20),
                    ElevatedButton.icon(
                      onPressed: () => _changeTemperature(false),
                      icon: Icon(Icons.arrow_downward),
                      label: Text('Bajar'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.indigo,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 30),
                Text('Ajustar temperatura', style: TextStyle(fontSize: 16)),
                Slider(
                  value: temperature.toDouble(),
                  min: 16,
                  max: 30,
                  divisions: 14,
                  activeColor: Colors.indigo,
                  label: '$temperature°C',
                  onChanged: (newValue) {
                    _setTemperature(newValue.toInt());
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
