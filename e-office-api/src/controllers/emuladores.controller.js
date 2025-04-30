

exports.obtenerEmuladores = async (req, res) => {
    try {
        const emuladores = await EmuladorService.obtenerTodos();
        res.status(200).json(emuladores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los emuladores' });
    }
};

exports.crearEmulador = async (req, res) => {
    try {
        const { cve, descripcion } = req.body;
        const nuevoEmulador = await EmuladorService.crear({ cve, descripcion });
        res.status(201).json(nuevoEmulador);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el emulador' });
    }
};
