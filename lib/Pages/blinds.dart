import 'package:flutter/material.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

class PersianaControlPage extends StatefulWidget {
  @override
  State<PersianaControlPage> createState() => _PersianaControlPageState();
}

class _PersianaControlPageState extends State<PersianaControlPage> {
  late MqttServerClient client;
  final PageController _pageController = PageController(viewportFraction: 1);
  int _paginaActual = 0;

  final List<String> persianasDisponibles = [
    'Persiana 1',
    'Persiana 2',
    'Persiana 3',
    'Persiana 4',
  ];

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
        .withClientIdentifier('flutter_persianas_client')
        .startClean()
        .withWillQos(MqttQos.atMostOnce);

    client.connectionMessage = connMessage;

    try {
      await client.connect();
      print('Conectado al broker MQTT');
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

  Widget _buildControlButton(String label, IconData icon, String action) {
    return SizedBox(
      width: 140,
      height: 60,
      child: ElevatedButton.icon(
        onPressed:
            () => _publishMessage(
              'persianas/control',
              '$action:${_paginaActual + 1}',
            ),
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

  Widget _buildCarrusel() {
    return SizedBox(
      height: 180,
      child: PageView.builder(
        controller: _pageController,
        itemCount: persianasDisponibles.length,
        onPageChanged: (index) {
          setState(() {
            _paginaActual = index;
          });
        },
        itemBuilder: (context, index) {
          return Center(
            child: Card(
              elevation: 5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                width: 220,
                height: 140,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.indigo.shade100,
                ),
                child: Text(
                  persianasDisponibles[index],
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.indigo.shade900,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Control de Persianas')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Selecciona una persiana',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            _buildCarrusel(),
            SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildControlButton('Subir', Icons.keyboard_arrow_up, 'subir'),
                _buildControlButton(
                  'Bajar',
                  Icons.keyboard_arrow_down,
                  'bajar',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
