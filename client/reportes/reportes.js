angular.module("creditoMio")
	.controller("ReportesCtrl", ReportesCtrl);
function ReportesCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {

	rc = $reactive(this).attach($scope);
	window.rc = rc;

	this.fechaInicial = new Date();
	this.fechaInicial.setHours(0, 0, 0, 0);
	this.fechaFinal = new Date();
	this.fechaFinal.setHours(23, 59, 59, 999);

	rc.buscar = {};
	rc.buscar.nombre = "";
	rc.credito_id = "";
	this.clientes_id = [];
	rc.sumaCapital = 0;
	rc.sumaInteres = 0;
	rc.sumaIva = 0;
	rc.sumaSeguro = 0;
	rc.sumaSeguroDistribuidor = 0;
	rc.sumaBonificaciones = 0;
	rc.sumaCargoMoratorio = 0;
	rc.sumaOtrasSucursales = 0;

	rc.sumaCreditos = 0;
	rc.sumaVales = 0;

	rc.totalCobranza = 0;

	rc.totalSolicitadoVales = 0;
	rc.totalPagarVales = 0;
	rc.numeroVales = 0;

	rc.totalSolicitadoCreditos = 0;
	rc.totalPagarCreditos = 0;
	rc.numeroCreditos = 0;

	rc.totalSolicitadoCreditosD = 0;
	rc.totalPagarCreditosD = 0;
	rc.numeroCreditosD = 0;


	rc.totalSeguro = 0;

	var FI, FF;
	rc.cliente = {};
	rc.credito = {};

	rc.historialCrediticio = {};
	rc.reportesPago = {};
	rc.cobranza = {};


	rc.planPagos = [];
	rc.planPagoOriginal = [];

	rc.ihistorialCrediticio = [];

	rc.cobranza_id = "";
	rc.notaCobranza = {};

	rc.totalRecibos = 0;
	rc.totalMultas = 0;
	rc.seleccionadoRecibos = 0;
	rc.seleccionadoMultas = 0;

	rc.sucursal_id = Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "";

	this.selected_credito = 0;
	this.ban = false;
	this.respuestaNotaCLiente = false;
	this.diarioCobranza = false
	this.movimientoCuenta = false
	this.diarioCreditos = false
	this.caja = { _id: 0 };
	this.pagos_id = [];

	rc.arregloTiposIngresos = [];
	rc.arregloTiposIngresosobjetos = [];
	rc.arregloCarteraVencida = [];


	this.subscribe("tiposCredito", () => {
		return [{}]
	});

	this.subscribe('cuentas', () => {
		return [{ estatus: 1 }]
	});

	this.subscribe('cajas', () => {
		return [{ sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});

	this.subscribe('tiposIngreso', () => {
		return [{}]
	});

	this.helpers({


	});


	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	this.diarioCobranza = function () {

		var usuario = Meteor.user();

		rc.fechaInicial.setHours(0, 0, 0, 0);

		if (Meteor.user().roles[0] == "Supervisor") {

			rc.fechaFinal = new Date(rc.fechaInicial);
			rc.fechaFinal.setHours(23, 59, 59, 999);
		}
		else
			rc.fechaFinal.setHours(23, 59, 59, 999);


		rc.sumaCapital = 0;
		rc.sumaInteres = 0;
		rc.sumaIva = 0;
		rc.sumaSeguro = 0;

		rc.totalCobranza = 0;
		rc.sumaCreditos = 0;
		rc.sumaVales = 0;
		rc.sumaCargoMoratorio = 0;
		rc.sumaOtrasSucursales = 0;

		rc.planPagos = [];
		rc.arregloTiposIngresos = [];
		rc.arregloTiposIngresosobjetos = [];
		rc.arregloSeguroDistribuidor = [];
		rc.arregloOtrasSucursales = [];

		loading(true);
		Meteor.call("getCobranzaDiaria", this.fechaInicial, this.fechaFinal, usuario.profile.sucursal_id, function (error, result) {
			if (result) {
				//console.log(result);
				if (result.bandera == undefined) {
					rc.planPagoOriginal = result.cobranza;
					rc.planPagos = result.cobranza;
					rc.arregloSeguroDistribuidor = result.seguroDistribuidorCobranza;
					rc.arregloOtrasSucursales = _.toArray(result.otrasSucursales)

					rc.sumaSeguroDistribuidor = result.seguroDistribuidor;
					rc.sumaBonificaciones = result.bonificaciones;
					rc.sumaOtrasSucursales = result.sumaOtrasSucursales;


					_.each(rc.planPagos, function (plan) {

						if (plan.tipoIngreso != 'Nota de Credito') {

							if (plan.pagoInteres == undefined) plan.pagoInteres = 0;
							rc.sumaInteres += Number(parseFloat(plan.pagoInteres).toFixed(2));
							if (plan.pagoSeguro == undefined) plan.pagoSeguro = 0;
							rc.sumaSeguro += Number(parseFloat(plan.pagoSeguro).toFixed(2));
							if (plan.pagoIva == undefined) plan.pagoIva = 0;
							rc.sumaIva += Number(parseFloat(plan.pagoIva).toFixed(2));
							if (plan.pagoCapital == undefined) plan.pagoCapital = 0;
							rc.sumaCapital += Number(parseFloat(plan.pagoCapital).toFixed(2));

							if (plan.bonificacion == undefined)
								plan.bonificacion = 0;

							plan.totalPago = Number(parseFloat(plan.totalPago - plan.bonificacion)).toFixed(2);


							if (plan.descripcion == "Cargo Moratorio")
								rc.sumaCargoMoratorio += Number(parseFloat(plan.totalPago).toFixed(2));

							//if (plan.tipoIngreso != 'Nota de Credito')
							rc.totalCobranza += Number(parseFloat(plan.totalPago).toFixed(2));

							if (plan.tipoCredito == "creditoP" && plan.tipoIngreso != 'Nota de Credito')
								rc.sumaCreditos += Number(parseFloat(plan.totalPago).toFixed(2));
							else if (plan.tipoCredito == "vale" && plan.tipoIngreso != 'Nota de Credito') {
								rc.sumaVales += Number(parseFloat(plan.totalPago).toFixed(2));
							}

							if (plan.descripcion == "Cargo Moratorio")
								plan.descripcion = "C. Moratorio";
							else if (plan.tipoCredito == "vale")
								plan.descripcion = "Vale";

						}

						if (rc.arregloTiposIngresos[plan.tipoIngreso] == undefined)
							rc.arregloTiposIngresos[plan.tipoIngreso] = Number(parseFloat(plan.totalPago).toFixed(2));
						else
							rc.arregloTiposIngresos[plan.tipoIngreso] += Number(parseFloat(plan.totalPago).toFixed(2));

					});

					_.each(rc.arregloSeguroDistribuidor, function (seguro) {

						if (rc.arregloTiposIngresos[seguro.tipoIngreso] == undefined)
							rc.arregloTiposIngresos[seguro.tipoIngreso] = Number(parseFloat(seguro.seguro).toFixed(2));
						else
							rc.arregloTiposIngresos[seguro.tipoIngreso] += Number(parseFloat(seguro.seguro).toFixed(2));

					});

					for (var key in rc.arregloTiposIngresos) {
						rc.arregloTiposIngresosobjetos.push({ tipoPago: key, total: rc.arregloTiposIngresos[key] })
					}


				}
				else {

					alert("Revisar el folio de pago " + result.folio + " del cajero :" + result.cajero);

					/*
					customConfirm('Revisar el folio de pago ' + result.folio, function() {
							
							
							
					});
*/

				}


				//console.log(rc.arregloSeguroDistribuidor);

				loading(false);
				$scope.$apply();
			}
			else {
				loading(false);
			}
		});

	};

	this.creditosEntregadosFecha = function () {

		var usuario = Meteor.user();

		rc.fechaInicial.setHours(0, 0, 0, 0);

		if (Meteor.user().roles[0] == "Supervisor") {
			rc.fechaFinal = new Date(rc.fechaInicial);
			rc.fechaFinal.setHours(23, 59, 59, 999);
		}
		else
			rc.fechaFinal.setHours(23, 59, 59, 999);

		rc.totalSolicitadoVales = 0;
		rc.totalPagarVales = 0;
		rc.numeroVales = 0;

		rc.totalSolicitadoCreditos = 0;
		rc.totalPagarCreditos = 0;
		rc.numeroCreditos = 0;

		rc.totalSolicitadoCreditosD = 0;
		rc.totalPagarCreditosD = 0;
		rc.numeroCreditosD = 0;

		rc.creditosEntregados = [];

		loading(true);
		Meteor.call("getCreditosEntregados", this.fechaInicial, this.fechaFinal, usuario.profile.sucursal_id, function (error, result) {
			if (result) {
				rc.creditosEntregados = result;

				_.each(rc.creditosEntregados, function (credito) {

					if (credito.tipo == "creditoP") {
						rc.numeroCreditos += 1;

						if (credito.capitalSolicitado == undefined) plan.capitalSolicitado = 0;
						rc.totalSolicitadoCreditos += Number(parseFloat(credito.capitalSolicitado).toFixed(2));
						if (credito.adeudoInicial == undefined) plan.adeudoInicial = 0;
						rc.totalPagarCreditos += Number(parseFloat(credito.adeudoInicial).toFixed(2));

					}
					else if (credito.tipo == "vale") {
						rc.numeroVales += 1;

						if (credito.capitalSolicitado == undefined) plan.capitalSolicitado = 0;
						rc.totalSolicitadoVales += Number(parseFloat(credito.capitalSolicitado).toFixed(2));
						if (credito.adeudoInicial == undefined) plan.adeudoInicial = 0;
						rc.totalPagarVales += Number(parseFloat(credito.adeudoInicial).toFixed(2));

					}
					else if (credito.tipo == "creditoPersonalDistribuidor") {
						rc.numeroCreditosD += 1;

						if (credito.capitalSolicitado == undefined) plan.capitalSolicitado = 0;
						rc.totalSolicitadoCreditosD += Number(parseFloat(credito.capitalSolicitado).toFixed(2));
						if (credito.adeudoInicial == undefined) plan.adeudoInicial = 0;
						rc.totalPagarCreditosD += Number(parseFloat(credito.adeudoInicial).toFixed(2));
					}


				});
				loading(false);
				$scope.$apply();
			}
		});

	};

	this.creditosLiquidadosFecha = function () {

		var usuario = Meteor.user();

		rc.fechaInicial.setHours(0, 0, 0, 0);
		if (Meteor.user().roles[0] == "Supervisor") {
			rc.fechaFinal = new Date(rc.fechaInicial);
			rc.fechaFinal.setHours(23, 59, 59, 999);
		}
		else
			rc.fechaFinal.setHours(23, 59, 59, 999);

		rc.totalSolicitadoVales = 0;
		rc.totalPagarVales = 0;
		rc.totalSolicitadoCreditos = 0;
		rc.totalPagarCreditos = 0;

		rc.numeroCreditos = 0;
		rc.numeroVales = 0;

		rc.creditosLiquidados = [];

		loading(true);
		Meteor.call("getCreditosLiquidados", this.fechaInicial, this.fechaFinal, usuario.profile.sucursal_id, function (error, result) {
			if (result) {
				rc.creditosLiquidados = result;

				_.each(rc.creditosLiquidados, function (credito) {

					if (credito.tipo == "creditoP") {
						rc.numeroCreditos += 1;

						if (credito.capitalSolicitado == undefined) plan.capitalSolicitado = 0;
						rc.totalSolicitadoCreditos += Number(parseFloat(credito.capitalSolicitado).toFixed(2));
						if (credito.adeudoInicial == undefined) plan.adeudoInicial = 0;
						rc.totalPagarCreditos += Number(parseFloat(credito.adeudoInicial).toFixed(2));

					}
					else if (credito.tipo == "vale") {
						rc.numeroVales += 1;

						if (credito.capitalSolicitado == undefined) plan.capitalSolicitado = 0;
						rc.totalSolicitadoVales += Number(parseFloat(credito.capitalSolicitado).toFixed(2));
						if (credito.adeudoInicial == undefined) plan.adeudoInicial = 0;
						rc.totalPagarVales += Number(parseFloat(credito.adeudoInicial).toFixed(2));

					}
					else if (credito.tipo == "creditoPersonalDistribuidor") {
						rc.numeroCreditosD += 1;

						if (credito.capitalSolicitado == undefined) plan.capitalSolicitado = 0;
						rc.totalSolicitadoCreditosD += Number(parseFloat(credito.capitalSolicitado).toFixed(2));
						if (credito.adeudoInicial == undefined) plan.adeudoInicial = 0;
						rc.totalPagarCreditosD += Number(parseFloat(credito.adeudoInicial).toFixed(2));
					}


				});
				loading(false);
				$scope.$apply();
			}
		});

	};

	this.diarioBancos = function () {

		var usuario = Meteor.user();

		rc.fechaInicial.setHours(0, 0, 0, 0);
		rc.fechaFinal.setHours(23, 59, 59, 999);

		rc.sumaCapital = 0;
		rc.sumaInteres = 0;
		rc.sumaIva = 0;
		rc.sumaSeguro = 0;

		rc.totalCobranza = 0;
		rc.sumaCreditos = 0;
		rc.sumaVales = 0;
		rc.sumaCargoMoratorio = 0;

		rc.planPagos = [];
		//console.log("Ir al Server:", new Date());
		loading(true);
		Meteor.apply("getBancos", [this.fechaInicial, this.fechaFinal, usuario.profile.sucursal_id], function (error, result) {
			if (result) {
				rc.planPagos = result.cobranza;
				rc.sumaSeguroDistribuidor = result.seguroDistribuidor;
				rc.sumaBonificaciones = result.bonificaciones;

				_.each(rc.planPagos, function (plan) {
					if (plan.tipoCuenta == "Banco") {
						if (plan.pagoInteres == undefined) plan.pagoInteres = 0;
						rc.sumaInteres += Number(parseFloat(plan.pagoInteres).toFixed(2));
						if (plan.pagoSeguro == undefined) plan.pagoSeguro = 0;
						rc.sumaSeguro += Number(parseFloat(plan.pagoSeguro).toFixed(2));
						if (plan.pagoIva == undefined) plan.pagoIva = 0;
						rc.sumaIva += Number(parseFloat(plan.pagoIva).toFixed(2));
						if (plan.pagoCapital == undefined) plan.pagoCapital = 0;
						rc.sumaCapital += Number(parseFloat(plan.pagoCapital).toFixed(2));

						if (plan.bonificacion == undefined)
							plan.bonificacion = 0;

						plan.totalPago = Number(parseFloat(plan.totalPago - plan.bonificacion)).toFixed(2);

						rc.totalCobranza += Number(parseFloat(plan.totalPago).toFixed(2));

						if (plan.descripcion == "Cargo Moratorio")
							rc.sumaCargoMoratorio += Number(parseFloat(plan.totalPago).toFixed(2));

						if (plan.tipoCredito == "creditoP")
							rc.sumaCreditos += Number(parseFloat(plan.totalPago).toFixed(2));
						else if (plan.tipoCredito == "vale") {
							rc.sumaVales += Number(parseFloat(plan.totalPago).toFixed(2));
							plan.descripcion = "Vale";
						}
					}
				});
				//console.log(rc.sumaVales);
				loading(false);
				$scope.$apply();
			}
			else
				loading(false);
		});

	};

	this.seguroDestribuidores = function () {

		var usuario = Meteor.user();

		rc.fechaInicial.setHours(0, 0, 0, 0);
		rc.fechaFinal.setHours(23, 59, 59, 999);

		rc.sumaSeguroDistribuidor = 0;
		rc.arregloSeguroDistribuidor = [];

		loading(true);
		Meteor.apply("getSeguroDistribuidores", [this.fechaInicial, this.fechaFinal, usuario.profile.sucursal_id], function (error, result) {
			if (result) {
				//console.log(result)
				rc.sumaSeguroDistribuidor = result.seguroDistribuidor;
				rc.arregloSeguroDistribuidor = result.seguroDistribuidorCobranza;

				loading(false);
				$scope.$apply();
			}
			else
				loading(false);
		});

	};

	this.diarioDocumentos = function () {
		//console.log("buscando")

		var usuario = Meteor.user();

		rc.fechaInicial.setHours(0, 0, 0, 0);
		rc.fechaFinal.setHours(23, 59, 59, 999);

		rc.sumaCapital = 0;
		rc.sumaInteres = 0;
		rc.sumaIva = 0;
		rc.sumaSeguro = 0;

		rc.totalCobranza = 0;

		rc.planPagos = [];

		loading(true);
		Meteor.call("getRDocumentos", this.fechaInicial, this.fechaFinal, usuario.profile.sucursal_id, function (error, result) {
			if (result) {
				rc.planPagos = result;

				_.each(rc.planPagos, function (plan) {

					if (plan.tipoCuenta == "Documento") {
						if (plan.pagoInteres == undefined) plan.pagoInteres = 0;
						rc.sumaInteres += Number(parseFloat(plan.pagoInteres).toFixed(2));
						if (plan.pagoSeguro == undefined) plan.pagoSeguro = 0;
						rc.sumaSeguro += Number(parseFloat(plan.pagoSeguro).toFixed(2));
						if (plan.pagoIva == undefined) plan.pagoIva = 0;
						rc.sumaIva += Number(parseFloat(plan.pagoIva).toFixed(2));
						if (plan.pagoCapital == undefined) plan.pagoCapital = 0;
						rc.sumaCapital += Number(parseFloat(plan.pagoCapital).toFixed(2));

						rc.totalCobranza += Number(parseFloat(plan.totalPago).toFixed(2));
					}

				});
				loading(false);
				//rc.totalCobranza += Number(parseFloat(rc.sumaInteres + rc.sumaSeguro + rc.sumaIva + rc.sumaCapital).toFixed(2));
				$scope.$apply();
			}
		});

	};

	this.carteraVencida = function () {

		var usuario = Meteor.user();
		rc.arregloCarteraVencida = [];
		rc.totales = {};
		loading(true);
		Meteor.call("getCarteraVencida", usuario.profile.sucursal_id, function (error, result) {
			if (result) {
				rc.arregloCarteraVencida = result.carteraVencida;
				rc.totales = result.totales;

				loading(false);
				$scope.$apply();
			}
		});

	};

	this.clientesDistribuidoresActivos = function () {
		rc.arregloClientes = [];
		rc.arregloDistribuidores = [];
		loading(true);
		Meteor.call("getClientesDistribuidoresActivos", Meteor.user().profile.sucursal_id, function (error, result) {
			if (result) {
				rc.arregloClientes = result.clientes;
				rc.arregloDistribuidores = result.distribuidores;
				//console.log(result)
				loading(false);
				$scope.$apply();
			}
		});
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////	

	this.filtrarTipoPago = function (tipo) {
		function formaPago(pp) {

			return pp.tipoIngreso == tipo;
		}

		rc.planPagos = rc.planPagoOriginal.filter(formaPago);

	}

	this.Total = function () {

		rc.planPagos = rc.planPagoOriginal;

	}

	this.sumarSeleccionados = function () {
		rc.seleccionadoRecibos = 0;
		rc.seleccionadoMultas = 0;
		_.each(rc.cobranza, function (c) {
			if (c.imprimir == true) {
				rc.seleccionadoRecibos += c.importe;
				rc.seleccionadoMultas += c.multas;
			}
		});

	};

	var fecha = moment();

	this.download = function (objeto) {
		//console.log("entro:", objeto);
		objeto.credito.saldoActualizado = rc.historialCredito.saldo
		objeto.credito.avales = rc.avales;
		objeto.credito.pagosVencidos = rc.pagosVencidos;



		Meteor.call('getcartaRecordatorio', objeto, function (error, response) {
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

				dlnk.download = "recordatorios.docx";
				dlnk.href = url;
				dlnk.click();
				window.URL.revokeObjectURL(url);

			}
		});
	};

	this.mostrarDiarioCobranza = function () {
		this.diarioCobranza = true
		this.movimientoCuenta = false
		this.diarioCreditos = false
	}

	this.mostarMovimientoCuenta = function () {
		this.diarioCobranza = false
		this.diarioCreditos = false
		this.movimientoCuenta = true
	}

	this.mostarDiarioCreditos = function () {
		this.diarioCobranza = false
		this.movimientoCuenta = false
		this.diarioCreditos = true
	}

	this.imprimirReporteCobranza = function (objeto) {


		if (objeto.length == 0) {
			toastr.warning("No hay registros por imprimir");
			return;
		}

		var suma = 0
		var sumaInter = 0
		var sumaIva = 0

		loading(true);
		Meteor.call('ReporteCobranza', objeto, rc.arregloOtrasSucursales, rc.fechaInicial, rc.fechaFinal, rc.arregloTiposIngresosobjetos,
			rc.sumaCapital,
			rc.sumaInteres,
			rc.sumaIva,
			rc.sumaSeguro,
			rc.sumaSeguroDistribuidor,
			rc.sumaBonificaciones,
			rc.sumaCargoMoratorio,
			(rc.totalCobranza + rc.sumaSeguroDistribuidor), function (error, response) {
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

	}

	this.imprimirReporteBancos = function (objeto) {


		if (objeto.length == 0) {
			toastr.warning("No hay registros por imprimir");
			return;
		}

		loading(true);
		//console.log("objeto",objeto)
		Meteor.call('ReportesBanco', objeto, rc.fechaInicial, rc.fechaFinal, rc.sumaCapital,
			rc.sumaInteres,
			rc.sumaIva,
			rc.sumaSeguro,
			rc.sumaSeguroDistribuidor,
			rc.sumaBonificaciones,
			rc.sumaCargoMoratorio,
			(rc.totalCobranza + rc.sumaSeguroDistribuidor), function (error, response) {

				if (error) {
					loading(false);
					console.log('ERROR :', error);
					return;
				}
				else {
					downloadFile(response);
					loading(false);
				}
			});
	};

	this.imprimirReporteCreditos = function (objeto) {

		if (objeto == undefined || objeto.length == 0) {
			toastr.warning("No hay registros por imprimir");
			return;
		}

		var totales = {};

		totales.totalSolicitadoVales = rc.totalSolicitadoVales;
		totales.totalPagarVales = rc.totalPagarVales;
		totales.numeroVales = rc.numeroVales;

		totales.totalSolicitadoCreditos = rc.totalSolicitadoCreditos;
		totales.totalPagarCreditos = rc.totalPagarCreditos;
		totales.numeroCreditos = rc.numeroCreditos;

		totales.totalSolicitadoCreditosD = rc.totalSolicitadoCreditosD;
		totales.totalPagarCreditosD = rc.totalPagarCreditosD;
		totales.numeroCreditosD = rc.numeroCreditosD;

		loading(true);
		Meteor.call('ReporteCreditos', objeto, rc.fechaInicial, rc.fechaFinal, totales, function (error, response) {


			if (error) {
				console.log('ERROR :', error);
				toastr.warning("Error al imprimir el reporte");
				loading(false);
				return; a
			}
			else {
				downloadFile(response);
				loading(false);
			}
		});


	}

	this.imprimirReporteCreditosLiquidados = function (objeto) {

		if (objeto.length == 0) {
			toastr.warning("No hay registros por imprimir");
			return;
		}


		var totales = {};

		totales.totalSolicitadoVales = rc.totalSolicitadoVales;
		totales.totalPagarVales = rc.totalPagarVales;
		totales.numeroVales = rc.numeroVales;

		totales.totalSolicitadoCreditos = rc.totalSolicitadoCreditos;
		totales.totalPagarCreditos = rc.totalPagarCreditos;
		totales.numeroCreditos = rc.numeroCreditos;

		totales.totalSolicitadoCreditosD = rc.totalSolicitadoCreditosD;
		totales.totalPagarCreditosD = rc.totalPagarCreditosD;
		totales.numeroCreditosD = rc.numeroCreditosD;


		loading(true);
		Meteor.call('ReporteCreditosLiquidados', objeto, rc.fechaInicial, rc.fechaFinal, totales, function (error, response) {


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

	}

	this.imprimirReporteMovimiento = function (objeto) {

		if (objeto.length == 0) {
			toastr.warning("No hay registros por imprimir");
			return;
		}

		_.each(objeto, function (item) {
			//console.log("item")
			item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")

			item.folio = item.credito.folio
			item.numeroPagos = item.credito.numeroPagos

		});
		//console.log("objeto",objeto)

		Meteor.call('ReporteMovimientoCuenta', objeto, rc.fechaInicial, rc.fechaFinal, function (error, response) {

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

				dlnk.download = "ReporteMovimientoCuentas.docx";
				dlnk.href = url;
				dlnk.click();
				window.URL.revokeObjectURL(url);


			}
		});

	};

	this.imprimirReporteCarteraVencida = function (objeto) {
		//console.log(objeto)

		if (rc.arregloCarteraVencida.length == 0) {
			toastr.warning("No hay nada que imprimir");
			return;
		}

		loading(true);
		Meteor.call('ReporteCarteraVencida', rc.arregloCarteraVencida, 'pdf', function (error, response) {

			if (error) {
				console.log('ERROR :', error);
				loading(false);
				return;
			}
			if (response) {
				downloadFile(response);
				loading(false);
			}
		});

	}
};