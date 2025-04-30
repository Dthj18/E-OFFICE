
exports.obtenerComandos = async (req, res) => {
    try {
        const comandos = await ComandoService.obtenerTodos();
        res.status(200).json(comandos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los comandos' });
    }
};

exports.enviarComando = async (req, res) => {
    try {
        const { comando, parametros, idEmulador, idUsuario } = req.body;
        const resultado = await ComandoService.enviar(comando, parametros, idEmulador, idUsuario);
        res.status(200).json({ message: "Comando enviado correctamente", resultado });
    } catch (error) {
        res.status(500).json({ error: "Error al enviar el comando" });
    }
};
