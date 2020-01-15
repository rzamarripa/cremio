Meteor.methods({
	getCobranza: function (fechaInicial, fechaFinal, op, sucursal_id) {

		var planPagos = {};

		if (op == 0)
			var planPagos = PlanPagos.find({ sucursal_id: sucursal_id, fechaLimite: { $lte: fechaFinal }, tipoCredito: "creditoP", importeRegular: { $gt: 0 }, estatus: { $in: [0, 2] } }).fetch();
		else if (op == 1)
			var planPagos = PlanPagos.find({ sucursal_id: sucursal_id, fechaLimite: { $gte: fechaInicial, $lte: fechaFinal }, tipoCredito: "creditoP", descripcion: "Recibo", estatus: { $in: [0, 2] } }).fetch();
		else
			var planPagos = PlanPagos.find({ sucursal_id: sucursal_id, fechaLimite: { $gte: fechaInicial, $lte: fechaFinal }, tipoCredito: "creditoP", estatus: { $in: [0, 2] } }).fetch();
		//console.log(planPagos);

		var hoy = new Date();
		var fechaActual = moment();

		_.each(planPagos, function (planPago) {
			var classPago = "";

			if (planPago.descripcion == "Cargo Moratorio") {
				classPago = "text-danger";
				planPago.orden = 2;
			}
			else
				planPago.orden = 1;



			if (planPago.importeRegular != 0) {

				var u = Meteor.users.findOne({ _id: planPago.cliente_id });
				var c = Creditos.findOne({ _id: planPago.credito_id });

				//planPago.cliente = u.profile.nombreCompleto;
				planPago.cliente = Meteor.users.findOne({ _id: planPago.cliente_id }, { fields: { "profile.documentos": 0 } });

				planPago.nombreCompleto = planPago.cliente != undefined ? planPago.cliente.profile.nombreCompleto : "";

				planPago.credito = Creditos.findOne({ _id: planPago.credito_id });

				planPago.imprimir = false;
				planPago.classPago = classPago;
				planPago.numeroPagos = c.numeroPagos;

			}

		});

		//return _.toArray(arreglo);
		return planPagos;
	},
	getCobranzaVales: function (fechaInicial, fechaFinal, op, sucursal_id) {

		function calculaBonificacion(fechaLimite) {

			var configuraciones = Configuraciones.findOne();

			var comisionMayor = 0;
			var comision = 0;

			_.each(configuraciones.arregloComisiones, function (c) {
				if (c.porcentaje > comisionMayor)
					comisionMayor = c.porcentaje;
			});

			var date = new Date();
			date.setHours(23, 59, 59);
			var fecha1 = moment(date);

			var fecha2 = moment(fechaLimite);

			var dias = fecha1.diff(fecha2, 'days');

			comision = comisionMayor;

			if (dias > 6) {
				comision = 0;
			}
			else if (dias <= 0) {
				//Comisión Mayor
				comision = comisionMayor;
			}
			else if (dias <= 6) {
				var fechaPago = new Date(fecha1);
				var nfp = fechaPago.getDate();
				var mesfp = fechaPago.getMonth();
				comision = 0;
				_.each(configuraciones.arregloComisiones, function (c) {
					if (c.valor1 == nfp || c.valor2 == nfp)
						comision = c.porcentaje;
				});
			}
			return comision;
		};

		var planPagos = {}; //importeRegular: {$gt:0},

		if (op == 0)
			var planPagos = PlanPagos.find({
				sucursal_id: sucursal_id,
				fechaLimite: { $lte: fechaFinal },
				tipoCredito: { $in: ["vale", "creditoPersonalDistribuidor"] },
				importeRegular: { $gt: 0 },
				estatus: { $in: [0, 2] }
			}).fetch();
		else if (op == 1)
			var planPagos = PlanPagos.find({
				sucursal_id: sucursal_id,
				fechaLimite: { $lte: fechaFinal },
				tipoCredito: { $in: ["vale", "creditoPersonalDistribuidor"] },
				importeRegular: { $gt: 0 },
				estatus: { $in: [0, 2] }
			}, { sort: { fechaLimite: 1, credito_id: 1, numeroPago: 1 } }).fetch();
		else
			var planPagos = PlanPagos.find({
				sucursal_id: sucursal_id,
				fechaLimite: { $lte: fechaFinal },
				tipoCredito: { $in: ["vale", "creditoPersonalDistribuidor"] },
				importeRegular: { $gt: 0 },
				estatus: { $in: [0, 2] }
			}, { sort: { fechaLimite: 1, credito_id: 1, numeroPago: 1 } }).fetch();

		var configuraciones = Configuraciones.findOne();

		var arreglo = {};
		var arregloCortes = {};
		var arregloSeguros = {};

		var hoy = new Date();
		var fechaActual = moment();


		_.each(planPagos, function (planPago) {

			var classPago = "";

			var credito = Creditos.findOne(planPago.credito_id);
			var distribuidor = Meteor.users.findOne({ _id: credito.cliente_id }, {
				fields: {
					"profile.numeroCliente": 1,
					"profile.nombreCompleto": 1,
					"profile.calle": 1,
					"profile.numero": 1,
					"profile.colonia_id": 1,
					"profile.municipio_id": 1,
					"profile.estado_id": 1,
					"profile.particular": 1,
					"profile.celular": 1,
					"profile.telefonoOficina": 1
				}
			});

			var colonia = Colonias.findOne({ _id: distribuidor.profile.colonia_id });
			distribuidor.profile.colonia = colonia.nombre;

			var municipio = Municipios.findOne({ _id: distribuidor.profile.municipio_id });
			distribuidor.profile.municipio = municipio.nombre;

			var estado = Estados.findOne({ _id: distribuidor.profile.estado_id });
			distribuidor.profile.estado = estado.nombre;

			planPago.numeroPagos = credito.numeroPagos;

			if (credito.tipo == "vale") {
				var comision = calculaBonificacion(planPago.fechaLimite);
				planPago.beneficiario = credito.beneficiario_id != undefined ? Beneficiarios.findOne(credito.beneficiario_id).nombreCompleto : "";
				planPago.bonificacion = 0;
				planPago.bonificacion = round(Number(parseFloat(((planPago.capital + planPago.interes) * (comision / 100))).toFixed(3)), 2);

			}
			else if (credito.tipo == "creditoPersonalDistribuidor") {
				planPago.beneficiario = "CRÉDITO PERSONAL";
				planPago.bonificacion = 0;
			}

			planPago.adeudoInicial = credito.adeudoInicial;
			planPago.saldoActual = credito.saldoActual;
			planPago.folio = credito.folio;

			if (arreglo[credito.cliente_id] == undefined) {
				arreglo[credito.cliente_id] = {};
				arreglo[credito.cliente_id].credito = credito;
				arreglo[credito.cliente_id].distribuidor = distribuidor;
				arreglo[credito.cliente_id].nombreCompleto = distribuidor.profile.nombreCompleto;
				arreglo[credito.cliente_id].numero = distribuidor.profile.numeroCliente;
				arreglo[credito.cliente_id].importe = 0.00;
				arreglo[credito.cliente_id].importeCreditoP = 0.00;
				arreglo[credito.cliente_id].cargosMoratorios = 0.00;
				arreglo[credito.cliente_id].bonificacion = 0.00;
				arreglo[credito.cliente_id].seguro = 0.00;

				arreglo[credito.cliente_id].bonificacion = planPago.bonificacion;

				if (planPago.descripcion == "Recibo" && planPago.tipoCredito == 'vale')
					arreglo[credito.cliente_id].importe = planPago.importeRegular;
				if (planPago.descripcion == "Recibo" && planPago.tipoCredito == 'creditoPersonalDistribuidor')
					arreglo[credito.cliente_id].importeCreditoP = planPago.importeRegular;
				else if (planPago.descripcion == "Cargo Moratorio") {
					arreglo[credito.cliente_id].cargosMoratorios = planPago.importeRegular;
					arreglo[credito.cliente_id].classPago = "text-danger";
				}


				//Meterlo al arreglo y luego al arregloCortes
				arreglo[credito.cliente_id].arreglo = {};

				var numeroCorte = 0;
				var fechaCorteInicio = "";
				var fechaCorteFin = "";
				if (planPago.fechaLimite.getDate() >= 15) {
					numeroCorte = planPago.fechaLimite.getMonth() * 2;
					fechaCorteInicio = new Date(planPago.fechaLimite.getFullYear(), planPago.fechaLimite.getMonth() - 1, 22);
					fechaCorteFin = new Date(planPago.fechaLimite.getFullYear(), planPago.fechaLimite.getMonth(), 06);
				}
				else {
					var m = planPago.fechaLimite.getMonth();
					if (m == 0) {
						numeroCorte = 12 * 2 - 1;
						fechaCorteInicio = new Date(planPago.fechaLimite.getFullYear(), 11, 07);
						fechaCorteFin = new Date(planPago.fechaLimite.getFullYear(), 11, 21);
					}
					else {
						numeroCorte = planPago.fechaLimite.getMonth() * 2 - 1;
						fechaCorteInicio = new Date(planPago.fechaLimite.getFullYear(), planPago.fechaLimite.getMonth() - 1, 07);
						fechaCorteFin = new Date(planPago.fechaLimite.getFullYear(), planPago.fechaLimite.getMonth() - 1, 21);
					}
				}

				if (arreglo[credito.cliente_id].arreglo[numeroCorte] == undefined) {

					//Revisar si ya pago el seguro----------------------

					var seguro = 0;
					var pagosSeguro = PagosSeguro.find({ distribuidor_id: credito.cliente_id, corte: numeroCorte, estatus: 1 });

					if (pagosSeguro.count() > 0)
						seguro = 0;
					else
						seguro = configuraciones.seguro;

					//---------------------------------------------------
					arreglo[credito.cliente_id].arreglo[numeroCorte] = {};

					arreglo[credito.cliente_id].arreglo[numeroCorte].seguro = seguro;

					arreglo[credito.cliente_id].seguro += seguro;

					arreglo[credito.cliente_id].arreglo[numeroCorte].numeroCorte = numeroCorte;
					arreglo[credito.cliente_id].arreglo[numeroCorte].fechaCorteInicio = fechaCorteInicio;
					arreglo[credito.cliente_id].arreglo[numeroCorte].fechaCorteFin = fechaCorteFin;
					arreglo[credito.cliente_id].arreglo[numeroCorte].fechaPago = planPago.fechaLimite;
					arreglo[credito.cliente_id].arreglo[numeroCorte].importe = 0;
					arreglo[credito.cliente_id].arreglo[numeroCorte].cargosMoratorios = 0;

					if (planPago.descripcion == 'Recibo')
						arreglo[credito.cliente_id].arreglo[numeroCorte].importe = planPago.importeRegular;
					else
						arreglo[credito.cliente_id].arreglo[numeroCorte].cargosMoratorios = planPago.importeRegular;

					arreglo[credito.cliente_id].arreglo[numeroCorte].bonificacion = Number(planPago.bonificacion);

					//arreglo[numeroCorte].fechaCorte = fechaCorte;
					arreglo[credito.cliente_id].arreglo[numeroCorte].planPagos = [];
					arreglo[credito.cliente_id].arreglo[numeroCorte].planPagos.push(planPago);
				}
				else {
					if (planPago.descripcion == 'Recibo')
						arreglo[credito.cliente_id].arreglo[numeroCorte].importe += round(Number(planPago.importeRegular).toFixed(3), 2);
					else
						arreglo[credito.cliente_id].arreglo[numeroCorte].cargosMoratorios += round(Number(planPago.importeRegular).toFixed(3), 2);

					arreglo[credito.cliente_id].arreglo[numeroCorte].bonificacion += round(Number(planPago.bonificacion).toFixed(3), 2);
					arreglo[credito.cliente_id].arreglo[numeroCorte].planPagos.push(planPago);
				}

				//---------------------------------------------------
				arreglo[credito.cliente_id].planPagos = [];
				arreglo[credito.cliente_id].planPagos.push(planPago);
			}
			else {

				if (planPago.descripcion == "Recibo" && planPago.tipoCredito == 'vale')
					arreglo[credito.cliente_id].importe += round(Number(planPago.importeRegular).toFixed(3), 2);
				if (planPago.descripcion == "Recibo" && planPago.tipoCredito == 'creditoPersonalDistribuidor')
					arreglo[credito.cliente_id].importeCreditoP += round(Number(planPago.importeRegular).toFixed(3), 2);
				else if (planPago.descripcion == "Cargo Moratorio") {
					arreglo[credito.cliente_id].cargosMoratorios += round(Number(planPago.importeRegular).toFixed(3), 2);
					arreglo[credito.cliente_id].classPago = "text-danger";
				}


				arreglo[credito.cliente_id].bonificacion += round(Number(planPago.bonificacion).toFixed(3), 2);

				var numeroCorte = 0;
				var fechaCorteInicio = "";
				var fechaCorteFin = "";
				if (planPago.fechaLimite.getDate() >= 15) {
					numeroCorte = planPago.fechaLimite.getMonth() * 2;
					fechaCorteInicio = new Date(planPago.fechaLimite.getFullYear(), planPago.fechaLimite.getMonth() - 1, 22);
					fechaCorteFin = new Date(planPago.fechaLimite.getFullYear(), planPago.fechaLimite.getMonth(), 06);
				}
				else {
					var m = planPago.fechaLimite.getMonth();
					if (m == 0) {
						numeroCorte = 12 * 2 - 1;
						fechaCorteInicio = new Date(planPago.fechaLimite.getFullYear(), 11, 07);
						fechaCorteFin = new Date(planPago.fechaLimite.getFullYear(), 11, 21);
					}
					else {
						numeroCorte = planPago.fechaLimite.getMonth() * 2 - 1;
						fechaCorteInicio = new Date(planPago.fechaLimite.getFullYear(), planPago.fechaLimite.getMonth() - 1, 07);
						fechaCorteFin = new Date(planPago.fechaLimite.getFullYear(), planPago.fechaLimite.getMonth() - 1, 21);
					}

				}

				if (arreglo[credito.cliente_id].arreglo[numeroCorte] == undefined) {

					var seguro = 0;
					var pagosSeguro = PagosSeguro.find({ distribuidor_id: credito.cliente_id, corte: numeroCorte, estatus: 1 });

					if (pagosSeguro.count() > 0)
						seguro = 0;
					else
						seguro = configuraciones.seguro;


					arreglo[credito.cliente_id].arreglo[numeroCorte] = {};

					arreglo[credito.cliente_id].arreglo[numeroCorte].seguro = seguro;
					arreglo[credito.cliente_id].seguro += seguro;

					arreglo[credito.cliente_id].arreglo[numeroCorte].numeroCorte = numeroCorte;
					arreglo[credito.cliente_id].arreglo[numeroCorte].fechaCorteInicio = fechaCorteInicio;
					arreglo[credito.cliente_id].arreglo[numeroCorte].fechaCorteFin = fechaCorteFin;
					arreglo[credito.cliente_id].arreglo[numeroCorte].fechaPago = planPago.fechaLimite;
					arreglo[credito.cliente_id].arreglo[numeroCorte].importe = 0;
					arreglo[credito.cliente_id].arreglo[numeroCorte].cargosMoratorios = 0;

					if (planPago.descripcion == 'Recibo')
						arreglo[credito.cliente_id].arreglo[numeroCorte].importe = round(Number(planPago.importeRegular).toFixed(3), 2);
					else
						arreglo[credito.cliente_id].arreglo[numeroCorte].cargosMoratorios = round(Number(planPago.importeRegular).toFixed(3), 2);

					arreglo[credito.cliente_id].arreglo[numeroCorte].bonificacion = round(Number(planPago.bonificacion).toFixed(3), 2);

					//arreglo[numeroCorte].fechaCorte = fechaCorte;
					arreglo[credito.cliente_id].arreglo[numeroCorte].planPagos = [];
					arreglo[credito.cliente_id].arreglo[numeroCorte].planPagos.push(planPago);
				}
				else {
					if (planPago.descripcion == 'Recibo')
						arreglo[credito.cliente_id].arreglo[numeroCorte].importe += round(Number(planPago.importeRegular).toFixed(3), 2);
					else
						arreglo[credito.cliente_id].arreglo[numeroCorte].cargosMoratorios += round(Number(planPago.importeRegular).toFixed(3), 2);

					arreglo[credito.cliente_id].arreglo[numeroCorte].bonificacion += round(Number(planPago.bonificacion).toFixed(3), 2);
					arreglo[credito.cliente_id].arreglo[numeroCorte].planPagos.push(planPago);
				}

				//---------------------------------------------------				 			

				arreglo[credito.cliente_id].planPagos.push(planPago);
			}

		});

		return _.toArray(arreglo);
	},
	getPlanPagosDistribuidorTickets: function (fechaInicial, fechaFinal, distribuidor_id) {


		function calculaBonificacion(fechaLimite) {

			var date = new Date();
			date.setHours(23, 59, 59);
			var fecha1 = moment(date);

			var fecha2 = moment(fechaLimite);

			var dias = fecha1.diff(fecha2, 'days');

			var comision = 15;

			if (dias > 7) {
				comision = 0;
			}
			else if (dias < 0) {
				comision = 15;
			}
			else if (dias <= 7) {

				var fechaPago = new Date(fecha1);

				var nfp = fechaPago.getDate();
				var mesfp = fechaPago.getMonth();
				switch (nfp) {
					case 1: comision = 15; break;
					case 2: comision = 15; break;
					case 3: comision = 15; break;
					case 4: comision = 14; break;
					case 5: comision = 13; break;
					case 6: comision = 9; break;
					case 7: comision = 7; break;
					case 16: comision = 15; break;
					case 17: comision = 15; break;
					case 18: comision = 15; break;
					case 19: comision = 14; break;
					case 20: comision = 13; break;
					case 21: comision = 9; break;
					case 22: comision = 7; break;
					default: comision = 0;
				}

			}

			return comision;
		};

		var planPagos = {};

		var planPagos = PlanPagos.find({
			cliente_id: distribuidor_id,
			fechaLimite: { $lte: fechaFinal },
			tipoCredito: "vale",
			estatus: { $in: [0, 2] }
		}, { sort: { fechaLimite: 1 } }).fetch();

		var configuraciones = Configuraciones.findOne();

		var arreglo = {};
		var saldos = {};

		var planPagosDistribuidor = [];

		var hoy = new Date();
		var fechaActual = moment();

		_.each(planPagos, function (planPago) {
			var classPago = "";

			var credito = Creditos.findOne(planPago.credito_id);

			if (credito.cliente_id == distribuidor_id && planPago.descripcion != "Cargo Moratorio") {

				var distribuidor = Meteor.users.findOne({ _id: credito.cliente_id }, { fields: { "profile.numeroCliente": 1, "profile.nombreCompleto": 1 } });

				planPago.numeroPagos = credito.numeroPagos;
				planPago.beneficiario = credito.beneficiario_id != undefined ? Beneficiarios.findOne(credito.beneficiario_id).nombreCompleto : "";

				var comision = calculaBonificacion(planPago.fechaLimite);

				planPago.bonificacion = Number(parseFloat(((planPago.importeRegular) * (comision / 100))).toFixed(2));

				planPago.adeudoInicial = credito.adeudoInicial;
				planPago.folio = credito.folio;
				planPago.distribuidor = distribuidor.profile.nombreCompleto;

				if (saldos[planPago.folio] == undefined) {
					saldos[planPago.folio] = credito.saldoActual - planPago.importeRegular;
				}
				else {
					saldos[planPago.folio] = Number(parseFloat(saldos[planPago.folio] - planPago.importeRegular).toFixed(2));
				}

				planPago.saldoActual = Number(parseFloat(saldos[planPago.folio]).toFixed(2));

				if (planPago.descripcion != "Cargo Moratorio")
					planPagosDistribuidor.push(planPago);
			}
		});

		//return _.toArray(arreglo);
		return planPagosDistribuidor;
	},
	getPersona: function (idPersona, idCliente) {

		var persona = Personas.findOne(idPersona);

		var p = {};

		if (persona != undefined && persona.relaciones !== undefined) {
			_.each(persona.relaciones, function (relacion) {
				if (relacion.cliente_id == idCliente) {

					p = relacion;
					p.nombre = persona.nombre;
					p.apellidoPaterno = persona.apellidoPaterno;
					p.apellidoMaterno = persona.apellidoMaterno;
					p.nombreCompleto = persona.nombreCompleto;
				}
			});
			return p;
		}

	},
	getcobranzaNombre: function (nombre) {

		var arreglo = {};

		//Ir por los clientes
		let selector = {
			"profile.nombreCompleto": { '$regex': '.*' + nombre || '' + '.*', '$options': 'i' },
			roles: ["Cliente"]
		}
		var clientes = Meteor.users.find(selector).fetch();
		var clientes_ids = _.pluck(clientes, "_id");


		//Ir por los creditos
		var creditos = Creditos.find({ cliente_id: { $in: clientes_ids } }).fetch(); //estatus 2 creditos autorizados
		var creditos_ids = _.pluck(creditos, '_id'); // [45, 3]


		//Ir por los pagos que ha hecho
		var planPagos = PlanPagos.find({ credito_id: { $in: creditos_ids }, estatus: { $ne: 1 } }).fetch();

		var hoy = new Date();
		var fechaActual = moment();

		_.each(planPagos, function (planPago) {
			var classPago = "";

			if (planPago.descripcion == "Cargo Moratorio")
				classPago = "text-danger";

			if (planPago.importeRegular != 0) {

				var u = Meteor.users.findOne({ _id: planPago.cliente_id });
				var c = Creditos.findOne({ _id: planPago.credito_id });

				//planPago.cliente = u.profile.nombreCompleto;
				planPago.cliente = Meteor.users.findOne({ _id: planPago.cliente_id });
				planPago.credito = Creditos.findOne({ _id: planPago.credito_id });

				planPago.imprimir = false;
				planPago.classPago = classPago;
				planPago.numeroPagos = c.numeroPagos;

			}

		});

		return planPagos;

	},
	gethistorialPago: function (credito_id) {
		var arreglo = [];

		var saldoPago = 0;
		var saldoActual = 0;
		var saldoMultas = 0;

		//console.log(credito_id);			

		var credito = Creditos.findOne({ _id: credito_id });
		var planPagos = PlanPagos.find({ credito_id: credito_id }, { sort: { numeroPago: 1, descripcion: -1 } }).fetch();

		//console.log(planPagos);

		var saldo = 0;
		//try{ saldo = credito.numeroPago*pagos[0].cargo;} catch(ex){console.log("aqui",pagos)}
		//console.log("credito",credito);
		_.each(planPagos, function (planPago) {
			if (planPago.descripcion == "Recibo")
				saldo += planPago.cargo;
			if (planPago.descripcion == "Cargo Moratorio")
				saldoMultas += planPago.importeRegular;
		});
		_.each(planPagos, function (planPago, index) {


			if (planPago.descripcion == "Cargo Moratorio")
				saldo += planPago.cargo

			fechaini = planPago.fechaPago ? planPago.fechaPago : planPago.fechaLimite
			//console.log(fechaini,planPago.fechaPago,planPago.fechaLimite)
			arreglo.push({
				saldo: saldo,
				numeroPago: planPago.numeroPago,
				cantidad: credito.numeroPagos,
				fechaSolicito: credito.fechaSolicito,
				fecha: fechaini,
				pago: 0,
				cargo: planPago.cargo,
				movimiento: planPago.movimiento,
				planPago_id: planPago._id,
				credito_id: planPago.credito_id,
				descripcion: planPago.descripcion,
				importe: planPago.importeRegular,
				pagos: planPago.pagos,
				iva: planPago.iva,
				interes: planPago.interes,
				abono: planPago.abono,
			});


			if (planPago.pagos.length > 0)
				_.each(planPago.pagos, function (pago) {
					saldo -= pago.totalPago
					arreglo.push({
						saldo: saldo,
						numeroPago: planPago.numeroPago,
						cantidad: credito.numeroPagos,
						fechaSolicito: credito.fechaSolicito,
						fecha: pago.fechaPago,
						pago: pago.totalPago,
						cargo: 0,
						movimiento: planPago.descripcion == "Cargo Moratorio" ? "Abono de Multa" : "Abono",
						planPago_id: planPago._id,
						credito_id: planPago.credito_id,
						descripcion: planPago.descripcion == "Cargo Moratorio" ? "Abono de Multa" : "Abono",
						importe: planPago.importeRegular,
						pagos: planPago.pagos,

					});
				})
			//console.log(rc.saldo)
		});


		return arreglo;

	},
	getreportesPagos: function (credito_id) {
		var arreglo = [];

		var saldoPago = 0;
		var saldoActual = 0;
		var saldoMultas = 0;

		//console.log(credito_id);			

		var credito = Creditos.findOne({ _id: credito_id });
		var planPagos = PlanPagos.find({ credito_id: credito_id }, { sort: { numeroPago: 1, descripcion: -1 } }).fetch();

		//console.log(planPagos);

		var saldo = 0;
		//try{ saldo = credito.numeroPago*pagos[0].cargo;} catch(ex){console.log("aqui",pagos)}
		//console.log("credito",credito);
		_.each(planPagos, function (planPago) {
			if (planPago.descripcion == "Recibo")
				saldo += planPago.cargo;
			if (planPago.descripcion == "Cargo Moratorio")
				saldoMultas += planPago.importeRegular;
		});
		_.each(planPagos, function (planPago, index) {


			if (planPago.descripcion == "Cargo Moratorio")
				saldo += planPago.cargo

			fechaini = planPago.fechaPago ? planPago.fechaPago : planPago.fechaLimite
			//console.log(fechaini,planPago.fechaPago,planPago.fechaLimite)
			arreglo.push({
				saldo: saldo,
				numeroPago: planPago.numeroPago,
				cantidad: credito.numeroPagos,
				fechaSolicito: credito.fechaSolicito,
				fecha: fechaini,
				pago: 0,
				cargo: planPago.cargo,
				movimiento: planPago.movimiento,
				planPago_id: planPago._id,
				credito_id: planPago.credito_id,
				descripcion: planPago.descripcion,
				importe: planPago.importeRegular,
				pagos: planPago.pagos,
				iva: planPago.iva,
				interes: planPago.interes,
				abono: planPago.abono,
			});




		});


		return arreglo;

	},
	getClienteInformacion: function (cliente) {

		var persona = cliente

		if (persona.profile.estadoCivil_id != undefined)
			persona.profile.estadoCivil = EstadoCivil.findOne(persona.profile.estadoCivil_id);
		else
			persona.profile.estadoCivil = "";

		if (persona.profile.nacionalidad_id != undefined)
			persona.profile.nacionalidad = Nacionalidades.findOne(persona.profile.nacionalidad_id);
		else
			persona.profile.nacionalidad = "";

		if (persona.profile.colonia_id != undefined)
			persona.profile.colonia = Colonias.findOne(persona.profile.colonia_id);
		else
			persona.profile.colonia = "";

		if (persona.profile.estado_id != undefined)
			persona.profile.estado = Estados.findOne(persona.profile.estado_id);
		else
			persona.profile.estado = "";

		if (persona.profile.municipio_id != undefined)
			persona.profile.municipio = Municipios.findOne(persona.profile.municipio_id);
		else
			persona.profile.municipio = "";

		if (persona.profile.ocupacion_id != undefined)
			persona.profile.ocupacion = Ocupaciones.findOne(persona.profile.ocupacion_id);
		else
			persona.profile.ocupacion = "";

		if (persona.profile.estado_id != undefined)
			persona.profile.estado = Estados.findOne(persona.profile.estado_id);
		else
			persona.profile.estado = "";

		if (persona.profile.ciudad_id != undefined)
			persona.profile.ciudad = Ciudades.findOne(persona.profile.ciudad_id);
		else
			persona.profile.ciudad = "";

		if (persona.profile.pais_id != undefined)
			persona.profile.pais = Paises.findOne(persona.profile.pais_id);
		else
			persona.profile.pais = "";

		if (persona.profile.empresa_id != undefined)
			persona.profile.empresa = Empresas.findOne(persona.profile.empresa_id);
		else
			persona.profile.empresa = "";

		if (persona.profile.empresa.colonia_id != undefined)
			persona.profile.empresa.coloniaEmpresa = Colonias.findOne(persona.profile.empresa.colonia_id).nombre;
		else
			persona.profile.empresa.coloniaEmpresa = "";

		if (persona.profile.empresa.estado_id != undefined)
			persona.profile.empresa.estadoEmpresa = Estados.findOne(persona.profile.empresa.estado_id).nombre;
		else
			persona.profile.empresa.estadoEmpresa = "";

		if (persona.profile.empresa.municipio_id != undefined)
			persona.profile.empresa.municipioEmpresa = Municipios.findOne(persona.profile.empresa.municipio_id).nombre;
		else
			persona.profile.empresa.municipioEmpresa = "";

		if (persona.profile.empresa.ciudad_id != undefined)
			persona.profile.empresa.ciudadEmpresa = Ciudades.findOne(persona.profile.empresa.ciudad_id).nombre;
		else
			persona.profile.empresa.ciudadEmpresa = "";

		if (persona.profile.empresa.pais_id != undefined)
			persona.profile.empresa.paisEmpresa = Paises.findOne(persona.profile.empresa.pais_id).nombre;
		else
			persona.profile.empresa.paisEmpresa = "";


		//persona.profile.estadoCivil = EstadoCivil.findOne(persona.profile.estadoCivil_id);

		return persona;

	},
	getEmpresaInfo: function (empresa) {

		var emp = Empresas.findOne(empresa);

		if (emp != undefined) {

			if (emp.colonia_id != undefined)
				emp.coloniaEmpresa = Colonias.findOne(emp.colonia_id).nombre;
			else
				emp.coloniaEmpresa = "";

			if (emp.estado_id != undefined)
				emp.estadoEmpresa = Estados.findOne(emp.estado_id).nombre;
			else
				emp.estadoEmpresa = "";

			if (emp.municipio_id != undefined)
				emp.municipioEmpresa = Municipios.findOne(emp.municipio_id).nombre;
			else
				emp.municipioEmpresa = "";

			if (emp.ciudad_id != undefined)
				emp.ciudadEmpresa = Ciudades.findOne(emp.ciudad_id).nombre;
			else
				emp.ciudadEmpresa = "";

			if (emp.pais_id != undefined)
				emp.paisEmpresa = Paises.findOne(emp.pais_id).nombre;
			else
				emp.paisEmpresa = "";


			return emp;
		}


		return "";
	},

	/////////////////////////////////////////////////////////////////////////////////////////
	getNotificacionJudicial: function (objeto, cliente) {
		//console.log(objeto,"recordatori")
		// var produccion = "/home/cremio/archivos/";

		function formatDate(date) {
			date = new Date(date);
			var monthNames = [
				"ENERO", "FEBRERO", "MARZO",
				"ABRIL", "MAYO", "JUNIO", "JULIO",
				"AGOSTO", "SEPTIEMBRE", "OCTUBRE",
				"NOVIEMBRE", "DICIEMBRE"
			];
			var day = date.getDate();
			var monthIndex = date.getMonth();
			var year = date.getFullYear();

			return day + ' ' + 'DE ' + monthNames[monthIndex] + ' DE' + ' ' + year;
		}


		var fs = require('fs');
		var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		const formatCurrency = require('format-currency');

		var meteor_root = require('fs').realpathSync(process.cwd() + '/../');
		////var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";

		if (Meteor.isDevelopment) {
			var path = require('path');
			var publicPath = path.resolve('.').split('.meteor')[0];
			var produccion = publicPath + "public/plantillas/";
			var produccionSalida = publicPath + "public/generados/";
		} else {
			var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
			var produccion = publicPath + "/plantillas/";
			var produccionSalida = "/home/cremio/archivos/";
		}

		var content = fs.readFileSync(produccion + "REQUERIMIENTO.docx", "binary");


		var zip = new JSZip(content);
		var doc = new Docxtemplater()
			.loadZip(zip)

		var fecha = new Date();
		fecha = formatDate(fecha);



		var valores = (parseFloat(objeto.saldoActual).toFixed(2)).toString().split('.');
		var enteroActual = valores[0];
		var centavosActual = valores[1];

		//var enteroActual= formatCurrency(enteroActual);
		var saldoActual = formatCurrency(objeto.saldoActual);
		var intereses = formatCurrency(objeto.saldoMultas);
		var suma = formatCurrency(Number(objeto.saldoActual + objeto.saldoMultas));

		var colonia = Colonias.findOne(cliente.colonia_id).nombre;

		doc.setData({
			fecha: fecha,
			nombreCompleto: cliente.nombreCompleto,
			calle: cliente.calle,
			numero: cliente.numero,
			codigoPostal: cliente.codigoPostal,
			colonia: colonia,
			enteroActual: enteroActual,
			centavosActual: centavosActual,
			saldoActual: saldoActual,
			intereses: intereses,
			suma: suma
		});


		doc.render();

		var buf = doc.getZip()
			.generate({ type: "nodebuffer" });

		fs.writeFileSync(produccionSalida + "REQUERIMIENTOSalida.docx", buf);

		//Pasar a base64
		// read binary data
		var bitmap = fs.readFileSync(produccionSalida + "REQUERIMIENTOSalida.docx");

		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString('base64');


	},
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	getcitatorio: function (objeto, cliente) {

		function formatDate(date) {
			date = new Date(date);
			var monthNames = [
				"ENERO", "FEBRERO", "MARZO",
				"ABRIL", "MAYO", "JUNIO", "JULIO",
				"AGOSTO", "SEPTIEMBRE", "OCTUBRE",
				"NOVIEMBRE", "DICIEMBRE"
			];
			var day = date.getDate();
			var monthIndex = date.getMonth();
			var year = date.getFullYear();

			return day + ' ' + 'DE ' + monthNames[monthIndex] + ' DE' + ' ' + year;
		}


		var fs = require('fs');
		var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		const formatCurrency = require('format-currency');
		var meteor_root = require('fs').realpathSync(process.cwd() + '/../');
		////var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";

		if (Meteor.isDevelopment) {
			var path = require('path');
			var publicPath = path.resolve('.').split('.meteor')[0];
			var produccion = publicPath + "public/plantillas/";
			var produccionSalida = publicPath + "public/generados/";
		} else {
			var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
			var produccion = publicPath + "/plantillas/";
			var produccionSalida = "/home/cremio/archivos/";
		}

		var content = fs.readFileSync(produccion + "CITATORIOEXTRAJUDICIAL.docx", "binary");


		var zip = new JSZip(content);
		var doc = new Docxtemplater()
			.loadZip(zip)


		var fecha = new Date();

		var siguiente = moment(fecha);
		var fechaSiguiente = formatDate(new Date(siguiente.add(1, 'days')));

		fecha = formatDate(fecha);



		var valores = (parseFloat(objeto.saldoActual).toFixed(2)).toString().split('.');
		var enteroActual = valores[0];
		var centavosActual = valores[1];

		//var enteroActual= formatCurrency(enteroActual);
		var saldoActual = formatCurrency(objeto.saldoActual);
		var intereses = formatCurrency(objeto.saldoMultas);
		var suma = formatCurrency(Number(objeto.saldoActual + objeto.saldoMultas));

		var colonia = Colonias.findOne(cliente.colonia_id).nombre;

		doc.setData({
			fecha: fecha,
			fechaSiguiente: fechaSiguiente,
			nombreCompleto: cliente.nombreCompleto,
			calle: cliente.calle,
			numero: cliente.numero,
			codigoPostal: cliente.codigoPostal,
			colonia: colonia,
			enteroActual: enteroActual,
			centavosActual: centavosActual,
			saldoActual: saldoActual,
			intereses: intereses,
			suma: suma
		});


		doc.render();

		var buf = doc.getZip()
			.generate({ type: "nodebuffer" });

		fs.writeFileSync(produccionSalida + "CITATORIOEXTRAJUDICIALSalida.docx", buf);

		//Pasar a base64
		// read binary data
		var bitmap = fs.readFileSync(produccionSalida + "CITATORIOEXTRAJUDICIALSalida.docx");

		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString('base64');


	},
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////5
	getcartaCertificacionPatrimonial: function (objeto, cliente) {
		//console.log(objeto,"certificacionPatrimonial")

		function formatDate(date) {
			date = new Date(date);
			var monthNames = [
				"ENERO", "FEBRERO", "MARZO",
				"ABRIL", "MAYO", "JUNIO", "JULIO",
				"AGOSTO", "SEPTIEMBRE", "OCTUBRE",
				"NOVIEMBRE", "DICIEMBRE"
			];
			var day = date.getDate();
			var monthIndex = date.getMonth();
			var year = date.getFullYear();

			return day + ' ' + 'DE ' + monthNames[monthIndex] + ' DE' + ' ' + year;
		}


		var fs = require('fs');
		var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		const formatCurrency = require('format-currency');
		var meteor_root = require('fs').realpathSync(process.cwd() + '/../');

		if (Meteor.isDevelopment) {
			var path = require('path');
			var publicPath = path.resolve('.').split('.meteor')[0];
			var produccion = publicPath + "public/plantillas/";
			var produccionSalida = publicPath + "public/generados/";
		} else {
			var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
			var produccion = publicPath + "/plantillas/";
			var produccionSalida = "/home/cremio/archivos/";
		}


		var content = fs.readFileSync(produccion + "CERTIFICACIONPATRIMONIAL.docx", "binary");


		var zip = new JSZip(content);
		var doc = new Docxtemplater()
			.loadZip(zip)



		var fecha = new Date();

		var siguiente = moment(fecha);
		var fechaSiguiente = formatDate(new Date(siguiente.add(1, 'days')));

		fecha = formatDate(fecha);



		var valores = (parseFloat(objeto.saldoActual).toFixed(2)).toString().split('.');
		var enteroActual = valores[0];
		var centavosActual = valores[1];

		var saldoActual = formatCurrency(objeto.saldoActual);
		var intereses = formatCurrency(objeto.saldoMultas);
		var suma = formatCurrency(Number(objeto.saldoActual + objeto.saldoMultas));

		var colonia = Colonias.findOne(cliente.colonia_id).nombre;

		var respaldos = [];

		_.each(objeto.garantias, function (garantia) {
			respaldos.push({ nombre: garantia.descripcion, caracteristicas: garantia.caracteristicas });
		});


		doc.setData({
			fecha: fecha,
			fechaSiguiente: fechaSiguiente,
			nombreCompleto: cliente.nombreCompleto,
			calle: cliente.calle,
			numero: cliente.numero,
			codigoPostal: cliente.codigoPostal,
			colonia: colonia,
			enteroActual: enteroActual,
			centavosActual: centavosActual,
			saldoActual: saldoActual,
			intereses: intereses,
			suma: suma,
			respaldos: respaldos
		});

		doc.render();

		var buf = doc.getZip()
			.generate({ type: "nodebuffer" });

		fs.writeFileSync(produccionSalida + "CERTIFICACIONPATRIMONIALSalida.docx", buf);

		//Pasar a base64
		// read binary data
		var bitmap = fs.readFileSync(produccionSalida + "CERTIFICACIONPATRIMONIALSalida.docx");

		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString('base64');

	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////////

});

function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}	