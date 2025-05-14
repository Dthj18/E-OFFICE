import 'dart:convert';
import 'package:eoffice/Pages/Principal.dart';
import 'package:eoffice/Pages/registro.dart';
import 'package:eoffice/components/my_button.dart';
import 'package:eoffice/components/my_textfield.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();

  bool _isLoading = false;

  void showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.redAccent),
    );
  }

  Future<void> signUserIn() async {
    setState(() {
      _isLoading = true;
    });

    final String email = usernameController.text.trim();
    final String password = passwordController.text.trim();

    const String baseUrl = 'http://localhost:8080/usuarios';
    const String loginEndpoint = '/usuarios/login';
    final String apiUrl = '$baseUrl$loginEndpoint';

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        body: {'mail': email, 'password': password},
      );

      setState(() {
        _isLoading = false;
      });

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final decodedBody = utf8.decode(response.bodyBytes);
        final Map<String, dynamic> userData = jsonDecode(decodedBody);

        final String nombre = userData['name'];
        final String correo = userData['mail'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userName', nombre);
        await prefs.setString('userEmail', correo);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('¡Inicio de sesión exitoso!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );

        Future.delayed(Duration(seconds: 1), () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder:
                  (context) => Principal(userName: nombre, userEmail: correo),
            ),
          );
        });
      } else if (response.statusCode == 401) {
        final String errorMessage =
            response.body == "Credenciales incorrectas"
                ? "Credenciales incorrectas"
                : "Error de autenticación desconocido";

        showErrorMessage('Error en el inicio de sesión: $errorMessage');
      } else {
        showErrorMessage(
          'Ocurrió un error en el servidor: ${response.statusCode}',
        );
        print('Server error: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print('Error de red o excepción: $e');
      showErrorMessage(
        'No se pudo conectar con el servidor. Inténtalo de nuevo.',
      );
    }
  }

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blue[100],
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 50),
                Image.asset('assets/images/logo.png', width: 120, height: 120),
                const SizedBox(height: 15),
                const Text(
                  'Iniciar Sesión',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.blueGrey,
                  ),
                ),
                const SizedBox(height: 25),
                MyTextfield(
                  controller: usernameController,
                  hintText: 'Correo Electrónico',
                  obscureText: false,
                ),
                const SizedBox(height: 10),
                MyTextfield(
                  controller: passwordController,
                  hintText: 'Contraseña',
                  obscureText: true,
                ),
                const SizedBox(height: 25),
                MyButton(onTap: _isLoading ? null : signUserIn),
                const SizedBox(height: 15),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('¿No tienes cuenta?'),
                    TextButton(
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => RegisterPage(),
                          ),
                        );
                      },
                      child: const Text(
                        'Regístrate aquí',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
