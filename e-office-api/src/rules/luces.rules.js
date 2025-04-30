module.exports = {
  evaluar: (momento) => {
    switch (momento) {
      case 'mañana':
        return { comando: 'ON_LIGHTS', parametros: { intensidad: 50 } };
      case 'tarde':
        return { comando: 'OFF_LIGHTS' };
      case 'noche':
        return { comando: 'ON_LIGHTS', parametros: { intensidad: 100 } };
      default:
        return null;
    }
  }
};
