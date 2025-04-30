const LogService = require('../services/log.service');

exports.obtenerLogs = async (req, res) => {
    try {
        const logs = await LogService.obtenerTodos();
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los logs' });
    }
};
