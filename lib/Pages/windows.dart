import 'dart:convert';
import 'dart:developer';
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
  final List<String> ventanas = [
    'Ventana 1',
    'Ventana 2',
    'Ventana 3',
    'Ventana 4',
  ];
  int _paginaActual = 0;

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
        .withClientIdentifier('flutter_ventana_client')
        .startClean()
        .withWillQos(MqttQos.atMostOnce);

    client.connectionMessage = connMessage;

    try {
      await client.connect();
      log('✅ Conectado al broker MQTT');
    } catch (e) {
      log('❌ Error de conexión: $e');
    }
  }

  void _onDisconnected() {
    log('🔌 Desconectado del broker MQTT');
  }

  void _publishMessage(String topic, String action, int windowIndex) {
    final message = {'accion': action, 'ventana': windowIndex + 1};
    final builder = MqttClientPayloadBuilder();
    builder.addString(jsonEncode(message));
    client.publishMessage(topic, MqttQos.exactlyOnce, builder.payload!);
  }

  Widget _buildControlButton(IconData icon, String action) {
    return IconButton(
      onPressed:
          () => _publishMessage(
            'eoffice/ventanas/actuador',
            action,
            _paginaActual,
          ),
      icon: Icon(icon),
      iconSize: 36,
      color: Colors.indigo.shade700,
      tooltip: action.capitalize(),
    );
  }

  Widget _buildCarrusel() {
    return SizedBox(
      height: 130,
      child: PageView.builder(
        controller: _pageController,
        itemCount: ventanas.length,
        onPageChanged: (index) => setState(() => _paginaActual = index),
        itemBuilder: (context, index) {
          final selected = index == _paginaActual;
          return AnimatedContainer(
            duration: Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            margin: EdgeInsets.symmetric(
              horizontal: 12,
              vertical: selected ? 0 : 10,
            ),
            decoration: BoxDecoration(
              color: selected ? Colors.indigo.shade100 : Colors.indigo.shade50,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                if (selected)
                  BoxShadow(
                    color: Colors.indigo.shade200,
                    blurRadius: 8,
                    offset: Offset(0, 5),
                  ),
              ],
            ),
            alignment: Alignment.center,
            child: Text(
              ventanas[index],
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.indigo.shade900,
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
      backgroundColor: Colors.indigo.shade50,
      appBar: AppBar(
        title: Text('Control de Ventanas'),
        backgroundColor: Colors.indigo.shade50,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
        child: Column(
          children: [
            Text(
              'Selecciona una ventana',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.indigo.shade800,
              ),
            ),
            SizedBox(height: 20),
            _buildCarrusel(),
            Divider(height: 50),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildControlButton(Icons.open_in_new, 'abrir'),
                SizedBox(width: 40),
                _buildControlButton(Icons.close, 'cerrar'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() => '${this[0].toUpperCase()}${substring(1)}';
}
