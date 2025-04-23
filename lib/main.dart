import 'package:eoffice/Pages/Principal.dart';
import 'package:flutter/material.dart';
import 'package:eoffice/Pages/login.dart'; // Importa la segunda pantalla

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Flutter Demo',
      initialRoute: '/', // Ruta inicial
      routes: {
        '/': (context) => MainScreen(),
        '/segunda': (context) => LoginPage(),
        '/tercera': (context) => Principal(),
      },
    );
  }
}

class MainScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Pantalla Principal')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/segunda');
              },
              child: Text('Ir a la Segunda Pantalla'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/tercera');
              },
              child: Text('Ir a la Tercera Pantalla'),
            ),
          ],
        ),
      ),
    );
  }
}
