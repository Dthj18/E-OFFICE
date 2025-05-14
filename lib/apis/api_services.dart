import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:8080/api/luces';

  static Future<void> encenderLuz() async {
    final response = await http.post(Uri.parse('$baseUrl/encender'));
    print('Respuesta encender: ${response.body}');
  }

  static Future<void> apagarLuz() async {
    final response = await http.post(Uri.parse('$baseUrl/apagar'));
    print('Respuesta apagar: ${response.body}');
  }

  static Future<void> ajustarIntensidad(int valor) async {
    final response = await http.post(Uri.parse('$baseUrl/intensidad/$valor'));
    print('Respuesta intensidad: ${response.body}');
  }
}
