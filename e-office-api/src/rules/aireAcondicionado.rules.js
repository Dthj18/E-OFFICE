module.exports = {
  evaluar: (momento) => {
    switch (momento) {
      case 'mañana':
        return { comando: 'ON_AIR', parametros: { temperatura: 24 } };
      case 'tarde':
        return { comando: 'SET_AC_TEMP', parametros: { temperatura: 22 } };
      case 'noche':
        return { comando: 'OFF_AIR' };
      default:
        return null;
    }
  }
};
