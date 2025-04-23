import 'package:flutter/material.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

class VentanaControlPage extends StatefulWidget {
  @override
  State<VentanaControlPage> createState() => _VentanaControlPageState();
}

class _VentanaControlPageState extends State<VentanaControlPage> {
  late MqttServerClient client;
  final PageController _pageController = PageController(viewportFraction: 1);
  final List<String> ventanas = ['Ventana 1', 'Ventana 2', 'Ventana 3'];
  int _paginaActual = 0;

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
        .withClientIdentifier('flutter_ventana_client')
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
              'ventanas/control',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Control de Ventanas')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              'Selecciona una ventana',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            SizedBox(
              height: 180,
              child: PageView.builder(
                controller: _pageController,
                itemCount: ventanas.length,
                onPageChanged: (index) {
                  setState(() => _paginaActual = index);
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
                          ventanas[index],
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
            ),
            SizedBox(height: 30),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildControlButton('Abrir', Icons.open_in_new, 'abrir'),
                _buildControlButton('Cerrar', Icons.close, 'cerrar'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
