Meteor.methods({

	getVerificacionesCredito: function (credito_id) {
		var verificaciones = Verificaciones.find({ credito_id: credito_id }).fetch();

		_.each(verificaciones, function (v) {
			var ver = Meteor.users.findOne(v.usuarioVerifico);
			//console.log(ver.profile.nombre)
			v.verifico = ver.profile.nombre;
		});

		return verificaciones;
	},

	getNumeroVerificacionesCredito: function (credito_id) {
		var verificaciones = Verificaciones.find({ credito_id: credito_id }).count();
		return verificaciones;
	},

	getNumeroVerificacionesDistribuidor: function (distribuidor_id) {
		var verificaciones = Verificaciones.find({ cliente_id: distribuidor_id }).count();
		return verificaciones;
	},

	getVerificacionesDistribuidor: function (id) {
		var verificaciones = Verificaciones.find({ cliente_id: id }).fetch();
		return verificaciones;
	},

	getVerificacionesProspectos: function (id) {
		var verificaciones = Verificaciones.find({ cliente_id: id }).fetch();
		return verificaciones;
	},

	finalizarVerificacionDistribuidor: function (id, objeto) {
		Meteor.users.update({ _id: id }, {
			$set: {
				"profile.estaVerificado": true,
				"profile.estatusCredito": 0,
				"profile.verificacionEstatus": objeto.evaluacion,
				"profile.indicacion": objeto.indicacion
			}
		});
		return true;
	},

	finalizarVerificacionProspectoDistribuidor: function (id, objeto) {
		ProspectosDistribuidor.update({ _id: id }, {
			$set: {
				"profile.estaVerificado": true,
				"profile.estatusCredito": 0,
				"profile.estatus": 3,
				"profile.verificacionEstatus": objeto.evaluacion,
				"profile.indicacion": objeto.indicacion
			}
		});
		return true;
	},

	finalizarVerificacionProspectoCreditoPersonal: function (id, objeto) {
		ProspectosCreditoPersonal.update({ _id: id }, {
			$set: {
				"profile.estaVerificado": true,
				"profile.estatus": 3,
				"profile.estatusCredito": 0,
				"profile.verificacionEstatus": objeto.evaluacion,
				"profile.indicacion": objeto.indicacion
			}
		});
		return true;
	},

	autorizaoRechazaDistribuidor: function (id, valor, motivo) {
		Meteor.users.update({ _id: id }, {
			$set: {
				"profile.estatusCredito": valor,
				"profile.motivo": motivo
			}
		});
	},

	cancelarVerificacionCredito: function (id) {
		Creditos.update({ _id: id }, { $set: { requiereVerificacion: false } });
		return true;
	},
	cancelarVerificacionDistribuidor: function (id) {
		Meteor.users.update({ _id: id }, { $set: { "profile.estaVerificado": true } });
		return true;
	},
	cancelarVerificacionProspectoCreditoPersonal: function (id) {
		ProspectosCreditoPersonal.update({ _id: id }, { $set: { "profile.estaVerificado": true, "profile.indicacion": "Verificación Cancelada", "profile.estatus": 3, "profile.verificacionEstatus": "Verificación Cancelada" } });
		return true;
	},
	cancelarVerificacionProspectoDistribuidor: function (id) {
		ProspectosDistribuidor.update({ _id: id }, { $set: { "profile.estaVerificado": true, "profile.indicacion": "Verificación Cancelada", "profile.estatus": 3, "profile.verificacionEstatus": "Verificación Cancelada" } });
		return true;
	},

});