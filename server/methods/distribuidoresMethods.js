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
		var arreglo = BitacoraLimitesCredito.find({ distribuidor_id: id }, { sort: { fecha: -1 } }).fetch();
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
			var d = Meteor.users.findOne({ _id: objeto.distribuidor_id });
			result.distribuidor = d.profile.nombreCompleto;
		}
		return result;
	},
	//Metodo que bloquea un beneficiario
	setBloquearBeneficiario: function (id, motivo, estatus) {

		Beneficiarios.update({ _id: id }, { $set: { estatus: estatus } });
		MotivosBloqueosBeneficiarios.insert({ movimiento: estatus, beneficiario_id: id, motivo: motivo, usuario_id: Meteor.userId(), fecha: new Date() });
		return true;
	},
	getBitacoraActivarDesactivar: function (id) {
		var arreglo = MotivosBloqueosBeneficiarios.find({ beneficiario_id: id }).fetch();
		if (arreglo != undefined) {
			_.each(arreglo, function (item) {
				var usuario = Meteor.users.findOne(item.usuario_id);
				item.usuario = usuario.profile.nombre;
			})
		}
		return arreglo;
	},
	getValidaProspecto: function (nombre) {
		var arreglo = Prospectos.find({ nombreCompleto: nombre }).fetch();
		if (arreglo != undefined && arreglo.length > 0) {
			return true;
		}
		return false;
	},
	getValidaBeneficiario: function (nombre) {
		var arreglo = Beneficiarios.find({ nombreCompleto: nombre }).fetch();
		if (arreglo != undefined && arreglo.length > 0) {
			return true;
		}
		return false;
	},
	getEstadoCuenta: function (creditos_ids, distribuidor_id) {

		var configuraciones = Configuraciones.findOne();
		var planPagos = PlanPagos.find({ credito_id: { $in: creditos_ids }, importeRegular: { $gt: 0 } }, { sort: { fechaLimite: 1 } }).fetch();

		var resultado = {};

		resultado.cliente = {};
		resultado.corte = [];

		var arreglo = {};
		resultado.cliente = Meteor.users.findOne({ _id: distribuidor_id }, {
			fields: {
				"profile.nombreCompleto": 1,
				"profile.numeroCliente": 1,
				"profile.calle": 1,
				"profile.numero": 1,
				"profile.codigoPostal": 1,
				"profile.celular": 1,
				"profile.particular": 1,
				"profile.colonia_id": 1,
				"profile.limiteCredito": 1,
				"profile.saldoCredito": 1
			}
		});
		var colonia = Colonias.findOne(resultado.cliente.profile.colonia_id);
		resultado.cliente.profile.colonia = colonia.nombre;

		var configuraciones = Configuraciones.findOne();
		var seguro = configuraciones.seguro;

		_.each(planPagos, function (pp) {

			var credito = Creditos.findOne(pp.credito_id);

			pp.beneficiario = Beneficiarios.findOne(credito.beneficiario_id);


			if (credito.tipo == "vale") {
				var comision = 0;
				pp.bonificacion = 0;
				comision = calculaBonificacion(pp.fechaLimite, configuraciones.arregloComisiones);
				pp.bonificacion = parseFloat(((pp.capital + pp.interes) * (comision / 100))).toFixed(2);
			}
			else if (credito.tipo == "creditoPersonalDistribuidor") {
				pp.bonificacion = 0;
				pp.beneficiario = {};
				pp.beneficiario.nombreCompleto = "CRÉDITO PERSONAL";
			}

			// if (pp.descripcion == 'Recibo')
			// 	importe += Number(parseFloat(pp.importeRegular).toFixed(2));
			// else if (pp.descripcion == 'Cargo Moratorio')
			// 	cargosMoratorios += Number(parseFloat(pp.importeRegular).toFixed(2));

			pp.numeroPagos = credito.numeroPagos;

			//Meterlo al arreglo y luego al arregloCortes
			var numeroCorte = 0;
			var fechaCorteInicio = "";
			var fechaCorteFin = "";

			if (pp.fechaLimite.getDate() >= 15) {
				numeroCorte = pp.fechaLimite.getMonth() * 2;
				fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 22);
				fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth(), 06);
			}
			else {
				var m = pp.fechaLimite.getMonth();
				if (m == 0) {
					numeroCorte = 12 * 2 - 1;
					fechaCorteInicio = new Date(pp.fechaLimite.getFullYear() - 1, 11, 07);
					fechaCorteFin = new Date(pp.fechaLimite.getFullYear() - 1, 11, 21);
				}
				else {
					numeroCorte = pp.fechaLimite.getMonth() * 2 - 1;
					fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 07);
					fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 21);
				}

			}

			if (arreglo[numeroCorte] == undefined) {
				arreglo[numeroCorte] = {};
				arreglo[numeroCorte].numeroCorte = numeroCorte;
				arreglo[numeroCorte].fechaCorteInicio = fechaCorteInicio;
				arreglo[numeroCorte].fechaCorteFin = fechaCorteFin;
				arreglo[numeroCorte].seguro = 0;

				var pagosSeguro = PagosSeguro.find({ distribuidor_id: distribuidor_id, anio: pp.fechaLimite.getFullYear(), numeroCorte: numeroCorte, estatus: 1 }).fetch();

				if (pagosSeguro.length == 0) {
					arreglo[numeroCorte].seguro = seguro;
				}

				arreglo[numeroCorte].fechaPago = pp.fechaLimite;

				arreglo[numeroCorte].importe = 0;
				arreglo[numeroCorte].cargosMoratorios = 0;

				if (pp.descripcion == 'Recibo')
					arreglo[numeroCorte].importe = pp.importeRegular;
				else
					arreglo[numeroCorte].cargosMoratorios = pp.importeRegular;

				arreglo[numeroCorte].bonificacion = Number(pp.bonificacion);
				arreglo[numeroCorte].planPagos = [];
				arreglo[numeroCorte].planPagos.push(pp);
			}
			else {
				if (pp.descripcion == 'Recibo')
					arreglo[numeroCorte].importe += pp.importeRegular;
				else
					arreglo[numeroCorte].cargosMoratorios += pp.importeRegular;

				arreglo[numeroCorte].bonificacion += Number(pp.bonificacion);
				arreglo[numeroCorte].planPagos.push(pp);
			}

		});

		resultado.corte = _.toArray(arreglo);

		resultado.corte.sort(function (a, b) {

			if (new Date(a.fechaCorteInicio).getTime() > new Date(b.fechaCorteInicio).getTime()) {
				return 1;
			}
			if (new Date(a.fechaCorteInicio).getTime() < new Date(b.fechaCorteInicio).getTime()) {
				return -1;
			}
			return 0;
		});

		return resultado;



	},
});

function calculaBonificacion(fechaLimite, arregloComisiones) {

	var comisionMayor = 0;
	var comision = 0;

	_.each(arregloComisiones, function (c) {
		if (c.porcentaje > comisionMayor)
			comisionMayor = c.porcentaje;
	});

	var date = new Date();
	date.setHours(23, 59, 59);
	var fecha1 = moment(date);

	var fecha2 = moment(fechaLimite);

	var dias = fecha1.diff(fecha2, 'days');


	if (dias > 6) {
		comision = 0;
	}
	else if (dias <= 0) {
		comision = comisionMayor;
	}
	else if (dias <= 6) {

		var fechaPago = new Date(fecha1);

		var nfp = fechaPago.getDate();
		var mesfp = fechaPago.getMonth();


		comision = 0;

		_.each(arregloComisiones, function (c) {
			if (c.valor1 == nfp || c.valor2 == nfp)
				comision = c.porcentaje;
		});
	}

	return comision;

};