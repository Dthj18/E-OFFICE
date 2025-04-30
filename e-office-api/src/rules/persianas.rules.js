module.exports = {
  evaluar: (momento) => {
    switch (momento) {
      case 'mañana':
        return { comando: 'set_persiana', parametros: { porcentaje: 100 } };
      case 'tarde':
        return { comando: 'set_persiana', parametros: { porcentaje: 50 } }; 
      case 'noche':
        return { comando: 'set_persiana', parametros: { porcentaje: 0 } };  
      default:
        return null;
    }
  }
};
