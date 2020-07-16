//import { normalizeUnits } from "moment";

angular
	.module('creditoMio')
	.controller('DistribuidoresDetalleCtrl', DistribuidoresDetalleCtrl);

function DistribuidoresDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {

	rc = $reactive(this).attach($scope);
	window.rc = rc;

	this.buscar = {};
	this.buscar.nombreBeneficiado = "";

	this.fechaActual = new Date();
	this.creditos = [];
	rc.creditos_id = [];
	rc.empresaCliente = ""
	rc.credito_id = ""
	rc.credito = "";
	rc.notaCuenta = []
	rc.empresaArray
	this.notaCobranza = {}
	this.masInfo = false;
	this.masInfoCredito = false;
	this.creditoAc = true;
	this.solicitudesCre = false;
	this.notasCre = false;
	rc.cancelacion = {};
	rc.nota = {};
	rc.pagos = "";

	rc.documentos = [];
	this.imagenes = []
	rc.openModal = false
	rc.empresa = {}
	rc.creActivos = false;
	rc.creditoApro = false;
	this.creditosRechazados = false;
	this.respuestaNotaCLiente = false;
	rc.objeto = {};
	rc.objeto.profile = {};
	rc.objeto.profile.empresa = {};
	rc.creditoSeleccionado = {};
	rc.estadoCivilSeleccionado = "";
	rc.recibo = {};
	rc.recibos = [];
	rc.empresaSeleccionada = ""
	rc.datosCliente = ""
	rc.btnCerrarRespuesta = true;

	rc.editMode = false;
	rc.puedeSolicitar = true;

	rc.estatusCaja = "";

	rc.notaPerfil = {};
	rc.notaCuenta1 = {};

	rc.banderaContestar = false;

	rc.BeneficiadosDeudas = [];

	rc.beneficiarios = [];
	rc.pagoPlanPago = [];
	rc.pagos = [];

	//Arreglo para 
	//rc.arregloPorCortes  = {};
	rc.arregloCortes = [];
	rc.planPagosCortes = [];

	rc.creditoCortes = [];
	rc.pagosCortes = [];
	rc.creditoPCortes = [];

	rc.ban = false;
	rc.selected_numero = 0;

	rc.banC = false;
	rc.selected_numeroC = 0;

	rc.banCP = false;
	rc.selected_numeroCP = 0;

	rc.banP = false;
	rc.selected_numeroP = 0;

	rc.seleccionCredito_id = "";
	//rc.fechaPago_id = "";

	/////////////////////////////////////
	rc.vale_id = "";

	rc.saldo = 0;
	rc.cargosMoratorios = 0;
	rc.bonificacion = 0;

	rc.edad = 0;
	rc.seguro = 0;

	rc.mostrarPP = false;

	rc.distribuidor_id = "";

	if ($stateParams.objeto_id == "" && Meteor.user().roles[0] == 'Distribuidor') {
		rc.distribuidor_id = Meteor.userId();
		//console.log(Meteor.userId());
	}
	else if ($stateParams.objeto_id != "") {
		rc.distribuidor_id = $stateParams.objeto_id;
		//console.log("Dis:", rc.distribuidor_id);
	}

	this.subscribe('cajas', () => {
		return [{}];
	});

	this.subscribe('cliente', () => {
		return [{ _id: rc.distribuidor_id }];
	});

	this.subscribe("diasInhabiles", () => {
		return [{ estatus: true }]
	});

	//------------------------------------------------
	this.subscribe('creditos', () => {
		return [{ cliente_id: rc.distribuidor_id }];
	});

	this.subscribe('creditosActivos', () => {
		return [{ cliente_id: rc.distribuidor_id, estatus: 4 }];
	});

	this.subscribe('creditosCancelados', () => {
		return [{ cliente_id: rc.distribuidor_id, estatus: { $in: [3, 6] } }];
	});

	this.subscribe('creditosAprobados', () => {
		return [{ cliente_id: rc.distribuidor_id, estatus: 2 }];
	});

	this.subscribe('creditosPendientes', () => {
		return [{ cliente_id: rc.distribuidor_id, estatus: { $in: [0, 1] } }];
	});

	//------------------------------------------------
	this.subscribe('notasCredito', () => {
		return [{ cliente_id: rc.distribuidor_id }];
	});

	this.subscribe('planPagos', () => {
		return [{
			cliente_id: rc.distribuidor_id, credito_id: { $in: rc.getReactively("creditos_id") }
		}];
	});

	if (Meteor.user() != undefined && Meteor.user().roles != undefined && Meteor.user().roles[0] != 'Distribuidor') {
		this.subscribe('notas', () => {
			//return [{cliente_id: this.getReactively("cliente_id")}]
			return [{
				cliente_id: rc.distribuidor_id,
				estatus: true,
				tipo: { $in: ["Cliente", "Cuenta"] }
			}]
		});
	}

	this.subscribe('tiposNotasCredito', () => {
		return [{}]
	});

	this.subscribe('tiposCreditos', () => {
		return [{}]
	});

	this.subscribe('estadoCivil', () => {
		return [{}]
	});

	this.subscribe('pagos', () => {
		return [{ _id: { $in: rc.getReactively("pagos_ids") } }];
	});

	this.subscribe('tiposIngreso', () => {
		return [{
			estatus: true
		}]
	});

	this.subscribe('tiposCredito', () => {
		return [{
			estatus: true
		}]
	});

	this.subscribe('configuraciones', () => {
		return [{}]
	});

	this.helpers({
		//Estos son los Vales Activos
		creditos: () => {
			var creditos = Creditos.find({ cliente_id: rc.distribuidor_id, estatus: 4 }, { sort: { fechaSolicito: 1 } }).fetch();

			_.each(creditos, function (credito) {

				if (credito.saldoMultas == 0) {
					rc.puedeSolicitar = true
				} else {
					rc.puedeSolicitar = false
				}
				if (creditos == "") {
					rc.puedeSolicitar = false
				}

				credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);

				credito.tieneAvales = false;
				_.each(credito.avales_ids, function (aval) {
					credito.tieneAvales = true;
					Meteor.apply('getAval', [aval.aval_id], function (error, result) {
						if (result) {
							//console.log(result.nombreCompleto);
							aval.nombreCompleto = result.nombreCompleto;
							aval.celular = result.celular;
						}
						$scope.$apply();
					});

				})

			});

			return creditos;
		},
		creditosAprobados: () => {
			var creditos = Creditos.find({ cliente_id: rc.distribuidor_id, estatus: 2 }, { sort: { fechaSolicito: 1 } }).fetch();
			if (creditos != undefined) {
				_.each(creditos, function (credito) {

					Meteor.call('getBeneficiario', credito.beneficiario_id, function (error, result) {
						if (result) {
							credito.beneficiario = result;
						}
					});
					credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
					if (credito.avales_ids.length > 0)
						credito.tieneAval = "SI";
					else
						credito.tieneAval = "NO";
				})
			}
			return creditos;
		},
		creditosCancelados: () => {

			var creditos = Creditos.find({ cliente_id: rc.distribuidor_id, estatus: { $in: [3, 6] } }).fetch();

			if (creditos != undefined) {
				_.each(creditos, function (credito) {

					Meteor.call('getBeneficiario', credito.beneficiario_id, function (error, result) {
						if (result) {
							credito.beneficiario = result;
						}
					});
				})
			}


			return creditos;
		},
		creditosPendientes: () => {
			var creditos = Creditos.find({ cliente_id: rc.distribuidor_id, estatus: { $in: [0, 1] } }, { sort: { fechaSolicito: 1 } }).fetch();

			if (creditos.length > 0) {
				_.each(creditos, function (credito) {
					Meteor.call('getBeneficiario', credito.beneficiario_id, function (error, result) {
						if (result) {
							credito.beneficiario = result;
						}
					});

					credito.estatusClase = obtenerClaseEstatus(credito.requiereVerificacion);
					credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
					if (credito.avales_ids.length > 0)
						credito.tieneAval = "SI";
					else
						credito.tieneAval = "NO";
				})
			}

			return creditos;
		},
		notasCredito: () => {

			var notas = NotasCredito.find({}, { sort: { fecha: 1 } });
			return notas;

		},
		objeto: () => {

			var cli = Meteor.users.findOne({ _id: rc.distribuidor_id });

			if (cli != undefined) {

				rc.edad = moment().diff(cli.profile.fechaNacimiento, 'years', false);

				var notas = Notas.find({
					cliente_id: rc.distribuidor_id,
					estatus: true,
					tipo: { $in: ["Distribuidor", "Cuenta"] }
				}).fetch();


				var estadoCivilSeleccionado = EstadoCivil.findOne(cli.profile.estadoCivil_id);

				if (estadoCivilSeleccionado)
					rc.estadoCivilSeleccionado = estadoCivilSeleccionado;

				if (rc.banderaContestar == false) {
					_.each(notas, function (nota) {

						if (nota.tipo == "Cuenta") {
							//$("#notaPerfil").modal("hide");
							rc.notaCuenta1 = nota;
							Meteor.call('getUsuario', nota.usuario_id,
								function (err, result) {
									if (result) {
										nota.nombreCompleto = result.nombreCompleto;
									}
								});
							$("#myModal").modal();
						}
						else if (nota.tipo == "Cliente") {
							//Esta abre la nota de Cliente
							rc.notaPerfil = nota;

							$("#notaPerfil").modal();
						}
					});
				}

				//getdocumentos
				Meteor.call('getDocumentosClientes', rc.distribuidor_id, function (error, result) {
					if (result) {
						//ir por los documentos
						rc.documentos = result;
						$scope.$apply();
					}
				});

				return cli;
			}
		},
		planPagos: () => {

			var fecha = new Date();
			var n = fecha.getDate();
			var fechaLimite = "";
			var arreglo = {};
			var arregloSeguro = {};
			rc.seguro = 0;

			if (n >= 22) {
				fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1, 0, 0, 0, 0);
			}
			else if (n <= 7) {
				fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0, 0);
			}
			else if (n > 7 && n < 22) {
				fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth(), 16, 0, 0, 0, 0);
			}

			var validaFecha = true;
			var fechaValidar = moment(fechaLimite);
			while (validaFecha) {
				validaFecha = verificarDiaInhabil(fechaValidar);
				if (validaFecha == true)
					fechaValidar = fechaValidar.add(1, 'days');
			}

			fechaLimite = new Date(fechaValidar);
			fechaLimite.setHours(23, 59, 59, 999);

			var planPagos = PlanPagos.find({ fechaLimite: { $lte: fechaLimite }, importeRegular: { $gt: 0 } }, { sort: { fechaLimite: 1 } }).fetch();
			//console.log("PP", planPagos);
			if (planPagos != undefined) {
				rc.importe = 0;
				rc.cargosMoratorios = 0;
				rc.bonificacion = 0;
				rc.seguro = 0;

				var configuraciones = Configuraciones.findOne();

				_.each(planPagos, function (pp) {
					var credito = Creditos.findOne(pp.credito_id);
					
					if (credito != undefined) {
						Meteor.call('getBeneficiario', credito.beneficiario_id, function (error, result) {
							if (result) {
								pp.beneficiario = result;
								//console.log(pp.beneficiario)
								$scope.$apply();
							}
						});

						if (credito.tipo == "vale") {
							var comision = 0;
							pp.bonificacion = 0;
							comision = calculaBonificacion(pp.fechaLimite, configuraciones.arregloComisiones);
							pp.bonificacion = parseFloat(((pp.capital + pp.interes) * (comision / 100))).toFixed(2);
							rc.bonificacion += Number(parseFloat(pp.bonificacion).toFixed(2));
						}
						else if (credito.tipo == "creditoPersonalDistribuidor") {

							pp.bonificacion = 0;
							pp.beneficiario = {};
							pp.beneficiario.nombreCompleto = "CRÉDITO PERSONAL";
							//console.log(pp.beneficiario)
						}
						
						pp.numeroPagos = credito.numeroPagos;

					}

					if (pp.descripcion == "Cargo Moratorio")
						pp.orden = 2;
					else
						pp.orden = 1;

					if (pp.descripcion == 'Recibo')
						rc.importe += Number(parseFloat(pp.importeRegular).toFixed(2));
					else if (pp.descripcion == 'Cargo Moratorio')
						rc.cargosMoratorios += Number(parseFloat(pp.importeRegular).toFixed(2));



					//Meterlo al arreglo y luego al arregloCortes
					var numeroCorte = 0;
					var fechaCorteInicio = "";
					var fechaCorteFin = "";
					if (pp.fechaLimite.getDate() >= 15) {
						numeroCorte = pp.fechaLimite.getMonth() * 2;
						fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 22);
						fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth(), 06);
						//console.log("1:", numeroCorte);
					}
					else {
						var m = pp.fechaLimite.getMonth();
						if (m == 0) {
							numeroCorte = 12 * 2 - 1;
							fechaCorteInicio = new Date(pp.fechaLimite.getFullYear() - 1, 11, 07);
							fechaCorteFin = new Date(pp.fechaLimite.getFullYear() - 1, 11, 21);
							//console.log("2:", numeroCorte);
						}
						else {
							numeroCorte = pp.fechaLimite.getMonth() * 2 - 1;
							fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 07);
							fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 21);
							//console.log("3:", numeroCorte);
						}

					}

					if (arreglo[numeroCorte] == undefined) {
						arreglo[numeroCorte] = {};
						arreglo[numeroCorte].numeroCorte = numeroCorte;
						arreglo[numeroCorte].fechaCorteInicio = fechaCorteInicio;
						arreglo[numeroCorte].fechaCorteFin = fechaCorteFin;
						arreglo[numeroCorte].seguro = 0;

						if (pp.fechaLimite != undefined)
							Meteor.call("getPagoSeguro", $stateParams.objeto_id, pp.fechaLimite.getFullYear(), numeroCorte, function (error, result) {
								if (error) {
									toastr.error('Error al obtener pagos: ', error.details);
									return
								}
								if (result) {
									arreglo[numeroCorte].seguro = result;
									$scope.$apply();
								}
							});

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

					//Arreglo Seguro Pagos Seguro
					if (arregloSeguro[numeroCorte] == undefined) {
						arregloSeguro[numeroCorte] = {};
						arregloSeguro[numeroCorte].numeroCorte = numeroCorte;
						arregloSeguro[numeroCorte].anio = pp.fechaLimite.getFullYear();
						arregloSeguro[numeroCorte].fecha = pp.fechaLimite;
					}

				});

				//Verificar si ya los pago el seguro
				var arregloPagosSeguro = _.toArray(arregloSeguro);
				if (arregloPagosSeguro.length > 0)
					Meteor.call("getPagosSeguro", rc.distribuidor_id, arregloPagosSeguro, function (error, result) {
						if (error) {
							toastr.error('Error al obtener pagos: ', error.details);
							return
						}
						if (result) {
							rc.seguro = result;
							$scope.$apply();
						}
					});
				else
					rc.seguro = 0;

				rc.arregloCortes = _.toArray(arreglo);

				//ordenar ArregloCortes
				// rc.arregloCortes.sort(function (a, b) {
				// 	if (a.numeroCorte < b.numeroCorte) {
				// 		return 1;
				// 	}
				// 	if (a.numeroCorte > b.numeroCorte) {
				// 		return -1;
				// 	}
				// 	// a must be equal to b
				// 	return 0;
				// });

				return planPagos;
			}

		},
		usuario: () => {
			return Meteor.users.findOne()
		},
		planPagosHistorial: () => {
		},
		historial: () => {

			arreglo = [];

			var saldoPago = 0;
			var saldoActual = 0;
			rc.saldo = 0;
			var credito = rc.credito
			rc.saldoMultas = 0;

			rc.abonosRecibos = 0;
			rc.abonosCargorMoratorios = 0;

			_.each(rc.getReactively("planPagosHistorial"), function (planPago) {
				if (planPago.descripcion == "Recibo")
					rc.saldo += Number(parseFloat(planPago.cargo).toFixed(2));

				if (planPago.descripcion == "Cargo Moratorio")
					rc.saldoMultas += Number(planPago.importeRegular + planPago.pago);

			});

			rc.pagos_ids = [];

			_.each(rc.getReactively("planPagosHistorial"), function (planPago, index) {

				var sa = 0;
				var cargoCM = 0;
				if (planPago.descripcion == 'Recibo') {
					sa = Number(parseFloat(planPago.cargo - (planPago.pagoInteres + planPago.pagoIva + planPago.pagoCapital + planPago.pagoSeguro)).toFixed(2));
					planPago.fechaLimite.setHours(0, 0, 0, 0);
				}
				else if (planPago.descripcion == 'Cargo Moratorio') {
					sa = Number(parseFloat(planPago.importeRegular).toFixed(2));
					planPago.fechaLimite.setHours(1, 0, 0, 0);
					cargoCM = Number(planPago.importeRegular + planPago.pago);
				}

				arreglo.push({
					saldo: rc.saldo,
					numeroPago: planPago.numeroPago,
					cantidad: rc.credito.numeroPagos,
					fechaSolicito: rc.credito.fechaSolicito,
					fecha: planPago.fechaLimite,
					pago: 0,
					cargo: planPago.descripcion == "Recibo" ? planPago.cargo : cargoCM,
					movimiento: planPago.movimiento,
					planPago_id: planPago._id,
					credito_id: planPago.credito_id,
					descripcion: planPago.descripcion,
					importe: planPago.importeRegular,
					pagos: planPago.pagos,
					notaCredito: 0,
					saldoActualizado: planPago.pagos.length == 0 ? planPago.importeRegular : sa

				});

				if (planPago.pagos.length > 0) {

					_.each(planPago.pagos, function (pago) {
						if (pago.estatus != 3)
							rc.pagos_ids.push(pago.pago_id);
					});

					_.each(planPago.pagos, function (pago) {

						//Ir por la Forma de Pago
						if (pago.estatus != 3) {
							var formaPago = "";
							var pag = Pagos.findOne(pago.pago_id);
							if (pag != undefined) {
								var ti = TiposIngreso.findOne(pag.tipoIngreso_id);
								if (ti != undefined)
									formaPago = ti.nombre;
							}

							if (planPago.descripcion == 'Recibo') {
								rc.abonosRecibos += pago.totalPago;
							}
							else if (planPago.descripcion == "Cargo Moratorio") {
								rc.abonosCargorMoratorios += pago.totalPago;
							}

							if (formaPago == 'Nota de Credito')
								rc.sumaNotaCredito += pago.totalPago;

							arreglo.push({
								saldo: rc.saldo,
								numeroPago: planPago.numeroPago,
								cantidad: credito.numeroPagos,
								fechaSolicito: rc.credito.fechaSolicito,
								fecha: pago.fechaPago,
								pago: pago.totalPago,
								cargo: 0,
								movimiento: planPago.descripcion == "Cargo Moratorio" ? "Abono a CM" : "Abono",
								planPago_id: planPago._id,
								credito_id: planPago.credito_id,
								descripcion: planPago.descripcion == "Cargo Moratorio" ? "Abono A CM" : "Abono",
								importe: planPago.importeRegular,
								pagos: planPago.pagos,
								notaCredito: formaPago == 'Nota de Credito' ? pago.totalPago : 0,
								saldoActualizado: 0
							});
						}
					})

				}

			});


			rc.saldoGeneral = (rc.saldo + rc.saldoMultas) - (rc.abonosRecibos + rc.abonosCargorMoratorios);

			arreglo.sort(function (a, b) {
				return a.numeroPago - b.numeroPago || new Date(a.fecha) - new Date(b.fecha);
			});

			_.each(arreglo, function (item, index) {
				if (index > 0) {
					if (item.descripcion == "Cargo Moratorio")
						rc.saldo += Number(parseFloat(item.cargo).toFixed(2));
					else if (item.movimiento == "Abono" || item.movimiento == "Abono A CM")
						rc.saldo -= Number(parseFloat(item.pago).toFixed(2));
				}
				item.saldo = rc.saldo;
			});


			return arreglo;
		},
		historialCreditos: () => {
			var cre = Creditos.find({ estatus: { $in: [4, 5] } }, { sort: { fechaEntrega: 1 } }).fetch();

			if (cre != undefined) {

				var arregloCreditos = {};
				var arregloVales = {};

				rc.creditos_id = _.pluck(cre, "_id");

				_.each(cre, function (c) {

					if (c.tipo == "vale") {

						Meteor.call('getBeneficiario', c.beneficiario_id, function (error, result) {
							if (result) {
								c.beneficiario = result;
								$scope.$apply();
							}
						});

						var mes = c.fechaEntrega != undefined ? c.fechaEntrega.getMonth() : 0;
						var numeroCorte = 0;

						if (c.fechaEntrega.getDate() >= 7 && c.fechaEntrega.getDate() <= 21) {
							numeroCorte = (mes + 1) * 2 - 1;
							var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 07)
							var fechaCorteFin = new Date(c.fechaEntrega.getFullYear(), mes, 21);
						}
						else if (c.fechaEntrega.getDate() > 0 && c.fechaEntrega.getDate() < 7) {
							if (mes == 0)
								numeroCorte = 0;
							else
								numeroCorte = (mes + 1) * 2 - 2;

							var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes - 1, 22);
							var fechaCorteFin = new Date(c.fechaEntrega.getFullYear(), mes, 06);
						}
						else if (c.fechaEntrega.getDate() > 21) {
							if (mes == 11)
								numeroCorte = 0;
							else
								numeroCorte = (mes + 1) * 2 - 1 + 1;

							var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 22);
							var fechaCorteFin = new Date(c.fechaEntrega.getFullYear(), mes + 1, 06);
						}
						//console.log("nCorte:", numeroCorte);

						if (arregloVales[numeroCorte] == undefined) {
							arregloVales[numeroCorte] = {};
							arregloVales[numeroCorte].numeroCorte = numeroCorte;
							arregloVales[numeroCorte].fechaCorteInicio = fechaCorteInicio;
							arregloVales[numeroCorte].fechaCorteFin = fechaCorteFin;
							arregloVales[numeroCorte].capitalSolicitado = c.capitalSolicitado;
							arregloVales[numeroCorte].adeudoInicial = c.adeudoInicial;
							arregloVales[numeroCorte].saldoActual = c.saldoActual;
							arregloVales[numeroCorte].cargosMoratorios = c.saldoMultas;

							arregloVales[numeroCorte].creditosHistorial = [];
							arregloVales[numeroCorte].creditosHistorial.push(c);

						}
						else {

							arregloVales[numeroCorte].capitalSolicitado += Number(parseFloat(c.capitalSolicitado).toFixed(2));
							arregloVales[numeroCorte].adeudoInicial += Number(parseFloat(c.adeudoInicial).toFixed(2));
							arregloVales[numeroCorte].saldoActual += Number(parseFloat(c.saldoActual).toFixed(2));
							arregloVales[numeroCorte].cargosMoratorios += Number(parseFloat(c.saldoMultas).toFixed(2));

							arregloVales[numeroCorte].creditosHistorial.push(c);
						}
					}
					else {

						var mes = c.fechaEntrega != undefined ? c.fechaEntrega.getMonth() : 0;
						var numeroCorte = 0;

						if (c.fechaEntrega.getDate() >= 7 && c.fechaEntrega.getDate() <= 21) {
							numeroCorte = (mes + 1) * 2 - 1;
							var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 07)
							var fechaCorteFin = new Date(c.fechaEntrega.getFullYear(), mes, 21);
						}
						else if (c.fechaEntrega.getDate() > 0 && c.fechaEntrega.getDate() < 7) {
							if (mes == 0)
								numeroCorte = 0;
							else
								numeroCorte = (mes + 1) * 2 - 2;

							var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes - 1, 22);
							var fechaCorteFin = new Date(c.fechaEntrega.getFullYear(), mes, 06);
						}
						else if (c.fechaEntrega.getDate() > 21) {
							if (mes == 11)
								numeroCorte = 0;
							else
								numeroCorte = (mes + 1) * 2 - 1 + 1;

							var fechaCorteInicio = new Date(c.fechaEntrega.getFullYear(), mes, 22);
							var fechaCorteFin = new Date(c.fechaEntrega.getFullYear(), mes + 1, 06);
						}

						if (arregloCreditos[numeroCorte] == undefined) {
							arregloCreditos[numeroCorte] = {};
							arregloCreditos[numeroCorte].numeroCorte = numeroCorte;
							arregloCreditos[numeroCorte].fechaCorteInicio = fechaCorteInicio;
							arregloCreditos[numeroCorte].fechaCorteFin = fechaCorteFin;
							arregloCreditos[numeroCorte].capitalSolicitado = c.capitalSolicitado;
							arregloCreditos[numeroCorte].adeudoInicial = c.adeudoInicial;
							arregloCreditos[numeroCorte].saldoActual = c.saldoActual;
							arregloCreditos[numeroCorte].cargosMoratorios = c.saldoMultas;

							arregloCreditos[numeroCorte].creditosHistorial = [];
							arregloCreditos[numeroCorte].creditosHistorial.push(c);

						}
						else {

							arregloCreditos[numeroCorte].capitalSolicitado += Number(parseFloat(c.capitalSolicitado).toFixed(2));
							arregloCreditos[numeroCorte].adeudoInicial += Number(parseFloat(c.adeudoInicial).toFixed(2));
							arregloCreditos[numeroCorte].saldoActual += Number(parseFloat(c.saldoActual).toFixed(2));
							arregloCreditos[numeroCorte].cargosMoratorios += Number(parseFloat(c.saldoMultas).toFixed(2));

							arregloCreditos[numeroCorte].creditosHistorial.push(c);
						}
					}

				});

				rc.creditoCortes = _.toArray(arregloVales);
				rc.creditoPCortes = _.toArray(arregloCreditos);

				//Ordena el arreglo
				rc.creditoCortes.sort(function (a, b) {
					if (a.fechaCorteInicio.getTime() < b.fechaCorteInicio.getTime()) {
						return 1;
					}
					if (a.fechaCorteInicio.getTime() > b.fechaCorteInicio.getTime()) {
						return -1;
					}
					return 0;
				});

				//Ordena el arreglo
				rc.creditoPCortes.sort(function (a, b) {
					if (a.fechaCorteInicio.getTime() < b.fechaCorteInicio.getTime()) {
						return 1;
					}
					if (a.fechaCorteInicio.getTime() > b.fechaCorteInicio.getTime()) {
						return -1;
					}
					return 0;
				});

				return cre;
			}
		},
		cajero: () => {
			var c = Meteor.users.findOne({ roles: "Cajero" });

			if (c != undefined) {
				var caja = Cajas.findOne({ usuario_id: c._id });
				//console.log(caja);
				if (caja != undefined) {
					if (caja.estadoCaja == "Cerrada")
						rc.estatusCaja = false;
					else if (caja.estadoCaja == "Abierta")
						rc.estatusCaja = true;
				}
				else
					rc.estatusCaja = false;
			}
			return c;
		},
		imagenesDocs: () => {
			var imagen = rc.imagenes
			_.each(rc.getReactively("imagenes"), function (imagen) {
				imagen.archivo = rc.objeto.profile.foto;
			});
			return imagen
		},

	});

	//////////////////////////////////////////////////////////////////////////////////////////

	this.selCorte = function (objeto, num) {
		rc.ban = !rc.ban;
		rc.selected_numero = num;
	};
	this.isSelected = function (objeto) {
		return rc.selected_numero === objeto;
	};

	this.selCorteCredito = function (objeto, num) {
		rc.banC = !rc.banC;
		rc.selected_numeroC = num;
	};

	this.isSelectedCredito = function (objeto) {
		return rc.selected_numeroC === objeto;
	};

	this.selCorteCreditoP = function (objeto, num) {
		rc.banCP = !rc.banCP;
		rc.selected_numeroCP = num;
	};

	this.isSelectedCreditoP = function (objeto) {
		return rc.selected_numeroCP === objeto;
	};

	this.selCortePagos = function (objeto, num) {
		rc.banP = !rc.banP;
		rc.selected_numeroP = num;
	};

	this.isSelectedPago = function (objeto) {
		return rc.selected_numeroP === objeto;
	};

	this.mostrarCheckCuenta = function (nota) {
		//console.log(nota,"mostrarCheckCuenta")
		if (nota.tipo == "Cuenta") {
			//console.log("entra")
			document.getElementById("cuentaNota").style.visibility = "visible";
		} else {
			document.getElementById("cuentaNota").style.visibility = "hidden";
		}

	};

	this.actualizar = function (cliente, form) {

		//console.log(cliente);
		var clienteTemp = Meteor.users.findOne({ _id: cliente._id });
		this.cliente.password = clienteTemp.password;
		this.cliente.repeatPassword = clienteTemp.password;
		//console.log(this.cliente.password)
		//document.getElementById("contra").value = this.cliente.password;

		if (form.$invalid) {
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = cliente.profile.nombre != undefined ? cliente.profile.nombre + " " : "";
		var apPaterno = cliente.profile.apPaterno != undefined ? cliente.profile.apPaterno + " " : "";
		var apMaterno = cliente.profile.apMaterno != undefined ? cliente.profile.apMaterno : "";
		cliente.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete cliente.profile.repeatPassword;
		Meteor.call('updateUsuario', rc.cliente, "Distribuidor");
		toastr.success('Actualizado correctamente.');
		this.nuevo = true;
		$state.go("root.clienteDetalle", { objeto_id: rc.cliente._id });
	};

	this.tomarFoto = function () {
		$meteor.getPicture().then(function (data) {
			rc.cliente.profile.fotografia = data;
		});
	};

	this.masInformacion = function (cliente) {
		this.masInfo = !this.masInfo;
		this.solicitudesCre = false;
		this.creditoAc = false;
		this.notasCre = false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
		Meteor.call('getClienteInformacion', cliente, function (error, result) {
			if (result) {
				rc.objeto = result;
			}
			$scope.$apply();
		});

		rc.referenciasPersonales = [];

		//console.log(cli.profile.referenciasPersonales_ids);
		_.each(cliente.profile.referenciasPersonales_ids, function (referenciaPersonal) {
			//console.log("RP ARRay:",referenciaPersonal);
			Meteor.call('getReferenciaPersonal', referenciaPersonal.referenciaPersonal_id, function (error, result) {
				if (result) {
					//console.log("RP:",result);
					if (result.apellidoMaterno == null) {
						result.apellidoMaterno = ""
					}
					//Recorrer las relaciones 

					rc.referenciasPersonales.push({
						nombre: result.nombre,
						apellidoPaterno: result.apellidoPaterno,
						apellidoMaterno: result.apellidoMaterno,
						parentesco: referenciaPersonal.parentesco,
						direccion: result.direccion,
						telefono: result.telefono,
						ciudad: result.ciudad,
						estado: result.estado,
						tiempo: referenciaPersonal.tiempoConocerlo,
						num: referenciaPersonal.num,
						nombreCompleto: result.nombreCompleto
					});
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
						$scope.$apply();
					}
				}
			});
		});


	};

	this.creditosActivos = function () {
		this.creditoAc = !this.creditoAc;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre = false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}

	this.solicitudesCreditos = function () {
		this.solicitudesCre = !this.solicitudesCre;
		this.creditoAc = false;
		this.masInfo = false;
		this.notasCre = false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}

	this.notasCreditos = function () {
		this.notasCre = !this.notasCre;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}

	this.getPagos = function () {
		this.masInfoCredito = !this.masInfoCredito;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre = false;
		this.creditoApro = false;
		this.creditosRechazados = false;


		rc.fechaPago_id = "";

		loading(true);
		Meteor.call("getPagosDistribuidor", rc.distribuidor_id, function (error, result) {

			if (error) {
				console.log(error);
				toastr.error('Error al obtener pagos: ', error.details);
				loading(false);
				return
			}
			if (result) {
				rc.pagos = result;
				$scope.$apply();
				loading(false);
			}
		});

	}

	this.creAprobados = function () {
		this.creditoApro = !this.creditoApro;
		this.masInfoCredito = false;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre = false;
		this.creditosRechazados = false

	}

	this.creRechazados = function () {
		this.creditoApro = false;
		this.masInfoCredito = false;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre = false;
		this.creditosRechazados = !this.creditosRechazados;


	}

	this.getNombreTipoNotaCredito = function (tipo_id) {
		var tipo = TiposNotasCredito.findOne(tipo_id);
		return tipo ? tipo.nombre : "";
	}

	this.obtenerEstatus = function (cobro) {
		if (cobro.estatus == 1)
			return "bg-color-green txt-color-white";
		if (cobro.estatus == 5 || cobro.tmpestatus == 5)
			return "bg-color-blue txt-color-white";
		else if (cobro.estatus == 3)
			return "bg-color-blueDark txt-color-white";
		else if (cobro.estatus == 2)
			return "bg-color-red txt-color-white";
		else if (cobro.estatus == 6)
			return "bg-color-greenLight txt-color-white";
		else if (cobro.tiempoPago == 1)
			return "bg-color-orange txt-color-white";

		return "";

	}

	this.contestarNota = function (id) {

		this.nota = Notas.findOne({ _id: id });

		//console.log(this.nota)

		if (rc.notaCuenta1.respuestaNota != undefined) {
			//console.log("entro")
			this.nota.respuestaNota = rc.notaCuenta1.respuestaNota
			var idTemp = this.nota._id;
			delete this.nota._id;
			this.nota.respuesta = false
			this.nota.estatus = false
			Notas.update({ _id: idTemp }, { $set: this.nota });
			toastr.success('Comentario guardado.');
			$("#myModal").modal('hide');
		} else {
			toastr.error('Comentario vacio.');
		}


	};

	this.cancelarCredito = function (motivo, form) {

		if (form.$invalid) {
			toastr.error('Error al cancelar.');
			return;
		}

		var cre = Creditos.findOne({ _id: rc.cancelacion._id });
		Creditos.update({ _id: cre._id }, { $set: { estatus: 6, motivo: motivo } });
		toastr.success("El crédito se ha cancelado.")
		$("#cancelaCredito").modal('hide');
	};

	this.cancelarSeleccion = function (aprobado) {
		rc.cancelacion = aprobado;
		rc.motivo = "";
	};

	this.mostrarNotaCliente = function () {


		$("#modalCliente").modal();
		rc.nota = {};
		document.getElementById("cuentaNota").style.visibility = "hidden";

		/*
var user = Meteor.users.findOne(rc.distribuidor_id);
		if (user.profile.estatusCredito == undefined || user.profile.estatusCredito == 0)
		{
				toastr.warning("No se ha autorizado al distribuidor...");
				return;
			
		}
		else if (user.profile.estatusCredito == 2)
		{
				toastr.error("Se rechazó al distribuidor...");
				return;
		}
		else
		{
				$("#modalCliente").modal();
				rc.nota = {};
				document.getElementById("cuentaNota").style.visibility = "hidden";							
		}
*/

	};

	this.mostrarNotaCredito = function (id) {

		var user = Meteor.users.findOne(rc.distribuidor_id);
		if (user.profile.estatusCredito == undefined || user.profile.estatusCredito == 0) {
			toastr.warning("No se ha autorizado al distribuidor...");
			return;

		}
		else if (user.profile.estatusCredito == 2) {
			toastr.error("Se rechazó al distribuidor...");
			return;
		}
		else {
			$state.go("root.generarNotaCredito", { objeto_id: rc.distribuidor_id });
		}

	};

	this.guardarNota = function (objeto) {
		//console.log(objeto,"nota")
		objeto.perfil = "perfil"
		objeto.cliente_id = rc.objeto._id
		objeto.nombreCliente = rc.objeto.profile.nombreCompleto
		//objeto.respuesta = true;
		objeto.usuario_id = Meteor.userId();
		objeto.respuesta = this.respuestaNotaCLiente
		objeto.fecha = new Date()
		objeto.hora = moment(objeto.fecha).format("hh:mm:ss a")
		objeto.estatus = true; //Significa esta Activa
		Notas.insert(objeto);
		toastr.success('Nota guardada.');
		rc.nota = {};
		$("#modalCliente").modal('hide');
	};

	this.verPagos = function (pago) {

		rc.pagoPlanPago = pago.planPagos;
		rc.pago = pago;

		var arreglo = {};
		//Meterlo al arregloCortes
		_.each(pago.planPagos, function (pp) {
			var numeroCorte = 0;
			if (pp.fechaLimite.getDate() >= 15) {
				numeroCorte = pp.fechaLimite.getMonth() * 2;
				var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 22);
				var fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth(), 06);

			}
			else {
				var m = pp.fechaLimite.getMonth();
				if (m == 0) {
					numeroCorte = 12 * 2 - 1;
					var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), 11, 07);
					var fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), 11, 21);
				}
				else {
					numeroCorte = pp.fechaLimite.getMonth() * 2 - 1;
					var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 07);
					var fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 21);
				}
			}

			if (arreglo[numeroCorte] == undefined) {
				arreglo[numeroCorte] = {};
				arreglo[numeroCorte].numeroCorte = numeroCorte;
				arreglo[numeroCorte].fechaCorteInicio = fechaCorteInicio;
				arreglo[numeroCorte].fechaCorteFin = fechaCorteFin;
				arreglo[numeroCorte].fechaPago = pp.fechaLimite;
				arreglo[numeroCorte].importe = 0;
				arreglo[numeroCorte].cargosMoratorios = 0;

				if (pp.descripcion == 'Recibo')
					arreglo[numeroCorte].importe = pp.totalPago;
				else
					arreglo[numeroCorte].cargosMoratorios = pp.totalPago;

				arreglo[numeroCorte].bonificacion = Number(pp.bonificacion);

				//arreglo[numeroCorte].fechaCorte = fechaCorte;
				arreglo[numeroCorte].planPagos = [];
				arreglo[numeroCorte].planPagos.push(pp);
			}
			else {
				if (pp.descripcion == 'Recibo')
					arreglo[numeroCorte].importe += pp.totalPago;
				else
					arreglo[numeroCorte].cargosMoratorios += pp.totalPago;

				arreglo[numeroCorte].bonificacion += Number(pp.bonificacion);
				arreglo[numeroCorte].planPagos.push(pp);
			}

		});

		rc.pagosCortes = _.toArray(arreglo);

		//console.log(rc.pagosCortes);

		$("#modalPagos").modal();
	};

	this.modalDoc = function (id) {
		loading(true);
		Meteor.call('getDocumentoCliente', id, function (error, result) {
			if (result) {
				var imagen = '<img class="img-responsive" src="' + result + '" style="margin:auto;">';
				$('#imagenDiv').empty().append(imagen);
				$("#myModalVerDocumento").modal('show');
				loading(false);
			}
		});

	};

	this.imprimirDoc = function (id) {

		Meteor.call('getDocumentoCliente', id, function (error, result) {
			if (result) {
				Meteor.call('imprimirImagenDocumento', result, function (error, response) {
					if (error) {
						console.log('ERROR :', error);
						return;
					}
					else {
						function b64toBlob(b64Data, contentType, sliceSize) {
							contentType = contentType || '';
							sliceSize = sliceSize || 512;

							var byteCharacters = atob(b64Data);
							var byteArrays = [];

							for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
								var slice = byteCharacters.slice(offset, offset + sliceSize);

								var byteNumbers = new Array(slice.length);
								for (var i = 0; i < slice.length; i++) {
									byteNumbers[i] = slice.charCodeAt(i);
								}

								var byteArray = new Uint8Array(byteNumbers);

								byteArrays.push(byteArray);
							}

							var blob = new Blob(byteArrays, { type: contentType });
							return blob;
						}

						var blob = b64toBlob(response, "application/docx");
						var url = window.URL.createObjectURL(blob);

						//console.log(url);
						var dlnk = document.getElementById('dwnldLnk');

						dlnk.download = "imagenDocumento.docx";
						dlnk.href = url;
						dlnk.click();
						window.URL.revokeObjectURL(url);

					}
				});
			}
		});
	}

	this.cerrarModal = function () {
		rc.openModal = false

	};

	this.generarFicha = function (objeto) {

		Meteor.call('getPeople', objeto._id, objeto.profile.referenciasPersonales_ids.referenciaPersonal_id, function (error, result) {
			if (result) {

				loading(true);
				rc.datosCliente = result.profile;

				Meteor.call('getFichaDistribuidor', rc.datosCliente, rc.referenciasPersonales, 'pdf', function (error, response) {

					if (error) {
						console.log('ERROR :', error);
						return;
					}
					else {
						//console.log(response);
						downloadFile(response);
						loading(false);
					}
				});
			}
		});
	};

	this.diarioCobranza = function (objeto) {

		//console.log(objeto,"objetillo")
		objeto.fechaInicial = objeto[0].fechaSolicito
		objeto.objetoFinal = objeto[objeto.length - 1];
		objeto.fechaFinal = objeto.objetoFinal.fechaSolicito
		//console.log(objeto,"actualizado")

	}

	this.mostrarModal = function () {
		$("#modalDocumento").modal();
	};

	this.almacenaImagen = function (imagen) {
		if (this.objeto)
			this.objeto.profile.foto = imagen;
		this.imagenes.push({ archivo: imagen })
		//console.log(this.imagenes)


	}

	this.quitarNota = function (id) {

		//console.log(nota,"seraaaaaaaaaa")
		var nota = Notas.findOne({ _id: id });
		if (nota.estatus == true)
			nota.estatus = false;
		else
			nota.estatus = true;

		Notas.update({ _id: id }, { $set: { estatus: nota.estatus } });
		if (nota.tipo == "Cuenta") {
			$("#myModal").modal('hide');

		} else { $("#notaPerfil").modal('hide'); }

	}

	function obtenerClaseEstatus(valor) {

		if (valor)
			return "warning";
		else
			return "info";


	};

	//Restructuración-----------------------------------------------------

	this.mostrarReestructuracion = function (objeto) {
		rc.creditoSeleccionado = objeto;
		_.each(rc.creditoSeleccionado.planPagos, function (planPago) {
			planPago.editar = false;
			//planPago.numeroPagos = rc.creditoSeleccionado.numeroPagos;
		});

		if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
			$scope.$apply();
		}
		$("#modalReestructuracion").modal('show');
	};

	this.agregarPago = function () {

		var fecha = moment(new Date());

		var numeroPagos = rc.creditoSeleccionado.numeroPagos;

		var nuevoPago = {
			semana: fecha.isoWeek(),
			fechaLimite: new Date(new Date(fecha.toDate().getTime()).setHours(23, 59, 59)),
			diaSemana: fecha.weekday(),
			tipoPlan: rc.creditoSeleccionado.periodoPago,
			numeroPago: numeroPagos + 1,
			importeRegular: 0,
			iva: 0,
			interes: 0,
			seguro: 0,
			cliente_id: rc.creditoSeleccionado.cliente_id,
			capital: 0,
			fechaPago: undefined,
			semanaPago: undefined,
			diaPago: undefined,
			pago: 0,
			estatus: 0,
			multada: 0,
			multa_id: undefined,
			planPago_id: undefined,
			tiempoPago: 0,
			modificada: false,
			pagos: [],
			descripcion: "Recibo",
			ultimaModificacion: new Date(),
			credito_id: rc.creditoSeleccionado._id,
			mes: fecha.get('month') + 1,
			anio: fecha.get('year'),
			cargo: 0,
			movimiento: "Recibo",
			multa: 0,
			abono: 0,
			numeroPagos: numeroPagos + 1
		};
		rc.creditoSeleccionado.planPagos.push(nuevoPago);

	};

	this.guardarplanPagos = function () {

		_.each(rc.creditoSeleccionado.planPagos, function (planPago) {

			if (planPago._id == undefined) {

				var suma = planPago.capital + planPago.iva + planPago.interes + planPago.seguro;

				planPago.importeRegular = suma;
				planPago.cargo = suma;

				PlanPagos.insert(planPago);

				rc.creditoSeleccionado.saldoActual += suma;
				rc.creditoSeleccionado.numeroPagos = planPago.numeroPagos;
				Creditos.update({ _id: rc.creditoSeleccionado._id },
					{
						$set: {
							saldoActual: rc.creditoSeleccionado.saldoActual,
							numeroPagos: rc.creditoSeleccionado.numeroPagos
						}
					})

			}
			else {

				//Actualizar numero de pagos de Credito, asi como el saldo del credito??
				var recibo = PlanPagos.findOne({ _id: planPago._id });

				planPago.numeroPagos = rc.creditoSeleccionado.planPagos.length;

				var valor = 0;
				if (recibo.capital != planPago.capital || recibo.interes != planPago.interes || recibo.iva != planPago.iva || recibo.seguro != planPago.seguro) {
					//console.log("Recibo:",recibo);
					var suma = planPago.capital + planPago.iva + planPago.interes + planPago.seguro;


					planPago.importeRegular = suma;
					planPago.cargo = suma;

					//----------------------------------------------------------------------
					if (recibo.capital > planPago.capital) //Sumar al saldoActual
					{
						valor = recibo.capital - planPago.capital;
						rc.creditoSeleccionado.saldoActual -= valor;
					}
					else if (recibo.capital < planPago.capital) //restar al saldoActual
					{
						valor = planPago.capital - recibo.capital
						rc.creditoSeleccionado.saldoActual += valor;
					}
					//----------------------------------------------------------------------
					if (recibo.interes > planPago.interes) //Sumar al saldoActual
					{
						valor = recibo.interes - planPago.interes;
						rc.creditoSeleccionado.saldoActual -= valor;
					}
					else if (recibo.interes < planPago.interes) //restar al saldoActual
					{
						valor = planPago.interes - recibo.interes
						rc.creditoSeleccionado.saldoActual += valor;
					}
					//----------------------------------------------------------------------
					if (recibo.iva > planPago.iva) //Sumar al saldoActual
					{
						valor = recibo.iva - planPago.iva;
						rc.creditoSeleccionado.saldoActual -= valor;
					}
					else if (recibo.iva < planPago.iva) //restar al saldoActual
					{
						valor = planPago.iva - recibo.iva
						rc.creditoSeleccionado.saldoActual += valor;
					}
					//----------------------------------------------------------------------
					if (recibo.seguro > planPago.seguro) //Sumar al saldoActual
					{
						valor = recibo.seguro - planPago.seguro;
						rc.creditoSeleccionado.saldoActual -= valor;
					}
					else if (recibo.seguro < planPago.seguro) //restar al saldoActual
					{
						valor = planPago.seguro - recibo.seguro
						rc.creditoSeleccionado.saldoActual += valor;
					}
					//----------------------------------------------------------------------
					rc.creditoSeleccionado.numeroPagos = planPago.numeroPagos;
					Creditos.update({ _id: rc.creditoSeleccionado._id },
						{
							$set: {
								saldoActual: rc.creditoSeleccionado.saldoActual,
								numeroPagos: rc.creditoSeleccionado.numeroPagos
							}
						})

				}

				var tempId = planPago._id;
				delete planPago._id;
				planPago.credito = {};
				delete planPago.credito;

				PlanPagos.update({ _id: tempId }, { $set: planPago });

			}

		});
		toastr.success('Actualizado correctamente.');


	};

	//--------------------------------------------------------------------
	this.getRecibos = function (credito_id) {
		rc.recibos = PlanPagos.find({ credito_id: credito_id, descripcion: "Recibo" }).fetch();

	};

	this.crearCargoMoratorio = function () {
		var user = Meteor.users.findOne(rc.distribuidor_id);
		if (user.profile.estatusCredito == undefined || user.profile.estatusCredito == 0) {
			toastr.warning("No se ha autorizado al distribuidor...");
			return;

		}
		else if (user.profile.estatusCredito == 2) {
			toastr.error("Se rechazó al distribuidor...");
			return;
		}
		else {
			rc.recibo._id = "";
			rc.recibo.importe = 0.00;
			$("#modalCargosMoratorios").modal('show');
		}


	};

	this.guardarCargoMoratorio = function (objeto) {
		if (rc.recibo._id == "") {
			toastr.error('Debe de seleccionar un recibo.');
			return;

		}

		var mfecha = moment(new Date());
		var pago = PlanPagos.findOne(rc.recibo._id);
		var multas = Number(rc.recibo.importe);
		var iva = 0;
		var interes = 0;

		var multa = {
			semana: mfecha.isoWeek(),
			fechaLimite: pago.fechaLimite,
			diaSemana: mfecha.weekday(),
			tipoPlan: pago.tipoPlan,
			numeroPago: pago.numeroPago,
			importeRegular: multas,
			cliente_id: pago.cliente_id,
			fechaPago: undefined,
			semanaPago: undefined,
			diaPago: undefined,
			iva: 0,
			interes: 0,
			seguro: 0,
			capital: 0,
			pago: 0,
			estatus: 0,
			multada: 0,
			multa: 0,
			multa_id: undefined,
			planPago_id: rc.recibo._id,
			tiempoPago: 0,
			modificada: false,
			pagos: [],
			descripcion: "Cargo Moratorio",
			ultimaModificacion: new Date(),
			credito_id: objeto.credito_id,
			mes: mfecha.get('month') + 1,
			anio: mfecha.get('year'),
			cargo: multas,
			movimiento: "Cargo Moratorio",
			tipoCargoMoratorio: 2	//Manual
		};

		var creditoSeleccionado = Creditos.findOne(objeto.credito_id);
		//console.log(creditoSeleccionado);


		var multa_id = PlanPagos.insert(multa);
		PlanPagos.update({ _id: rc.recibo._id }, { $set: { multada: 1, multa_id: multa_id } })
		var suma = multas + iva + interes;
		creditoSeleccionado.saldoMultas += suma;
		creditoSeleccionado.saldoMultas = Math.round(creditoSeleccionado.saldoMultas * 100) / 100;
		Creditos.update({ _id: objeto.credito_id }, { $set: { saldoMultas: creditoSeleccionado.saldoMultas, estatus: 4 } })

		$("#modalCargosMoratorios").modal('hide');
		toastr.success('Actualizado correctamente.');
	};
	//--------------------------------------------------------------------
	this.modificar = function (pago) {
		pago.editar = true;
	};

	this.actualizar = function (pago) {
		pago.editar = false;
	};

	this.sumarPago = function (pago) {

		_.each(rc.creditoSeleccionado.planPagos, function (planPago) {
			if (planPago.numeroPago == pago.numeroPago) {
				planPago.importeRegular = pago.capital + pago.interes + pago.iva + pago.seguro;
				planPago.cargo = pago.capital + pago.interes + pago.iva + pago.seguro;
			}
		});
	}

	this.cerrar = function () {

		var planPagos = PlanPagos.find({}, { sort: { numeroPago: 1, descripcion: -1 } }).fetch();
		if (rc.creditos && rc.creditos.length > 0 && planPagos.length > 0) {
			_.each(rc.creditos, function (credito) {
				credito.planPagos = [];
				credito.pagados = 0;
				credito.abonados = 0;
				credito.condonado = 0;
				credito.tiempoPago = 0;
				credito.pagos = 0;

				_.each(planPagos, function (pago) {

					pago.credito = Creditos.findOne(credito._id);

					if (pago.descripcion == "Recibo") {
						credito.pagos += pago.pago;
					}
					if (credito._id == pago.credito_id) {
						pago.numeroPagos = credito.numeroPagos;
						credito.planPagos.push(pago);
						if (pago.estatus == 0) {
							credito.pendientes++;
						} else if (pago.estatus == 1) {
							credito.pagados++;
						} else if (pago.estatus == 2) {
							credito.abonado++;
						} else if (pago.estatus == 3) {
							credito.condonado++;
						}

						if (pago.multada == 1) {
							credito.tiempoPago++;
						}
					}
				})
			})
		}

		rc.modalReestructuracion = false;


		/*
					var newArr = _.filter(rc.creditoSeleccionado.planPagos, function(planPago) { return planPago._id !== undefined; });			
					rc.creditoSeleccionado.planPagos = newArr;
		*/


	}

	this.cambioEstatusRespuesta = function () {
		this.respuestaNotaCLiente = !this.respuestaNotaCLiente;

	}

	this.seleccionContrato = function (contrato) {
		//console.log( contrato)

	}

	this.trance = function (credito) {
		//console.log("creditop",credito)

		Meteor.call('numeroALetras', credito.capitalSolicitado, function (error, result) {
			if (result) {
				//console.log("result",result)
				rc.cantidad = result
			}
			//console.log("cantidad",rc.cantidad)

		});
	};

	this.getAvales = function (credito) {
		//console.log(credito.avales_ids[0].aval_id)
		rc.avalpapu = credito.avales_ids[0].aval_id
		Meteor.call('obAvales', rc.avalpapu, function (error, result) {
			if (result) {
				//console.log("result",result)
				rc.avalesCliente = result.profile
			}
			//console.log("avales",rc.avalesCliente)

		});
	};

	this.recuperarCredito = function (id) {

		var r = confirm("Selecciona una opción");
		if (r == true) {
			var objeto = Creditos.findOne({ _id: id });
			if (objeto.estatus == 3)
				objeto.estatus = 1;
			else
				objeto.estatus = 3;

			Creditos.update({ _id: id }, { $set: { estatus: objeto.estatus } });

			toastr.success('Crédito Recuperado');
		} else {

		}
	};

	this.CreditoSolicitar = function (id, op) {

		var user = Meteor.users.findOne(rc.distribuidor_id);

		if (Meteor.user().roles[0] == "Distribuidor" && rc.cargosMoratorios > 0) {
			toastr.warning("Su cuenta muestra un atraso, hasta el momento que se ponga al corriente puede seguir disfrutando de su linea de crédito");
			return;
		}

		if (user.profile.estatusCredito == undefined || user.profile.estatusCredito == 0) {
			toastr.warning("No se ha autorizado al distribuidor...");
			return;

		}
		else if (user.profile.estatusCredito == 2) {
			toastr.error("Se rechazó al distribuidor...");
			return;
		}
		else if (op == 0)
			$state.go("root.generadorPlan", { objeto_id: id, op: 0 });
		else if (op == 1)
			$state.go("root.generadorPlan", { objeto_id: id, op: 1 });

	};

	this.btnCerrar = function () {

		rc.btnCerrarRespuesta = false

		// ui-sref="root.generadorPlan({objeto_id : cd.objeto._id})"
	};

	this.mostrarModalValidaBeneficiario = function (objeto, credito) {
		//console.log(objeto);
		//console.log(credito);
		rc.buscar = {};
		rc.buscar.nombreBeneficiado = objeto;
		Meteor.call("validaLimiteSaldoBeneficiarioDistribuidor", credito, function (error, result) {
			if (!result.beneficiario) {
				toastr.error('El Beneficiario rebasa el límite de crédito.');
				$("#entregar").prop("disabled", false);
				return;
			}
			else if (!result.distribuidor) {
				toastr.error('El Distribuidor rebasa el límite de crédito.');
				$("#entregar").prop("disabled", false);
				return;
			}
			else {
				rc.buscar.nombreBeneficiado = objeto;
				rc.vale_id = credito._id;
				rc.BeneficiadosDeudas = [];
				$("#modalvalidaBeneficiario").modal();
			}
		});

	};

	this.validarBeneficiado = function () {
		Meteor.call('getPersonasDeudas', rc.buscar.nombreBeneficiado, function (error, result) {
			if (result) {

				if (result.length == 0) {
					toastr.success("Sin Deudas puede autorizar")
				}
				else
					rc.BeneficiadosDeudas = result;

				$scope.$apply();
			}
		});
	};

	this.autorizarVale = function () {

		var credito = Creditos.findOne(rc.vale_id);

		Meteor.call('getBeneficiario', credito.beneficiario_id, function (error, result) {
			if (result) {
				var ben = result;
				if (ben.saldoActualVales > 0) {
					toastr.warning("El beneficiario " + rc.buscar.nombreBeneficiado + " tiene una deuda pendiente, no es posible autorizarle el Vale");
				}
				else {
					customConfirm('¿Estás seguro de Autorizar el vale?', function () {
						Creditos.update({ _id: rc.vale_id }, { $set: { estatus: 2 } });
						toastr.success("Se autorizó el vale.");
					});
				}
			}
		});

	}

	this.rechazarVale = function () {



		Creditos.update({ _id: rc.vale_id }, { $set: { estatus: 3 } });
		toastr.success("Se rechazo el vale.");


	}

	this.imprimirVales = function () {


		function currency(value, decimals, separators) {
			decimals = decimals >= 0 ? parseInt(decimals, 0) : 2;
			separators = separators || ['.', "'", ','];
			var number = (parseFloat(value) || 0).toFixed(decimals);
			if (number.length <= (4 + decimals))
				return number.replace('.', separators[separators.length - 1]);
			var parts = number.split(/[-.]/);
			value = parts[parts.length > 1 ? parts.length - 2 : 0];
			var result = value.substr(value.length - 3, 3) + (parts.length > 1 ?
				separators[separators.length - 1] + parts[parts.length - 1] : '');
			var start = value.length - 6;
			var idx = 0;
			while (start > -3) {
				result = (start > 0 ? value.substr(start, 3) : value.substr(0, 3 + start))
					+ separators[idx] + result;
				idx = (++idx) % 2;
				start -= 3;
			}
			return (parts.length == 3 ? '-' : '') + result;
		}

		var vales = rc.planPagos;

		if (vales != undefined) {
			_.each(vales, function (pago) {

				var fecha = new Date();
				var n = fecha.getDate();
				var mes = fecha.getMonth();

				var fechaPago = pago.fechaLimite;
				var nfp = fechaPago.getDate();
				var mesfp = fechaPago.getMonth();

				var comision = 0;

				if (mes == mesfp && n >= nfp) {
					switch (n) {
						case 1: comision = 15; break;
						case 2: comision = 14; break;
						case 3: comision = 13; break;
						case 4: comision = 12; break;
						case 5: comision = 11; break;
						case 6: comision = 10; break;
						case 7: comision = 9; break;
						case 8: comision = 8; break;
						case 16: comision = 15; break;
						case 17: comision = 14; break;
						case 18: comision = 13; break;
						case 19: comision = 12; break;
						case 20: comision = 11; break;
						case 21: comision = 10; break;
						case 22: comision = 9; break;
						case 23: comision = 8; break;
					}
				}

				pago.bonificacion = parseFloat(((pago.capital + pago.interes) * (comision / 100))).toFixed(2);

				var cre = Creditos.findOne({ _id: pago.credito_id });
				pago.beneficiado = cre.beneficiado;

				var user = Meteor.users.findOne(cre.cliente_id);
				pago.distribuidor = user.profile.nombreCompleto;

				pago.saldo = Number(parseFloat(pago.importeRegular - pago.bonificacion).toFixed(2));

				if (pago.descripcion == "Recibo")
					rc.subtotal += pago.importeRegular;
				else if (pago.descripcion == "Cargo Moratorio") {
					rc.cargosMoratorios += pago.importeRegular;
					//console.log("Entro: CM", pago)
				}
				pago.folio = cre.folio;

				var fecha = new Date();
				pago.fecha = fecha.getDate() + '/' + (fecha.getMonth() + 1) + '/' + fecha.getFullYear();

				var fechaLimite = new Date(pago.fechaLimite);
				pago.fechaV = fechaLimite.getDate() + '/' + (fechaLimite.getMonth() + 1) + '/' + fechaLimite.getFullYear();

				pago.importe = currency(pago.importeRegular, 2, [',', "'", '.']);
				pago.noPago = pago.numeroPago;

				pago.saldoNuevo = currency(Number(parseFloat(cre.saldoActual - pago.importeRegular).toFixed(2)), 2, [',', "'", '.']);



			});

		}
		var datos = {};
		datos.vales = vales;

		loading(true);
		Meteor.call('report', {
			templateNombre: 'vales',
			reportNombre: 'valesOut',
			type: 'pdf',
			datos: datos,
		}, function (err, file) {
			if (!err) {
				downloadFile(file);
			} else {
				toastr.warning("Error al generar el reporte");
			}
			loading(false);
		});


	}

	this.imprimirValesEntregados = function () {


		function currency(value, decimals, separators) {
			decimals = decimals >= 0 ? parseInt(decimals, 0) : 2;
			separators = separators || ['.', "'", ','];
			var number = (parseFloat(value) || 0).toFixed(decimals);
			if (number.length <= (4 + decimals))
				return number.replace('.', separators[separators.length - 1]);
			var parts = number.split(/[-.]/);
			value = parts[parts.length > 1 ? parts.length - 2 : 0];
			var result = value.substr(value.length - 3, 3) + (parts.length > 1 ?
				separators[separators.length - 1] + parts[parts.length - 1] : '');
			var start = value.length - 6;
			var idx = 0;
			while (start > -3) {
				result = (start > 0 ? value.substr(start, 3) : value.substr(0, 3 + start))
					+ separators[idx] + result;
				idx = (++idx) % 2;
				start -= 3;
			}
			return (parts.length == 3 ? '-' : '') + result;
		}

		if (rc.creditoCortes.length == 0) {
			toastr.warning("No hay datos para imprimir");
			return;
		}

		var datos = {};
		datos.numeroDistribuidor = rc.objeto.username;
		datos.distribuidor = rc.objeto.profile.nombreCompleto;
		datos.direccion = rc.objeto.profile.calle + ", N. " + rc.objeto.profile.numero + ", CP: " + rc.objeto.profile.codigoPostal; //+ ", Col: " +
		//rc.objeto.profile.colonia.nombre + ", " + rc.objeto.profile.ciudad.nombre;
		datos.telefonos = rc.objeto.profile.celular + ", " + rc.objeto.profile.particular;

		datos.cortes = [];

		_.each(rc.creditoCortes, function (corte) {
			var c = {};
			c.numeroCorte = corte.numeroCorte;
			c.fechaCorte = corte.fechaCorteInicio.getDate() + "-" + (corte.fechaCorteInicio.getMonth() + 1) + "-" + corte.fechaCorteInicio.getFullYear() + " - " +
				corte.fechaCorteFin.getDate() + "-" + (corte.fechaCorteFin.getMonth() + 1) + "-" + corte.fechaCorteFin.getFullYear();
			c.solicitado = currency(corte.capitalSolicitado, 2, [',', "'", '.']);
			c.adeudo = currency(corte.adeudoInicial, 2, [',', "'", '.']);
			c.actual = currency(corte.saldoActual, 2, [',', "'", '.']);
			c.cm = currency(corte.cargosMoratorios, 2, [',', "'", '.']);

			c.vales = [];

			var num = 1;
			_.each(corte.creditosHistorial, function (vale) {
				var v = {};
				v.num = num;
				v.vale = vale.folio;
				v.beneficiario = vale.beneficiario.nombreCompleto;
				v.fechaSol = vale.fechaSolicito.getDate() + "-" + (vale.fechaSolicito.getMonth() + 1) + "-" + vale.fechaSolicito.getFullYear();
				v.fechaEnt = vale.fechaEntrega.getDate() + "-" + (vale.fechaEntrega.getMonth() + 1) + "-" + vale.fechaEntrega.getFullYear();

				v.capSol = currency(vale.capitalSolicitado, 2, [',', "'", '.']);
				v.adeIni = currency(vale.adeudoInicial, 2, [',', "'", '.']);
				v.salAct = currency(vale.saldoActual, 2, [',', "'", '.']);
				v.cm = currency(vale.cargosMoratorios, 2, [',', "'", '.']);

				c.vales.push(v);
				num++;
			});

			datos.cortes.push(c)
		});



		loading(true);
		Meteor.call('report', {
			templateNombre: 'valesEntregados',
			reportNombre: 'valesEntregadosOut',
			type: 'pdf',
			datos: datos,
		}, function (err, file) {
			if (!err) {
				downloadFile(file);
			} else {
				toastr.warning("Error al generar el reporte");
			}
			loading(false);
		});


	}

	this.imprimirContrato = function () {

		loading(true);
		Meteor.call('contratoDistribuidor', rc.distribuidor_id, function (error, response) {
			if (error) {
				console.log('ERROR :', error);
				return;
			}
			if (response) {
				function b64toBlob(b64Data, contentType, sliceSize) {
					contentType = contentType || '';
					sliceSize = sliceSize || 512;

					var byteCharacters = atob(b64Data);
					var byteArrays = [];

					for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
						var slice = byteCharacters.slice(offset, offset + sliceSize);

						var byteNumbers = new Array(slice.length);
						for (var i = 0; i < slice.length; i++) {
							byteNumbers[i] = slice.charCodeAt(i);
						}

						var byteArray = new Uint8Array(byteNumbers);

						byteArrays.push(byteArray);
					}

					var blob = new Blob(byteArrays, { type: contentType });
					return blob;
				}

				var blob = b64toBlob(response, "application/docx");
				var url = window.URL.createObjectURL(blob);

				//console.log(url);
				var dlnk = document.getElementById('dwnldLnk');

				dlnk.download = "contrato.docx";
				dlnk.href = url;
				dlnk.click();
				window.URL.revokeObjectURL(url);
			}
		});
		loading(false);

	};

	this.imprimirTablaAmortizacion = function () {

		var datos = {};

		loading(true);
		Meteor.call('report', {
			templateNombre: "TablaAmortizacionBigBale",
			reportNombre: "TablaAmortizacionBigBaleOut",
			type: 'pdf',
			datos: datos,
		}, function (err, file) {
			if (!err) {
				downloadFile(file);
				loading(false);
			} else {
				toastr.warning("Error al generar el reporte");
				loading(false);
			}
		});



	};

	this.imprimirHistorial = function (objeto, cliente, credito) {
		cliente = rc.cliente.profile;
		loading(true);
		Meteor.call('imprimirHistorialVales', objeto, cliente, credito, 'pdf', rc.saldoMultas, rc.abonosRecibos, rc.abonosCargorMoratorios, rc.saldoGeneral, rc.sumaNotaCredito, function (error, response) {
			if (error) {
				console.log('ERROR :', error);
				loading(false);
				return;
			}
			else {
				downloadFile(response);
				loading(false);
			}
		});
	};

	this.mostrarTodos = function (valor) {
		var arreglo = {};

		var fecha = new Date();
		var n = fecha.getDate();
		var fechaLimite = "";

		if (n >= 22) {
			fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1, 0, 0, 0, 0);
		}
		else if (n <= 7) {
			fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0, 0);
		}
		else if (n > 7 && n < 22) {
			fechaLimite = new Date(fecha.getFullYear(), fecha.getMonth(), 16, 0, 0, 0, 0);
		}

		fechaLimite.setHours(23, 59, 59, 999);
		//console.log(fechaLimite);

		if (valor) {
			rc.planPagos = PlanPagos.find({ importeRegular: { $gt: 0 } }, { sort: { fechaLimite: 1 } }).fetch();
		}
		else {
			rc.planPagos = PlanPagos.find({ fechaLimite: { $lte: fechaLimite }, importeRegular: { $gt: 0 } }, { sort: { fechaLimite: 1 } }).fetch();
		}

		rc.importe = 0;
		rc.cargosMoratorios = 0;
		rc.bonificacion = 0;

		var configuraciones = Configuraciones.findOne();

		_.each(rc.planPagos, function (pp) {
			var credito = Creditos.findOne(pp.credito_id);
			if (credito != undefined && credito.beneficiario_id != undefined) {
				Meteor.call('getBeneficiario', credito.beneficiario_id, function (error, result) {
					if (result) {
						pp.beneficiario = result;
						$scope.$apply();
					}
				});
			}

			if (pp.descripcion == "Cargo Moratorio")
				pp.orden = 2;
			else
				pp.orden = 1;

			if (credito.tipo == "vale") {
				var comision = 0;
				comision = calculaBonificacion(pp.fechaLimite, configuraciones.arregloComisiones);
				pp.bonificacion = parseFloat(((pp.capital + pp.interes) * (comision / 100))).toFixed(2);
				rc.bonificacion += Number(parseFloat(pp.bonificacion).toFixed(2));
			}
			else if (credito.tipo == "creditoPersonalDistribuidor") {
				pp.bonificacion = 0;
				pp.beneficiario = {};
				pp.beneficiario.nombreCompleto = "CRÉDITO PERSONAL";
			}

			if (pp.descripcion == 'Recibo')
				rc.importe += pp.importeRegular;
			else if (pp.descripcion == 'Cargo Moratorio')
				rc.cargosMoratorios += pp.importeRegular;

			pp.numeroPagos = credito.numeroPagos;

			//Meterlo al arregloCortes							
			var numeroCorte = 0;
			if (pp.fechaLimite.getDate() >= 15) {

				numeroCorte = pp.fechaLimite.getMonth() * 2;
				var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 22);
				var fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth(), 06);
			}
			else {
				var m = pp.fechaLimite.getMonth();
				if (m == 0) {
					numeroCorte = 12 * 2 - 1;
					var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear() - 1, 11, 07);
					var fechaCorteFin = new Date(pp.fechaLimite.getFullYear() - 1, 11, 21);
				}
				else {
					numeroCorte = pp.fechaLimite.getMonth() * 2 - 1;
					var fechaCorteInicio = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 07);
					var fechaCorteFin = new Date(pp.fechaLimite.getFullYear(), pp.fechaLimite.getMonth() - 1, 21);
				}
			}

			if (arreglo[numeroCorte] == undefined) {
				arreglo[numeroCorte] = {};

				arreglo[numeroCorte].numeroCorte = numeroCorte;
				arreglo[numeroCorte].fechaCorteInicio = fechaCorteInicio;
				arreglo[numeroCorte].fechaCorteFin = fechaCorteFin;
				arreglo[numeroCorte].fechaPago = pp.fechaLimite;
				arreglo[numeroCorte].importe = 0;
				arreglo[numeroCorte].cargosMoratorios = 0;
				arreglo[numeroCorte].seguro = 0;

				if (pp.fechaLimite != undefined)
					Meteor.call("getPagoSeguro", $stateParams.objeto_id, pp.fechaLimite.getFullYear(), numeroCorte, function (error, result) {
						if (error) {
							toastr.error('Error al obtener pagos: ', error.details);
							return
						}
						if (result) {
							arreglo[numeroCorte].seguro = result;
							$scope.$apply();
						}
					});

				if (pp.descripcion == 'Recibo')
					arreglo[numeroCorte].importe = pp.importeRegular;
				else
					arreglo[numeroCorte].cargosMoratorios = pp.importeRegular;

				arreglo[numeroCorte].bonificacion = Number(pp.bonificacion);

				//arreglo[numeroCorte].fechaCorte = fechaCorte;
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

		rc.arregloCortes = _.toArray(arreglo);

	};

	this.verHistorial = function (pago) {

		var credito = Creditos.findOne({ folio: pago.folioCredito });

		rc.pagoDis = pago;
		rc.credito = credito;
		rc.credito_id = credito._id;

		var planes = PlanPagos.find({ credito_id: credito._id }, {
			sort: {
				numeroPago: 1,
				fechaLimite: 1,
				descripcion: -1
			}
		}).fetch();

		arreglo = [];

		var saldoPago = 0;
		var saldoActual = 0;
		rc.saldo = 0;
		rc.saldoGeneral = 0;
		rc.sumaNotaCredito = 0;
		//var credito 				= rc.credito
		rc.saldoMultas = 0;

		rc.abonosRecibos = 0;
		rc.abonosCargorMoratorios = 0;

		_.each(planes, function (planPago) {

			if (planPago.descripcion == "Recibo")
				rc.saldo += Number(parseFloat(planPago.cargo).toFixed(2));
			if (planPago.descripcion == "Cargo Moratorio")
				//rc.saldoMultas += Number(parseFloat(planPago.importeRegular).toFixed(2));
				rc.saldoMultas += Number(planPago.importeRegular + planPago.pago);

			planPago.cantidad = credito.numerosPagos;
		});

		rc.saldo = Number(parseFloat(rc.saldo).toFixed(2));
		rc.saldoMultas = Number(parseFloat(rc.saldoMultas).toFixed(2));
		rc.pagos_ids = [];

		_.each(planes, function (planPago, index) {

			var sa = 0;
			var cargoCM = 0;
			if (planPago.descripcion == 'Recibo') {
				sa = Number(parseFloat(planPago.cargo - (planPago.pagoInteres + planPago.pagoIva + planPago.pagoCapital + planPago.pagoSeguro)).toFixed(2));
				planPago.fechaLimite.setHours(0, 0, 0, 0);
			}
			else if (planPago.descripcion == 'Cargo Moratorio') {
				sa = Number(parseFloat(planPago.importeRegular).toFixed(2));
				planPago.fechaLimite.setHours(1, 0, 0, 0);
				cargoCM = Number(planPago.importeRegular + planPago.pago);
			}
			//console.log(planPago.descripcion);

			arreglo.push({
				saldo: rc.saldo,
				numeroPago: planPago.numeroPago,
				cantidad: rc.credito.numeroPagos,
				fechaSolicito: rc.credito.fechaSolicito,
				fecha: planPago.fechaLimite,
				pago: 0,
				cargo: planPago.descripcion == "Recibo" ? planPago.cargo : cargoCM,
				movimiento: planPago.movimiento,
				planPago_id: planPago._id,
				credito_id: planPago.credito_id,
				descripcion: planPago.descripcion,
				importe: planPago.importeRegular,
				pagos: planPago.pagos,
				notaCredito: 0,
				saldoActualizado: planPago.pagos.length == 0 ? planPago.importeRegular : sa

			});

			if (planPago.pagos.length > 0) {
				_.each(planPago.pagos, function (pago) {
					if (pago.estatus != 3)
						rc.pagos_ids.push(pago.pago_id);
				});

				_.each(planPago.pagos, function (pago) {

					//Ir por la Forma de Pago
					if (pago.estatus != 3) {
						var formaPago = "";
						var pag = Pagos.findOne(pago.pago_id);
						if (pag != undefined) {
							var ti = TiposIngreso.findOne(pag.tipoIngreso_id);
							if (ti != undefined)
								formaPago = ti.nombre;
						}

						if (planPago.descripcion == 'Recibo')
							rc.abonosRecibos += pago.totalPago;
						else if (planPago.descripcion == "Cargo Moratorio")
							rc.abonosCargorMoratorios += pago.totalPago;

						if (formaPago == 'Nota de Credito')
							rc.sumaNotaCredito += pago.totalPago;

						arreglo.push({
							saldo: rc.saldo,
							numeroPago: planPago.numeroPago,
							cantidad: credito.numeroPagos,
							fechaSolicito: rc.credito.fechaSolicito,
							fecha: pago.fechaPago,
							pago: pago.totalPago,
							cargo: 0,
							movimiento: planPago.descripcion == "Cargo Moratorio" ? "Abono a CM" : "Abono",
							planPago_id: planPago._id,
							credito_id: planPago.credito_id,
							descripcion: planPago.descripcion == "Cargo Moratorio" ? "Abono a CM" : "Abono",
							importe: planPago.importeRegular,
							pagos: planPago.pagos,
							notaCredito: formaPago == 'Nota de Credito' ? pago.totalPago : 0,
							saldoActualizado: 0
						});
					}

				});
			}

		});

		rc.saldoGeneral = (rc.saldo + rc.saldoMultas) - (rc.abonosRecibos + rc.abonosCargorMoratorios);

		arreglo.sort(function (a, b) {
			return a.numeroPago - b.numeroPago || new Date(a.fecha) - new Date(b.fecha);
		});

		_.each(arreglo, function (item, index) {
			if (index > 0) {
				if (item.descripcion == "Cargo Moratorio")
					rc.saldo += Number(parseFloat(item.cargo).toFixed(2));
				else if (item.movimiento == "Abono" || item.movimiento == "Abono a CM")
					rc.saldo -= Number(parseFloat(item.pago).toFixed(2));
			}
			item.saldo = rc.saldo;
		});

		rc.historial = arreglo;


		$("#modalpagosHistorico").modal();
		//credito.pagos = Pagos.find({credito_id: rc.getReactively("credito_id")}).fetch();

		//rc.pagos = credito.pagos
		rc.openModal = true;
	};

	this.imprimirPagare = function (id) {
		//Imprimir Pagare
		var url = $state.href("anon.ticketPagare", { credito_id: id }, { newTab: true });
		window.open(url, '_blank');
	};

	this.imprimirAmortizacion = function (id) {
		//Imprimir Tabla Amortización
		var url = $state.href("anon.ticketAmortizacion", { credito_id: id }, { newTab: true });
		window.open(url, '_blank');
	};

	this.imprimirVale = function (id) {
		//Imprimir Vale
		var url = $state.href("anon.ticketEntregaVale", { credito_id: id }, { newTab: true });
		window.open(url, '_blank');
	};

	//Cambiar limite de Credito
	this.modalLimiteCredito = function () {
		rc.bitacoraLimiteCredito = [];

		Meteor.call('getBitacoraLimiteCreditoDistribuidor', rc.distribuidor_id, function (error, result) {
			if (result) {
				rc.bitacoraLimiteCredito = result;
				$scope.$apply();
			}
		});

		rc.oldLimiteCredito = rc.objeto.profile.limiteCredito;
		$("#modalLimiteCredito").modal('show');

	}

	this.actualizarLimiteCredito = function (objeto) {
		var temp = Number(rc.objeto.profile.saldoCredito);
		var incrementoDecremento = round(Number(parseFloat(rc.objeto.profile.limiteCredito - rc.oldLimiteCredito).toFixed(3)), 2);

		//console.log("incremento:", incrementoDecremento);
		//console.log("Limite Antes:", rc.oldLimiteCredito);
		//console.log("Saldo:", rc.objeto.profile.saldoCredito);

		var bitacora = {};
		if (incrementoDecremento > 0) {
			// if (rc.oldLimiteCredito > rc.objeto.profile.saldoCredito) {
			// 	toastr.error('No puede ser menor al saldo del crédito.');
			// 	rc.objeto.profile.saldoCredito = Number(temp);
			// 	return;
			// }
			incrementoDecremento = incrementoDecremento * -1;
			rc.objeto.profile.saldoCredito += round(Number(parseFloat(incrementoDecremento).toFixed(3)), 2);
			bitacora.movimiento = "Decremento";

			rc.objeto.profile.saldoCredito = round(Number(parseFloat(rc.objeto.profile.saldoCredito).toFixed(3)), 2);
			if (rc.objeto.profile.saldoCredito < 0) {
				toastr.error('Con el decremento asignado al limite de crédito, el saldo da negativo revise la cantidad del límite de crédito.');
				rc.objeto.profile.saldoCredito = Number(temp);
				return;
			}

		}
		else {
			incrementoDecremento = incrementoDecremento * -1;
			rc.objeto.profile.saldoCredito += round(Number(parseFloat(incrementoDecremento).toFixed(3)), 2);
			bitacora.movimiento = "Incremento";
		}

		if (incrementoDecremento == 0) {
			toastr.error('No hubo cambios en el límite de crédito');
			return;
		}

		bitacora.distribuidor_id = rc.distribuidor_id
		bitacora.fecha = new Date();
		bitacora.usuario_id = Meteor.userId();
		bitacora.limiteCredito = rc.oldLimiteCredito;
		bitacora.saldoCredito = rc.objeto.profile.saldoCredito;

		Meteor.call('setBitacoraLimiteCreditoDistribuidor', bitacora, function (error, result) {
			if (result) {
				rc.bitacoraLimiteCredito = result;
				$scope.$apply();
			}
		});

		$("#modalLimiteCredito").modal('hide');

	}

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

		//comision = comisionMayor;

		//console.log("Comision ini:", comision);

		if (dias > 6) {
			comision = 0;
		}
		else if (dias <= 0) {
			//Comisión Mayor
			//comision = 15;
			comision = comisionMayor;
		}
		else if (dias <= 6) {

			var fechaPago = new Date(fecha1);
			//console.log("fechaPago:", fechaPago);
			var nfp = fechaPago.getDate();
			var mesfp = fechaPago.getMonth();
			//console.log(nfp);

			comision = 0;

			_.each(arregloComisiones, function (c) {
				if (c.valor1 == nfp || c.valor2 == nfp)
					comision = c.porcentaje;
			});

			/*
			switch(nfp)
			{
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
*/

		}

		//console.log("Comision:", comision);

		return comision;

	};

	this.imprimirEstadoCuenta = function () {

		var creditos_ids = _.pluck(Creditos.find({ cliente_id: rc.distribuidor_id, estatus: 4 }).fetch(), '_id');

		Meteor.call('getEstadoCuenta', creditos_ids, rc.distribuidor_id, function (error, result) {
			if (result) {

				var corte = [];

				corte = result.corte;

				Number.prototype.format = function (n, x) {
					var re = '(\\d)(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
					return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$1,');
				};

				var sumaImp = 0;
				var sumaCM = 0;
				var sumaBon = 0;
				var sumaSeg = 0;
				var sumaTot = 0;

				_.each(corte, function (c) {
					sumaImp += c.importe;
					sumaCM += c.cargosMoratorios;
					sumaSeg += c.seguro;
					sumaBon += c.bonificacion;
					sumaTot += (c.importe + c.cargosMoratorios + c.seguro - c.bonificacion);

					c.total = '$' + Number(c.seguro + c.importe + c.cargosMoratorios - c.bonificacion).format(2);
					c.seguro = '$' + Number(c.seguro).format(2);
					c.importe = '$' + Number(c.importe).format(2);
					c.bonificacion = '$' + Number(c.bonificacion).format(2);
					c.cargosMoratorios = '$' + Number(c.cargosMoratorios).format(2);
				});

				var objeto = {}
				objeto.cliente = result;

				var datos = {};

				datos.corte = corte;

				datos.distribuidor = result.cliente.profile.nombreCompleto;
				datos.numeroDistribuidor = result.cliente.profile.numeroCliente;
				datos.direccion = result.cliente.profile.calle +
					' #' + result.cliente.profile.numero +
					' Col.' + result.cliente.profile.colonia +
					' CP:' + result.cliente.profile.codigoPostal;

				datos.telefonos = result.cliente.profile.celular + ' y ' + result.cliente.profile.particular;

				datos.limiteCredito = '$' + Number(result.cliente.profile.limiteCredito).format(2);
				datos.disponible = '$' + Number(result.cliente.profile.limiteCredito - (result.cliente.profile.limiteCredito - result.cliente.profile.saldoCredito)).format(2);
				datos.saldo = '$' + Number(result.cliente.profile.limiteCredito - result.cliente.profile.saldoCredito).format(2);

				datos.sumaImp = '$' + Number(sumaImp).format(2);
				datos.sumaCM = '$' + Number(sumaCM).format(2);
				datos.sumaSeg = '$' + Number(sumaSeg).format(2);
				datos.sumaBon = '$' + Number(sumaBon).format(2);
				datos.sumaTot = '$' + Number(sumaTot).format(2);

				datos.planPagos = [];
				datos.creditos = [];

				datos.prestamos = 0;
				datos.saldoAnterior = 0;
				datos.pagoVigente = 0;
				datos.saldoActual = 0;

				datos.valesAlCorte = 0;
				datos.nuevosVales = 0;
				datos.valesUltimoPago = 0;

				//datos.fechaCreacion = objeto.cliente.profile.fechaCreacion;

				var configuracion = Configuraciones.findOne();
				var arregloComisiones = configuracion.arregloComisiones;
				var arregloBonificaciones = [0, 0, 0, 0, 0];

				_.each(objeto.planPagos, function (pp) {
					var pago = {};


					if (pp.beneficiario != "CRÉDITO PERSONAL" && pp.movimiento != "Cargo Moratorio") {

						pago.beneficiario = pp.beneficiario;
						pago.folio = pp.folio;
						pago.fechaLimite = pp.fechaLimite;
						pago.numeroPagos = pp.numeroPago.toString() + "-" + pp.numeroPagos.toString();

						pago.adeudoInicial = '$' + Number(pp.adeudoInicial).format(2);
						pago.saldoAnterior = '$' + Number(pp.saldoActual).format(2);
						pago.saldoActual = '$' + Number(parseFloat(pp.saldoActual - pp.importeRegular).toFixed(2)).format(2);

						pago.impReg = '$' + Number(pp.importeRegular).format(2);

						datos.aLiberar += round(Number(parseFloat(pp.capital).toFixed(3)), 2);

						if (pp.movimiento == "Recibo") {
							//NO SUMAR iva y Seguro
							if (pp.bonificacion > 0) {
								sumaBonificacion += round(Number(parseFloat(pp.capital + pp.interes).toFixed(3)), 2);

								for (i = 1; i <= 5; i++) {
									_.each(arregloComisiones, function (c) {
										if (c.numero == i + 1) {
											arregloBonificaciones[i - 1] += round(Number(parseFloat((pp.capital + pp.interes) * (c.porcentaje / 100))).toFixed(3), 2);
											arregloBonificaciones[i - 1] = round(Number(arregloBonificaciones[i - 1]).toFixed(3), 2);
										}
									});
								}

								sumaConComision += round(Number(parseFloat(pp.importeRegular).toFixed(3)), 2);
							}

							else
								sumaSinComision += round(Number(parseFloat(pp.importeRegular).toFixed(3)), 2);
							pago.tipo = "V";

						}

						if (pp.fechaLimite >= fechaCorteFin) {
							datos.valesAlCorte++;
							if (pp.numeroPago == 1)
								datos.nuevosVales++;
							if (pp.numeroPago == pp.numeroPagos)
								datos.valesUltimoPago++;

							datos.prestamos += round(Number(parseFloat(pp.adeudoInicial).toFixed(3)), 2);
							datos.saldoAnterior += round(Number(parseFloat(pp.saldoActual).toFixed(3)), 2);
							datos.pagoVigente += round(Number(parseFloat(pp.importeRegular).toFixed(3)), 2);
							datos.saldoActual += round(Number(parseFloat(pp.saldoActual - pp.importeRegular).toFixed(3)), 2);
							datos.planPagos.push(pago);
						}

					}
					else if (pp.movimiento == "Cargo Moratorio") {
						cargosMoratorios += pp.importeRegular;
					}
					else if (pp.beneficiario == "CRÉDITO PERSONAL") {
						creditosPersonales += round(Number(parseFloat(pp.importeRegular).toFixed(3)), 2);

						if (pp.fechaLimite >= fechaCorteFin) {
							pago.folio = pp.folio;
							pago.fechaLimite = pp.fechaLimite;
							pago.numeroPagos = pp.numeroPago.toString() + "-" + pp.numeroPagos.toString();

							pago.adeudoInicial = '$' + Number(pp.adeudoInicial).format(2);
							pago.saldoAnterior = '$' + Number(pp.saldoActual).format(2);
							pago.saldoActual = '$' + Number(parseFloat(pp.saldoActual - pp.importeRegular).toFixed(2)).format(2);

							pago.impReg = '$' + Number(pp.importeRegular).format(2);

							datos.creditos.push(pago);
						}
					}
				});

				datos.aLiberar = '$' + Number(datos.aLiberar).format(2);
				datos.prestamos = '$' + Number(datos.prestamos).format(2);
				datos.saldoAnterior = '$' + Number(datos.saldoAnterior).format(2);
				datos.pagoVigente = '$' + Number(datos.pagoVigente).format(2);
				datos.saldoActual = '$' + Number(datos.saldoActual).format(2);

				//Imprimir estado de cuenta
				loading(true);
				Meteor.call('report', {
					templateNombre: "EstadoCuenta",
					reportNombre: "Edo_" + result.cliente.profile.numeroCliente,
					type: 'pdf',
					datos: datos,
				}, function (err, file) {
					if (!err) {
						loading(false);
						$("#modalVerListado").modal('hide');
						downloadFile(file);
					} else {
						toastr.warning("Error al generar el reporte");
						loading(false);
					}
				});

			}
		});
	};

	this.editarNotaModal = function (valor) {
		rc.editarNota = valor;
	};
	this.actualizarNota = function (objeto) {
		Notas.update({ _id: objeto._id }, { $set: { descripcion: objeto.descripcion, fecha: new Date() } })
		rc.editarNota = false;
	};

	function round(value, decimals) {
		return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
	}


}