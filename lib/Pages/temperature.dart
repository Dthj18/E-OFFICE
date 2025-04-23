import 'package:flutter/material.dart';

class TemperaturePage extends StatefulWidget {
  const TemperaturePage({Key? key}) : super(key: key);

  @override
  _TemperaturePageState createState() => _TemperaturePageState();
}

class _TemperaturePageState extends State<TemperaturePage> {
  int temperature = 24;
  String mode = "Cooling";
  int speed = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Control de Mini-splits')),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Align(
            alignment: Alignment(-0.04, -0.65),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 180,
                  width: 145,
                  decoration: BoxDecoration(
                    color: Colors.indigo.shade700,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "$temperature°C",
                        style: TextStyle(color: Colors.white, fontSize: 24),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 10),

                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      height: 85,
                      width: 145,
                      decoration: BoxDecoration(
                        color: Colors.indigo.shade700,
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    SizedBox(height: 10),
                    Container(
                      height: 85,
                      width: 145,
                      decoration: BoxDecoration(
                        color: Colors.indigo.shade700,
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Column(
                children: [
                  controlButton(Icons.lightbulb, "Encender", Colors.green, () {
                    setState(() {
                      temperature = 22;
                    });
                  }),
                  SizedBox(height: 10),
                  controlButton(
                    Icons.power_settings_new,
                    "Apagar",
                    Colors.red,
                    () {
                      setState(() {
                        temperature = 0;
                      });
                    },
                  ),
                ],
              ),
              SizedBox(width: 20),
              Column(
                children: [
                  controlButton(Icons.add, "Subir", Colors.indigo.shade700, () {
                    setState(() {
                      temperature++;
                    });
                  }),
                  SizedBox(height: 10),
                  controlButton(
                    Icons.remove,
                    "Bajar",
                    Colors.indigo.shade700,
                    () {
                      setState(() {
                        temperature--;
                      });
                    },
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget controlButton(
    IconData icon,
    String label,
    Color color,
    VoidCallback onPressed,
  ) {
    return Column(
      children: [
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: color,
            shape: CircleBorder(),
            padding: EdgeInsets.all(30),
          ),
          onPressed: onPressed,
          child: Icon(icon, color: Colors.white, size: 60),
        ),
        SizedBox(height: 5),
        Text(label, style: TextStyle(color: Colors.black)),
      ],
    );
  }
}
