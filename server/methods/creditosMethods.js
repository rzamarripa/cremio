Meteor.methods({
	generarCredito: function (credito, idCredito) {

		var c = Creditos.findOne({ _id: idCredito });

		c.fechaSolicito = credito.fechaSolicito;
		c.fechaPrimerAbono = credito.fechaPrimerAbono;

		var cliente = {};
		cliente._id = c.cliente_id;

		//genera el Plan de Pagos
		var planPagos = Meteor.call("generarPlanPagos", c, cliente);

		var saldoActual = 0;
		_.each(planPagos, function (pago) {
			saldoActual += Number(parseFloat(pago.cargo).toFixed(2));
		});
		c.numeroPagos = planPagos.length;
		c.saldoActual = Number(parseFloat(saldoActual).toFixed(2));
		c.adeudoInicial = Number(parseFloat(saldoActual).toFixed(2));

		var sucursal = {};
		//Folios-----------------------------------------------------
		if (credito.tipo == "creditoP") {
			sucursal = Sucursales.findOne({ _id: c.sucursal_id });

			if (sucursal.folioCredito != undefined)
				sucursal.folioCredito = sucursal.folioCredito + 1;
			else {
				sucursal.folioCredito = 0;
				sucursal.folioCredito = sucursal.folioCredito + 1;
			}

			c.folio = sucursal.folioCredito;
			Sucursales.update({ _id: sucursal._id }, { $set: { folioCredito: sucursal.folioCredito } });

		}
		else {
			//c.folio = credito.folio;

			sucursal = Sucursales.findOne({ _id: c.sucursal_id });

			if (sucursal.folioVale != undefined)
				sucursal.folioVale = sucursal.folioVale + 1;
			else {
				sucursal.folioVale = 0;
				sucursal.folioVale = sucursal.folioVale + 1;
			}

			c.folio = sucursal.folioVale;
			Sucursales.update({ _id: sucursal._id }, { $set: { folioVale: sucursal.folioVale } });

		}

		var idTemp = c._id;
		delete c._id;
		Creditos.update({ _id: idTemp }, { $set: c });


		//-----------------------------------------------------------//
		_.each(planPagos, function (pago) {
			delete pago.$$hashKey;
			pago.multa = 0;
			pago.abono = 0;
			pago.credito_id = idTemp;
			pago.descripcion = "Recibo";

			PlanPagos.insert(pago);
		});

		//Meteor.call("generarMultas");	//Duda
		return "hecho";
	},
	generarCreditoPeticion: function (credito) {

		if (credito.requiereVerificacion == true) {
			credito.estatus = 0;
		} else if (credito.requiereVerificacion == false) {
			credito.estatus = 1;
		}

		var sucursal = Sucursales.findOne({ _id: credito.sucursal_id });

		credito.avales_ids = [];

		_.each(credito.avales, function (aval) {
			if (aval.estatus == "N") aval.estatus = "G";
			credito.avales_ids.push({
				num: aval.num,
				aval_id: aval._id,
				nombreCompleto: aval.nombreCompleto,
				parentesco: aval.parentesco,
				tiempoConocerlo: aval.tiempoConocerlo,
				estatus: aval.estatus
			});
		});

		delete credito['avales'];
		var credito_id = Creditos.insert(credito);

		_.each(credito.avales_ids, function (aval) {
			var a = Avales.findOne(aval.aval_id);
			var cliente = Meteor.users.findOne(credito.cliente_id);


			a.profile.creditos = [];
			a.profile.creditos.push({
				credito_id: credito_id,
				folio: credito.folio,
				nombreCompleto: cliente.profile.nombreCompleto,
				parentesco: aval.parentesco,
				tiempoConocerlo: aval.tiempoConocerlo
			});
			var idTemp = a._id;
			delete a._id;
			Avales.update({ _id: idTemp }, { $set: { profile: a.profile } })
		});

		return "hecho";
	},
	actualizarCredito: function (credito, idCredito) {

		if (credito.tipo == 'creditoP') {
			if (credito.estatus == 1)
				if (credito.requiereVerificacion == true)
					credito.estatus = 0;

			if (credito.estatus == 0)
				if (credito.requiereVerificacion == false)
					credito.estatus = 1;
		}

		var sucursal = Sucursales.findOne({ _id: credito.sucursal_id });
		//var cre = Creditos.findOne(idCredito);

		var c = {
			tipoCredito_id: credito.tipoCredito_id,
			duracionMeses: credito.duracionMeses,
			capitalSolicitado: credito.capitalSolicitado,
			adeudoInicial: credito.capitalSolicitado,
			saldoActual: credito.capitalSolicitado,
			periodoPago: credito.periodoPago,
			fechaPrimerAbono: credito.fechaPrimerAbono,
			multasPendientes: 0.00,
			saldoMultas: 0.00,
			saldoRecibo: 0.00,
			estatus: credito.estatus,
			requiereVerificacion: credito.requiereVerificacion,
			requiereVerificacionAval: credito.requiereVerificacionAval,
			turno: credito.turno,
			hora: credito.hora,
			sucursal_id: credito.sucursal_id,
			fechaVerificacion: credito.fechaVerificacion,
			tipoGarantia: credito.tipoGarantia,
			tasa: credito.tasa,
			conSeguro: credito.conSeguro,
			seguro: credito.seguro,
			tipo: credito.tipo,
			beneficiario_id: credito.beneficiario_id
		};



		c.avales_ids = [];
		c.garantias = credito.garantias;
		_.each(credito.avales, function (aval) {
			if (aval.estatus == "N") {
				aval.estatus = "G";
				c.avales_ids.push({
					num: aval.num,
					aval_id: aval._id,
					nombreCompleto: aval.nombreCompleto,
					parentesco: aval.parentesco,
					tiempoConocerlo: aval.tiempoConocerlo,
					estatus: aval.estatus
				});


				var a = Avales.findOne(aval._id);

				var cliente = Meteor.users.findOne({ _id: credito.cliente_id }, { fields: { "profile.nombreCompleto": 1 } });
				a.profile.creditos.push({
					credito_id: idCredito,
					folio: credito.folio,
					nombreCompleto: cliente.profile.nombreCompleto,
					parentesco: aval.parentesco,
					tiempoConocerlo: aval.tiempoConocerlo
				});
				var idTemp = a._id;
				delete a._id;
				Avales.update({ _id: idTemp }, { $set: { profile: a.profile } });

			}
			else if (aval.estatus == "A") {
				//Buscar el avales_ids y actualizarlo						
				_.each(credito.avales_ids, function (aval_ids) {

					if (aval_ids.num == aval.num) {
						aval_ids.parentesco = aval.parentesco;
						aval_ids.tiempoConocerlo = aval.tiempoConocerlo;
						aval_ids.estatus = "G";

						var a = Avales.findOne(aval.aval_id);
						var cliente = Meteor.users.findOne({ _id: credito.cliente_id }, { fields: { "profile.nombreCompleto": 1 } });

						_.each(a.profile.creditos, function (credito) {
							if (credito.credito_id == idCredito) {
								credito.nombreCompleto = cliente.profile.nombreCompleto,
									credito.parentesco = aval.parentesco;
								credito.tiempoConocerlo = aval.tiempoConocerlo
							}
						});
						var idTemp = a._id;
						delete a._id;
						Avales.update({ _id: idTemp }, { $set: { profile: a.profile } });

						c.avales_ids.push({
							num: aval.num,
							aval_id: aval._id,
							nombreCompleto: aval.nombreCompleto,
							parentesco: aval.parentesco,
							tiempoConocerlo: aval.tiempoConocerlo,
							estatus: aval.estatus
						});
					}
				});
			}
			else if (aval.estatus == "G") {
				c.avales_ids.push({
					num: aval.num,
					aval_id: aval.aval_id,
					nombreCompleto: aval.nombreCompleto,
					parentesco: aval.parentesco,
					tiempoConocerlo: aval.tiempoConocerlo,
					estatus: aval.estatus
				});
			}
		});


		delete credito['avales'];
		delete credito._id;
		Creditos.update({ _id: idCredito }, { $set: c });

		return "hecho";
	},
	entregarCredito: (montos, creditoid, tipoIngreso_id) => {
		var cajaid = Meteor.user().profile.caja_id;
		var user = Meteor.user();
		var caja = Cajas.findOne(cajaid);
		var credito = Creditos.findOne(creditoid);
		var fechaNueva = new Date();

		if (!credito || credito.estatus != 2)
			throw new Meteor.Error(500, 'Error 500: Conflicto', 'Credito Invalido');
		if (!caja)
			throw new Meteor.Error(500, 'Error 500: Conflicto', 'Usuario Sin Caja Asignada');

		//Validar que el cliente tenga saldo en el crédito si es Vale
		var cliente = Meteor.users.findOne(credito.cliente_id);
		if (credito.tipo == "vale") {
			//console.log("Es vale");
			//var cliente = Meteor.users.findOne(credito.cliente_id);
			var suma = 0;
			_.each(montos.caja, (monto, index) => {
				if (Number(monto.saldo) > 0)
					suma += Number(parseFloat(monto.saldo).toFixed(2));
			});
			if (cliente.saldoCredito < suma)
				throw new Meteor.Error(500, 'Error', 'El Distribuidor no tiene Saldo');
		}

		credito.entrega = { movimientosCaja: [], movimientosCuentas: [] };

		var origen = "";
		if (credito.tipo == "vale")
			origen = "Entrega de Vale";
		else
			origen = "Entrega de Credito";

		_.each(montos.caja, (monto, index) => {

			if (Number(monto.saldo) > 0) {

				var movimiento = {
					tipoMovimiento: "Retiro",
					origen: origen,
					origen_id: creditoid,
					tipoIngreso_id: tipoIngreso_id,
					caja_id: cajaid,
					cuenta_id: index,
					monto: monto.saldo,
					sucursal_id: user.profile.sucursal_id,
					createdAt: new Date(),
					createdBy: user._id,
					updated: false,
					estatus: 1
				}
				caja.cuenta[index].saldo -= Number(parseFloat(monto.saldo).toFixed(2));

				var movimientoid = MovimientosCajas.insert(movimiento);
				credito.entrega.movimientosCaja.push(movimientoid);
				credito.fechaEntrega = fechaNueva;

			}
		});

		delete caja._id
		caja.updated = true;
		caja.updatedAt = new Date();
		caja.updatedBy = user._id;
		Cajas.update({ _id: cajaid }, { $set: caja });

		credito.estatus = 4;
		credito.usuario_id = user._id;
		//credito.sucursal_id = Meteor.user().profile.sucursal_id;

		//Preguntar si es promotora para guardar la comision por pagar----
		if (cliente.profile.promotora_id != undefined && cliente.profile.sePagoComision == false) {
			credito.promotora_id = cliente.profile.promotora_id;
			credito.estaPagadoComision = false;
			ComisionesPromotoras.insert(credito);
			//Actualizar al cliente de que ya no se le pagara comisión por ese cliente
			Meteor.users.update({ _id: cliente._id }, { $set: { "profile.sePagoComision": true } });
		}

		delete credito._id;
		Creditos.update({ _id: creditoid }, { $set: credito });

		//Actualizar planpagos a Estatus --> 0	
		var planPagos = PlanPagos.find({ credito_id: creditoid }).fetch();
		_.each(planPagos, function (pp) {
			PlanPagos.update({ _id: pp._id }, { $set: { estatus: 0 } });
		});

		//Actualizar el saldo al Distribuidor Y Beneficiario--------------
		if (credito.tipo == "vale") {

			//Revisar si es el primer vale para actualizar el perfil
			var vales = Creditos.find({ cliente_id: cliente._id, estatus: 4 }).fetch();
			var fecha = "";
			if (vales.length == 1) {
				fecha = new Date();
				Meteor.users.update({ _id: cliente._id }, { $set: { "profile.fechaPrimerVale": fecha } });
			}
			//------------------------------------------------------	

			var saldo = 0;
			var u = Meteor.users.findOne({ _id: cliente._id });
			saldo = u.profile.saldoCredito;

			saldo -= Number(parseFloat(credito.capitalSolicitado).toFixed(2));

			Meteor.users.update({ _id: cliente._id }, { $set: { "profile.saldoCredito": saldo } });

			//saldoBeneficiario				
			var saldoBeneficiario = 0;
			var saldoBeneficiarioVale = 0;

			var beneficiario = Beneficiarios.findOne(credito.beneficiario_id);
			saldoBeneficiario = beneficiario.saldoActual;
			saldoBeneficiarioVale = beneficiario.saldoActualVales;

			saldoBeneficiario += Number(parseFloat(credito.capitalSolicitado).toFixed(2));
			saldoBeneficiarioVale += Number(parseFloat(credito.adeudoInicial).toFixed(2));

			Beneficiarios.update({ _id: credito.beneficiario_id }, { $set: { saldoActual: saldoBeneficiario, saldoActualVales: saldoBeneficiarioVale } });
		}
		//-------------------------------------------------




		return "200";
	},
	getCredito: function (credito_id) {
		var credito = Creditos.findOne({ "_id": credito_id });
		return credito;
	},
	validarCreditosSaldoEnMultas: function (cliente_id) {
		var creditos = Creditos.find({ cliente_id: cliente_id, estatus: 4 }).fetch();
		var ban = true;
		_.each(creditos, function (c) {
			if (c.saldoMultas > 0) {
				ban = false;
				console.log(c.saldoMultas);
			}
		});
		//console.log(ban);

		return ban;
	},
	generarAval: function (avales) {

		credito.avales_ids = [];

		_.each(credito.avales, function (aval) {
			if (aval.estatus == "N") aval.estatus = "G";
			credito.avales_ids.push({
				num: aval.num,
				aval_id: aval._id,
				nombreCompleto: aval.nombreCompleto,
				parentesco: aval.parentesco,
				tiempoConocerlo: aval.tiempoConocerlo,
				estatus: aval.estatus
			});
		});

		delete credito['avales'];
		var credito_id = Creditos.insert(credito);
		_.each(credito.avales_ids, function (aval) {
			var a = Avales.findOne(aval.aval_id);
			a.profile.creditos = [];
			a.profile.creditos.push({
				credito_id: credito_id,
				folio: credito.folio,
				parentesco: aval.parentesco,
				tiempoConocerlo: aval.tiempoConocerlo
			});
			var idTemp = a._id;
			delete a._id;
			Avales.update({ _id: idTemp }, { $set: { profile: a.profile } })
		});

		return "hecho";
	},
	eliminarAval: function (aval_id, credito_id) {

		var aval = Avales.findOne(aval_id);
		var arregloAvales = _.without(aval.profile.creditos, _.findWhere(aval.profile.creditos, { credito_id: credito_id }));

		Avales.update({ _id: aval_id }, { $set: { "profile.creditos": arregloAvales } });

		var credito = Creditos.findOne(credito_id);
		var arregloCredito = _.without(credito.avales_ids, _.findWhere(credito.avales_ids, { aval_id: aval_id }));

		//console.log(arregloCredito);
		Creditos.update({ _id: credito_id }, { $set: { avales_ids: arregloCredito } });

		return true;
	},

	getRespaldosCliente: function (tipo, cliente_id) {

		var respaldos = [];

		var creditos = Creditos.find({ "cliente_id": cliente_id }).fetch();
		//console.log(creditos);

		_.each(creditos, function (credito) {

			if (credito.tipoGarantia == tipo && credito.garantias.length > 0) {
				_.each(credito.garantias, function (garantia) {

					if (tipo == "mobiliaria") {
						var ban = false;
						_.each(respaldos, function (respaldo) {
							if (respaldo.descripcion == garantia.descripcion &&
								respaldo.caracteristicas == garantia.caracteristicas &&
								respaldo.avaluoMobiliaria == garantia.avaluoMobiliaria) {
								ban = true;
							}
						});

						if (!ban)
							respaldos.push(garantia);

					}
					else if (tipo == "general") {
						var ban = false;
						_.each(respaldos, function (respaldo) {
							if (respaldo.terrenoYconstruccion == garantia.terrenoYconstruccion &&
								respaldo.ubicacion == garantia.ubicacion &&
								respaldo.medidasColindancias == garantia.medidasColindancias &&
								respaldo.avaluoGeneral == garantia.avaluoGeneral) {
								ban = true;
							}
						});

						if (!ban)
							respaldos.push(garantia);

					}

				});
			}
		});

		return respaldos;
	},

	getCreditosBeneficiario: function (id) {
		var creditos = Creditos.find({ "beneficiario_id": id, estatus: { $in: [4, 5] } }, { sort: { fechaEntrega: 1 } }).fetch();



		return creditos;
	},

	getCreditos: function (id) {
		var creditos = Creditos.find({ "cliente_id": id, estatus: { $in: [4, 5] } }, { sort: { fechaEntrega: 1 } }).fetch();

		/*
	_.each(creditos, function(c){
			  
			var beneficiario 	= Beneficiarios.findOne(c.beneficiario_id);
			c.beneficiario 		= beneficiario.nombreCompleto
			  
		})
	*/

		return creditos;
	},
	setCancelarCreditosComisionPromotora: function (creditos) {
		_.each(creditos, function (c) {
			Creditos.update({ _id: c.id }, { $set: { estaPagadoComision: false } });
		})
		return true;
	},

})