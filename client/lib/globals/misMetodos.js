
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

window.formatDate = function(date) {
	date = new Date(date);

		var monthNames = [
			"Enero", "Febrero", "Marzo",
			"Abril", "Mayo", "Junio", "Julio",
			"Agosto", "Septiembre", "Octubre",
			"Noviembre", "Diciembre"
		];
		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();

		return day + ' ' + 'de ' + monthNames[monthIndex] + ' de'  + ' ' + year;
};

//Funcion que regresa el arreglo para un paginador
window.arregloPaginador = function (tam, total) {
	var incremento = 0;
	var arregloMostrar = [];
	for (let index = 1; index <= total; index++) {
		if (index > 5 && arregloMostrar.filter(x => x.numero == "...").length == 0)
			arregloMostrar.push({ numero: "...", avance: -1 });
		else if (arregloMostrar.filter(x => x.numero == "...").length == 0)
			arregloMostrar.push({ numero: index, avance: incremento, estaActivo: false });
		incremento += tam;
	}
	return arregloMostrar;
}



