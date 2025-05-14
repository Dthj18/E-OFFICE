import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

class PersianaControlPage extends StatefulWidget {
  @override
  State<PersianaControlPage> createState() => _PersianaControlPageState();
}

class _PersianaControlPageState extends State<PersianaControlPage> {
  late MqttServerClient client;
  final String broker = '192.168.137.147';
  final String topicPersianas = 'eoffice/persianas/actuador';
  bool _conectado = false;
  int _paginaActual = 0;
  double nivelApertura = 50;

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
    client = MqttServerClient(broker, 'flutter_persianas_client');
    client.port = 1883;
    client.keepAlivePeriod = 20;
    client.logging(on: false);
    client.onDisconnected = _onDisconnected;

    final connMessage = MqttConnectMessage()
        .withClientIdentifier('flutter_persianas_client')
        .startClean()
        .withWillQos(MqttQos.atMostOnce);

    client.connectionMessage = connMessage;

    try {
      await client.connect();
      log('✅ Conectado a MQTT');
      setState(() => _conectado = true);
    } catch (e) {
      log('❌ Error al conectar: $e');
    }
  }

  void _onDisconnected() {
    setState(() => _conectado = false);
    log('🔌 Desconectado del broker MQTT');
  }

  void _publishMessage(String topic, Map<String, dynamic> message) {
    if (!_conectado) return;
    final builder = MqttClientPayloadBuilder();
    builder.addString(json.encode(message));
    client.publishMessage(topic, MqttQos.exactlyOnce, builder.payload!);
  }

  void _sendCommand(String accion) {
    final message = {'accion': accion, 'persiana': _paginaActual + 1};
    _publishMessage(topicPersianas, message);
  }

  void _publishApertura(double nivel) {
    final mensaje = {
      "accion": "ajustar",
      "persiana": _paginaActual + 1,
      "nivel": nivel.toInt(),
    };
    _publishMessage(topicPersianas, mensaje);
  }

  Widget _buildControlButton(IconData icon, String action) {
    return IconButton(
      onPressed: () => _sendCommand(action),
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
        itemCount: persianasDisponibles.length,
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
                    offset: Offset(0, 4),
                  ),
              ],
            ),
            alignment: Alignment.center,
            child: Text(
              persianasDisponibles[index],
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

  Widget _buildSlider() {
    return Column(
      children: [
        Text(
          'Apertura: ${nivelApertura.toInt()}%',
          style: TextStyle(fontSize: 14),
        ),
        Slider(
          value: nivelApertura,
          min: 0,
          max: 100,
          divisions: 20,
          activeColor: Colors.indigo,
          label: '${nivelApertura.toInt()}%',
          onChanged: (newValue) {
            setState(() => nivelApertura = newValue);
            _publishApertura(newValue);
          },
        ),
      ],
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
        title: Text('Control de Persianas'),
        backgroundColor: Colors.indigo.shade50,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Selecciona una persiana',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.indigo.shade800,
              ),
            ),
            SizedBox(height: 20),
            _buildCarrusel(),
            Divider(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildControlButton(Icons.keyboard_arrow_up, 'abrir'),
                SizedBox(width: 40),
                _buildControlButton(Icons.keyboard_arrow_down, 'cerrar'),
              ],
            ),
            Divider(height: 40),
            _buildSlider(),
          ],
        ),
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() => '${this[0].toUpperCase()}${substring(1)}';
}
