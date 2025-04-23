import 'package:eoffice/Pages/blinds.dart';
import 'package:eoffice/Pages/light.dart';
import 'package:eoffice/Pages/music.dart';
import 'package:eoffice/Pages/temperature.dart';
import 'package:eoffice/Pages/windows.dart';
import 'package:eoffice/Pages/profile.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Principal',
      theme: ThemeData(primarySwatch: Colors.indigo),
      home: const Principal(),
    );
  }
}

class Principal extends StatefulWidget {
  const Principal({Key? key}) : super(key: key);

  @override
  _PrincipalState createState() => _PrincipalState();
}

class _PrincipalState extends State<Principal> {
  final List<String> modosDisponibles = [
    'Automático',
    'Personalizado',
    'Vacaciones',
    'Noche',
  ];

  int _modoActual = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'E-OFFICE',
          style: TextStyle(fontSize: 18, color: Colors.indigo),
        ),
        backgroundColor: Colors.indigo.shade100,
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => PerfilPage()),
              );
            },
          ),
        ],
      ),
      backgroundColor: Colors.indigo.shade50,
      body: SafeArea(
        child: Container(
          margin: const EdgeInsets.only(top: 18, left: 24, right: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),

              _buildSelectorModos(),

              const SizedBox(height: 20),

              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  padding: const EdgeInsets.only(bottom: 20),
                  children: [
                    _cardMenu(
                      title: 'Persianas',
                      icon: 'assets/images/persianas.png',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PersianaControlPage(),
                          ),
                        );
                      },
                    ),
                    _cardMenu(
                      title: 'Luz',
                      icon: 'assets/images/lampara.png',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => LuzControlPage(),
                          ),
                        );
                      },
                    ),
                    _cardMenu(
                      title: 'Mini-split',
                      icon: 'assets/images/aire-acondicionado.png',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => TemperaturePage(),
                          ),
                        );
                      },
                    ),
                    _cardMenu(
                      title: 'Audio',
                      icon: 'assets/images/altavoz.png',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => MusicControlPage(),
                          ),
                        );
                      },
                    ),
                    _cardMenu(
                      title: 'Ventanas',
                      icon: 'assets/images/cortinas.png',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => VentanaControlPage(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSelectorModos() {
    return GestureDetector(
      onTap: () => _mostrarSelectorModos(),
      child: Container(
        height: 60,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.indigo.shade100,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Modo: ${modosDisponibles[_modoActual]}',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.indigo.shade900,
              ),
            ),
            const Icon(Icons.keyboard_arrow_down, color: Colors.indigo),
          ],
        ),
      ),
    );
  }

  void _mostrarSelectorModos() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return ListView.separated(
          shrinkWrap: true,
          itemCount: modosDisponibles.length,
          separatorBuilder: (_, __) => const Divider(height: 1),
          itemBuilder: (context, index) {
            return ListTile(
              title: Text(
                modosDisponibles[index],
                style: TextStyle(
                  fontWeight:
                      index == _modoActual
                          ? FontWeight.bold
                          : FontWeight.normal,
                  color: index == _modoActual ? Colors.indigo : Colors.black87,
                ),
              ),
              trailing:
                  index == _modoActual
                      ? const Icon(Icons.check, color: Colors.indigo)
                      : null,
              onTap: () {
                setState(() {
                  _modoActual = index;
                });
                Navigator.pop(context);
              },
            );
          },
        );
      },
    );
  }

  Widget _cardMenu({
    required String title,
    required String icon,
    VoidCallback? onTap,
    Color color = Colors.white,
    Color fontColor = Colors.grey,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 36),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: color,
          boxShadow: const [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 4,
              offset: Offset(2, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(icon, width: 50, height: 50),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(fontWeight: FontWeight.bold, color: fontColor),
            ),
          ],
        ),
      ),
    );
  }
}
