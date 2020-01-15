Meteor.methods({
	getBeneficiario: function (id) {
		var beneficiario = Beneficiarios.findOne(id);
		return beneficiario;
	},
	getBeneficiarioNombre: function (id) {
		var beneficiario = Beneficiarios.findOne({ _id: id }, { fields: { nombreCompleto: 1 } });
		return beneficiario;
	},
	validaLimiteSaldoBeneficiarioDistribuidor: function (vale) {

		var result = {};

		result.beneficiario = false;
		result.distribuidor = false;

		var beneficiario = Beneficiarios.findOne(vale.beneficiario_id);
		var distribuidor = Meteor.users.findOne({ _id: vale.cliente_id }, { fields: { "profile.limiteCredito": 1, "profile.saldoCredito": 1 } });

		var configuraciones = Configuraciones.findOne();

		//console.log("dis:", distribuidor);
		//console.log("Capital Solicitado", vale.capitalSolicitado);
		//console.log("limite Credito Distribuidor", distribuidor.profile.limiteCredito);
		//console.log("Saldo Distribuidor", distribuidor.profile.saldoCredito);
		//console.log("ben:", beneficiario);


		if ((beneficiario.saldoActual + vale.capitalSolicitado) <= configuraciones.limiteVale)
			result.beneficiario = true;

		//if ( (distribuidor.profile.saldoCredito + vale.capitalSolicitado) <= distribuidor.profile.limiteCredito )
		if (Number(vale.capitalSolicitado) <= distribuidor.profile.saldoCredito)
			result.distribuidor = true;

		return result;
	},
	getBitacoraLimiteCreditoDistribuidor: function (id) {
		var arreglo = BitacoraLimitesCredito.find({ distribuidor_id: id }).fetch();
		_.each(arreglo, function (b) {
			var usuario = Meteor.users.findOne(b.usuario_id);
			b.usuario = usuario.profile.nombre;
		});
		return arreglo;
	},
	setBitacoraLimiteCreditoDistribuidor: function (objeto) {

		Meteor.users.update({ _id: objeto.distribuidor_id }, {
			$set: {
				"profile.limiteCredito": objeto.limiteCredito,
				"profile.saldoCredito": objeto.saldoCredito,
			}
		});
		BitacoraLimitesCredito.insert(objeto);

		return true;
	},
	//Metodo que valida si existe el nombre del beneficiario
	getEstaBeneficiario: function (nombre) {
		var objeto = Beneficiarios.findOne({ nombreCompleto: nombre });
		var result = {};

		if (objeto == undefined) {
			result.estatus = false;
		}
		else {
			result.estatus = true;
			result.distribuidor = {};
			var d = Meteor.users.findOne({_id: objeto.distribuidor_id});
			result.distribuidor = d.profile.nombreCompleto;
		}
		return result;
	}
});