Meteor.methods({
	sendEmail: function (to, from, subject, text) {
		this.unblock();
		Email.send({
		to: to,
		from: from,
		subject: subject,
		text: text
		});
	},	
	getSucursal: function (idReferencia) {
		var referencia = Sucursales.findOne(idReferencia);
		return referencia;
	},
	getHorario: function (sucursal_id) {
		var anio = 2000;
		var sucursal = Sucursales.findOne(sucursal_id);
        var fecha = new Date();
        var fechaFea = moment(sucursal.horaEntrada);
        actual = fechaFea.year(anio).month(0).day(1).hour(fecha.getHours()).minute(fecha.getMinutes());
        entrada = moment(sucursal.horaEntrada).year(anio).month(0).day(1);
        salida = moment(sucursal.horaSalida).year(anio).month(0).day(1);
        return !actual.isBefore(entrada) && actual.isBefore(salida)
	},
})