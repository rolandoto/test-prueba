const FechaFormato = ({ desde }) => {
  const fecha = desde;
  const fechaObj = new Date(fecha);
  const anio = fechaObj.getFullYear();
  const mes = fechaObj.getMonth() + 1; // sumamos 1 ya que los meses en JS empiezan en 0 (enero = 0)
  const dia = fechaObj.getDate();

  const fechaFormateada = `${anio}-${mes.toString().padStart(2, "0")}-${dia
    .toString()
    .padStart(2, "0")}`;

  return { fechaFormateada };
};

module.exports = { FechaFormato };
