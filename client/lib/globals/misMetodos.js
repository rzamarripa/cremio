
//funcion para redondear
window.round = function (value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

//Quita los acentos
window.getCleanedString = function (cadena) {
	cadena = cadena.replace(/á/gi, "A");
	cadena = cadena.replace(/é/gi, "E");
	cadena = cadena.replace(/í/gi, "I");
	cadena = cadena.replace(/ó/gi, "O");
	cadena = cadena.replace(/ú/gi, "U");
	return cadena;
}
//Revisar dia inhabil para buscar la próximo Fecha
window.verificarDiaInhabil = function (fecha) {
	var diaFecha = fecha.isoWeekday();
	var diaInhabiles = DiasInhabiles.find({ tipo: "DIA", estatus: true }).fetch();
	var ban = false;
	_.each(diaInhabiles, function (dia) {
		if (Number(dia.dia) === diaFecha) {
			ban = true;
			return ban;
		}
	})
	var fechaBuscar = new Date(fecha);
	var fechaInhabil = DiasInhabiles.findOne({ tipo: "FECHA", fecha: fechaBuscar, estatus: true });
	if (fechaInhabil != undefined) {
		ban = true;
		return ban;
	}
	return ban;
}



