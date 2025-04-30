module.exports = {
  evaluar: (momento) => {
    switch (momento) {
      case 'mañana':
        return { comando: 'SET_WINDOW', parametros: { porcentaje: 50 } }; 
      case 'aireEncendido':
        return { comando: 'CLOSE_WINDOW' }; 
      case 'noche':
        return { comando: 'SET_WINDOW', parametros: { porcentaje: 70 } };
      default:
        return null;
    }
  }
};
