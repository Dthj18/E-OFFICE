module.exports = {
  evaluar: (momento) => {
    switch (momento) {
      case 'mañana':
        return { comando: 'ON_AUDIO', parametros: { volumen: 15 } }; 
      case 'tarde':
        return { comando: 'SET_VOL', parametros: { volumen: 35 } }; 
      case 'noche':
        return { comando: 'OFF_AUDIO' }; 
      default:
        return null;
    }
  }
};
