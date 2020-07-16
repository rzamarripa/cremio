angular
	.module("creditoMio")
	.controller("panelVerificadorCtrl", panelVerificadorCtrl);
function panelVerificadorCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;

	rc.fechaInicial = new Date();
	rc.fechaInicial.setHours(0, 0, 0, 0);

	/*
	  rc.fechaFinal = new Date(rc.getReactively("fechaInicial"));
	  rc.fechaFinal.setHours(23,0,0,0);	
	*/

	rc.creditoSeleccionado = "";
	rc.distribuidorSeleccionado = "";

	rc.objeto = {};
	rc.objeto.evaluacion = "";
	rc.objeto.indicacion = "";

	rc.conVecino = 0;
	rc.conSolicitanteAval = 0;
	rc.creditos = [];
	rc.prospectosCreditoPersonal = [];


	this.subscribe('creditos', () => {
		return [{ //sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", 
			requiereVerificacion: true,
			estatus: 0
		}]
	}, {
		onReady: () => {



		}
	});

	//Aunque diga cliente es para los verificadores
	this.subscribe('cliente', () => {
		return [{//"profile.sucursal_id"		: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", 
			"profile.estaVerificado": false
		}]
	});

	//Prospectos de Distribuidores
	this.subscribe('pprospectosDistribuidorVerificacionesComposite', () => {
		return [{//"profile.sucursal_id"		: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", 
			"profile.estaVerificado": false,
			"profile.estatus": 2
		}]
	});

	//Prospectos de Clientes
	this.subscribe('prospectosCreditoPersonalVerificacionesComposite', () => {
		return [{//"profile.sucursal_id"		: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", 
			"profile.estaVerificado": false,
			"profile.estatus": 2
		}]
	});

	this.subscribe('verificaciones', () => {
		var FI = new Date(rc.getReactively("fechaInicial"));
		FI.setHours(23, 59, 59, 999);
		return [{ //sucursal_id				: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
			//usuarioVerifico 	: Meteor.user() != undefined ? Meteor.userId():"", 
			fechaVerificacion: { $gte: rc.getReactively("fechaInicial"), $lte: FI }
		}]
	});

	this.helpers({
		creditos: () => {
			rc.creditos = Creditos.find({ tipo: "creditoP" }, { sort: { fechaSolicito: -1 } }).fetch();
			if (rc.creditos != undefined) {
				_.each(rc.creditos, function (credito) {
					credito.verificacionesHechas = 0;

					var cliente = {};

					Meteor.apply('getUsuario', [credito.cliente_id], function (error, result) {
						if (error) {
							console.log('ERROR :', error);
							return;
						}
						if (result) {
							cliente = result;
							credito.nombreCliente = cliente.nombreCompleto;
							credito.numeroCliente = cliente.numeroCliente;
							$scope.$apply();
						}
					});
					Meteor.apply('getNumeroVerificacionesCredito', [credito._id], function (error, result) {
						if (error) {
							console.log('ERROR :', error);
							return;
						}
						if (result) {
							credito.verificacionesHechas = result;
							$scope.$apply();
						}
					});
				})
			}
			return rc.creditos;
		},
		verificacionesHechas: () => {
			var ver = Verificaciones.find({}).fetch();
			_.each(ver, function (v) {

				if (v.tipoVerificacion == 'solicitante o aval' && v.verificacionPersona == 1)
					v.tipoVerificacionTabla = 'Solicitante';
				if (v.tipoVerificacion == 'solicitante o aval' && v.verificacionPersona == 2)
					v.tipoVerificacionTabla = 'Aval';
				if (v.tipoVerificacion == 'vecino' && v.verificacionPersona == 1)
					v.tipoVerificacionTabla = 'Vecino Solicitante';
				if (v.tipoVerificacion == 'vecino' && v.verificacionPersona == 2)
					v.tipoVerificacionTabla = 'Vecino Aval';
			});

			_.each(ver, function (v) {
				if (v.tipo == "Prospecto Distribuidor" || v.tipo == "Prospecto Crédito Personal") {
					//var p = v.tipo == "Prospecto Crédito Personal" ? ProspectosCreditoPersonal.findOne({ _id: v.cliente_id }) : ProspectosDistribuidor.findOne({ _id: v.cliente_id });
					v.nombreCliente = v.cliente.nombreCompleto;
					v.numeroCliente = "-----";
					if (!$scope.$$phase) {
						$scope.$apply();
					}

				}
				else {
					Meteor.apply('getUsuario', [v.cliente_id], function (error, result) {
						if (error) {
							console.log('ERROR :', error);
							return;
						}
						if (result) {
							cliente = result;
							v.nombreCliente = cliente.nombreCompleto;
							v.numeroCliente = cliente.numeroCliente;
							$scope.$apply();
						}
					});
				}

			});

			return ver;
		},
		distribuidores: () => {
			var dis = Meteor.users.find({ roles: ["Distribuidor"] }, { sort: { "profile.fechaVerificacion": -1 } }).fetch();

			if (dis != undefined) {
				_.each(dis, function (d) {
					d.verificacionesHechas = 0;

					Meteor.apply('getNumeroVerificacionesDistribuidor', [d._id], function (error, result) {
						if (error) {
							console.log('ERROR :', error);
							return;
						}
						if (result) {
							d.verificacionesHechas = result;
							$scope.$apply();
						}
					});

				});

				return dis;
			}
		},
		prospectosCreditoPersonal: () => {
			var arreglo = [];

			var dis = ProspectosDistribuidor.find({ "profile.estaVerificado": false, "profile.estatus": 2 }, { sort: { "profile.fechaVerificacion": -1 } }).fetch();
			if (dis != undefined) {
				for (d of dis) {
					d.verificacionesHechas = 0;
					d.verificacionesHechas = Verificaciones.find({ cliente_id: d._id }).count();
					d.profile.sucursal = Sucursales.findOne(d.profile.sucursal_id).nombreSucursal;
					arreglo.push(d);
				};
			}

			var creditosPersonales = ProspectosCreditoPersonal.find({ "profile.estaVerificado": false, "profile.estatus": 2 }, { sort: { "profile.fechaVerificacion": -1 } }).fetch();
			if (creditosPersonales != undefined) {
				for (cp of creditosPersonales) {
					cp.verificacionesHechas = 0;
					cp.verificacionesHechas = Verificaciones.find({ cliente_id: cp._id }).count();
					cp.profile.sucursal = Sucursales.findOne(cp.profile.sucursal_id).nombreSucursal;
					arreglo.push(cp);
				};
			}

			rc.prospectosCreditoPersonal = arreglo;
			if (!$scope.$$phase)
				$scope.$apply();

			return rc.prospectosCreditoPersonal;

		},
	});

	this.mostrarEvaluacion = function (id, numVer) {
		if (numVer == 0) {
			toastr.warning('No tiene ninguna verficación');
			return;
		}

		rc.Cliente = 0;
		rc.Aval = 0;

		var credito = Creditos.findOne(id);
		var numeroVerificaciones = 0;
		if (credito.requiereVerificacion == true && (credito.requiereVerificacionAval == undefined || credito.requiereVerificacionAval == false))
			numeroVerificaciones = 1;
		else
			numeroVerificaciones = 2;

		var ban = true;
		Meteor.call('getVerificacionesCredito', id, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				return;
			}
			if (result) {
				_.each(result, function (v) {

					if (v.tipoVerificacion == "Cliente")
						rc.Cliente += 1;
					if (v.tipoVerificacion == "Aval")
						rc.Aval += 1;
				});
				//console.log("Cli:", rc.Cliente);
				//console.log("Ava:", rc.Aval);
				//console.log("NV:", numeroVerificaciones);
				credito.requiereVerificacionAval = credito.requiereVerificacionAval == undefined ? false : credito.requiereVerificacionAval;
				//console.log("Aval R:", credito.requiereVerificacionAval);
				if (credito.requiereVerificacionAval == false && rc.Cliente < numeroVerificaciones) {
					toastr.warning('El cliente no tiene las suficientes verificaciones para finalizar la verficación');
					return;
				}
				else if (credito.requiereVerificacionAval == true && (rc.Cliente + rc.Aval) < numeroVerificaciones) {
					toastr.warning('El cliente y aval no tiene las suficientes verificaciones para finalizar la verficación');
					return;
				}
				else {
					rc.objeto.indicacion = "";
					rc.objeto.evaluacion = "";
					rc.creditoSeleccionado = id;
					rc.distribuidorSeleccionado = "";
					$("#modalEvaluarVerificacion").modal('show');
				}

			}
		});

	}

	this.mostrarEvaluacionD = function (id, numVer) {
		if (numVer == 0) {
			toastr.warning('No tiene ninguna verficación');
			return;
		}

		rc.Cliente = 0;
		rc.Aval = 0;

		var numeroVerificaciones;
		var distribuidorRequiereVerificacionAval = Meteor.users.findOne(id);

		Meteor.call('getVerificacionesDistribuidor', id, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				return;
			}
			if (result) {
				if (distribuidorRequiereVerificacionAval.profile.sinAval == 'SI') {
					numeroVerificaciones = 1;

					_.each(result, function (v) {

						if (v.tipoVerificacion == "Distribuidor")
							rc.Cliente += 1;
					});

					if (rc.Cliente < numeroVerificaciones) {
						toastr.warning('El Distribuidor no tiene las suficientes verificaciones para finalizar la verficación');
						return;
					}
					else {
						rc.objeto.indicacion = "";
						rc.objeto.evaluacion = "";
						rc.creditoSeleccionado = "";
						rc.distribuidorSeleccionado = id;
						$("#modalEvaluarVerificacionD").modal('show');
					}

				}
				else {
					numeroVerificaciones = 2;

					_.each(result, function (v) {
						//console.log(v.tipoVerificacion);
						if (v.tipoVerificacion == "Distribuidor")
							rc.Cliente += 1;
						if (v.tipoVerificacion == "Aval")
							rc.Aval += 1;
					});

					if ((rc.Cliente + rc.Aval) < numeroVerificaciones || rc.Aval == 0) {
						toastr.warning('El Distribuidor no tiene las suficientes verificaciones para finalizar la verficación');
						return;
					}
					else {
						rc.objeto.indicacion = "";
						rc.objeto.evaluacion = "";
						rc.creditoSeleccionado = "";
						rc.distribuidorSeleccionado = id;

						$("#modalEvaluarVerificacionD").modal('show');
					}
				}

			}

		});
	}

	this.mostrarEvaluacionProspecto = function (id, numVer, tipo) {

		rc.prospectoDistribuidorSeleccionado = "";
		rc.prospectoCreditoPersonalSeleccionado = "";
		if (numVer == 0) {
			toastr.warning('No tiene ninguna verficación');
			return;
		}

		rc.Cliente = 0;
		rc.Aval = 0;

		var numeroVerificaciones;
		if (tipo == "Distribuidor")
			var distribuidorRequiereVerificacionAval = ProspectosDistribuidor.findOne(id);
		else
			var distribuidorRequiereVerificacionAval = ProspectosCreditoPersonal.findOne(id);

		Meteor.call('getVerificacionesProspectos', id, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				return;
			}
			if (result) {

				if (distribuidorRequiereVerificacionAval.profile.sinAval == 'SI') {
					numeroVerificaciones = 1;

					_.each(result, function (v) {

						if (v.tipoVerificacion == "Distribuidor")
							rc.Cliente += 1;
					});

					if (rc.Cliente < numeroVerificaciones) {
						toastr.warning('El Prospecto no tiene las suficientes verificaciones para finalizar la verficación');
						return;
					}
					else {
						rc.objeto.indicacion = "";
						rc.objeto.evaluacion = "";
						rc.creditoSeleccionado = "";
						if (tipo == "Distribuidor")
							rc.prospectoDistribuidorSeleccionado = id;
						else
							rc.prospectoCreditoPersonalSeleccionado = id;
						$("#modalEvaluarVerificacionP").modal('show');
					}

				}
				else {

					if (tipo == "Distribuidor")
						numeroVerificaciones = 2;
					else {
						numeroVerificaciones = 1;
						if (distribuidorRequiereVerificacionAval.profile.requiereVerificacionAval)
							numeroVerificaciones = 2;
					}

					_.each(result, function (v) {
						//console.log(v.tipoVerificacion);
						if (v.tipoVerificacion == "Prospecto")
							rc.Cliente += 1;
						if (v.tipoVerificacion == "Aval")
							rc.Aval += 1;
					});
					// console.log(rc.Cliente);
					// console.log(rc.Aval);
					// console.log(numeroVerificaciones);

					if ((rc.Cliente + rc.Aval) >= numeroVerificaciones) {
						rc.objeto.indicacion = "";
						rc.objeto.evaluacion = "";
						rc.creditoSeleccionado = "";
						if (tipo == "Distribuidor")
							rc.prospectoDistribuidorSeleccionado = id;
						else
							rc.prospectoCreditoPersonalSeleccionado = id;

						$("#modalEvaluarVerificacionP").modal('show');
					}
					else {

						toastr.warning('El Prospecto no tiene las suficientes verificaciones para finalizar la verficación');
						return;


					}
				}
			}
		});

		//console.log(rc.prospectoDistribuidorSeleccionado);
		//console.log(rc.prospectoCreditoPersonalSeleccionado);

	}

	this.finalizarVerificacion = function (objeto) {

		if (objeto == undefined)
			return;
		if (objeto.evaluacion == undefined || objeto.indicacion == undefined)
			return;

		if (objeto.evaluacion == "" || objeto.indicacion == "") {
			toastr.error('faltan datos por llenar.');
			return;
		}

		if (rc.creditoSeleccionado != "") {
			Creditos.update({ _id: rc.creditoSeleccionado }, { $set: { estatus: 1, verificacionEstatus: objeto.evaluacion, indicacion: objeto.indicacion } });
			$("#modalEvaluarVerificacion").modal('hide');
			toastr.success('Evaluado');
		}
		else if (rc.distribuidorSeleccionado != "") {
			Meteor.call('finalizarVerificacionDistribuidor', rc.distribuidorSeleccionado, objeto, function (error, result) {
				if (error) {
					console.log('ERROR :', error);
					return;
				}
				if (result) {
					$("#modalEvaluarVerificacionD").modal('hide');
					toastr.success('Evaluado');
				}
			});
		}
		else if (rc.prospectoDistribuidorSeleccionado != "") {
			Meteor.call('finalizarVerificacionProspectoDistribuidor', rc.prospectoDistribuidorSeleccionado, objeto, function (error, result) {
				if (error) {
					console.log('ERROR :', error);
					return;
				}
				if (result) {
					$("#modalEvaluarVerificacionP").modal('hide');
					toastr.success('Evaluado');
				}
			});
		}
		else if (rc.prospectoCreditoPersonalSeleccionado != "") {
			Meteor.call('finalizarVerificacionProspectoCreditoPersonal', rc.prospectoCreditoPersonalSeleccionado, objeto, function (error, result) {
				if (error) {
					console.log('ERROR :', error);
					return;
				}
				if (result) {
					$("#modalEvaluarVerificacionP").modal('hide');
					toastr.success('Evaluado');
				}
			});
		}


	};

	this.cancelarVerificacionCredito = function (id, nombre) {

		customConfirm('¿Estás seguro de Cancelar la verificación ' + nombre + '?', function () {

			Meteor.call('cancelarVerificacionCredito', id, function (error, result) {
				if (error) {
					console.log('ERROR :', error);
					return;
				}
			});

			toastr.success("Se cancelo la verificación correctamente.");
		});

	};

	this.cancelarVerificacionDistribuidor = function (id, nombre) {

		customConfirm('¿Estás seguro de Cancelar la verificación al distribuidor ' + nombre + '?', function () {

			Meteor.call('cancelarVerificacionDistribuidor', id, function (error, result) {
				if (error) {
					console.log('ERROR :', error);
					return;
				}
			});

			toastr.success("Se cancelo la verificación al distribuidor correctamente.");
		});

	};

	this.cancelarVerificacionProspecto = function (id, nombre, tipo) {

		customConfirm('¿Estás seguro de Cancelar la verificación del prospecto ' + nombre + '?', function () {

			if (tipo == "Cliente Crédito Personal") {
				Meteor.call('cancelarVerificacionProspectoCreditoPersonal', id, function (error, result) {
					if (error) {
						console.log('ERROR :', error);
						return;
					}
				});

				toastr.success("Se cancelo la verificación del prospecto de crédito personal correctamente.");
			}
			else if (tipo == "Distribuidor") {
				Meteor.call('cancelarVerificacionProspectoDistribuidor', id, function (error, result) {
					if (error) {
						console.log('ERROR :', error);
						return;
					}
				});

				toastr.success("Se cancelo la verificación del prospecto de distribuidor correctamente.");
			}


		});

	};

	rc.imprimirVerificacion = function (objeto) {
		//console.log(objeto);

		Meteor.call('getUsuario', objeto.usuarioVerifico, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				return;
			}
			if (result) {

				objeto.verifico = result.nombreCompleto;

				objeto.domicilio = objeto.cliente.calle + ", #" + objeto.cliente.numero + " COL. " + objeto.cliente.colonia + ", " + objeto.cliente.ciudad;

				objeto.ste = objeto.serviciosTelefono == true ? "SI" : "";
				objeto.sca = objeto.serviciosCablevision == true ? "SI" : "";
				objeto.sin = objeto.serviciosInternet == true ? "SI" : "";
				objeto.ssd = objeto.serviciosSkyDish == true ? "SI" : "";

				objeto.cha = objeto.casaHabitaciones == true ? "SI" : "";
				objeto.cni = objeto.casaNiveles == true ? "SI" : "";
				objeto.cco = objeto.casaCochera == true ? "SI" : "";
				objeto.cve = objeto.casaVehiculos == true ? "SI" : "";

				objeto.mes = objeto.mennajeEstufa == true ? "SI" : "";
				objeto.mre = objeto.mennajeRefrigerador == true ? "SI" : "";
				objeto.msa = objeto.mennajeSala == true ? "SI" : "";
				objeto.mac = objeto.mennajeAireAcondicionado == true ? "SI" : "";

				objeto.mtv = objeto.mennajeTV == true ? "SI" : "";
				objeto.mpc = objeto.mennajePCLaptop == true ? "SI" : "";
				objeto.mdv = objeto.mennajeDVD == true ? "SI" : "";
				objeto.mst = objeto.mennajeStereo == true ? "SI" : "";

				objeto.tipoVivienda == "Bajo" ? objeto.tb = "SI" : "";
				objeto.tipoVivienda == "Medio" ? objeto.tm = "SI" : "";
				objeto.tipoVivienda == "MedioAlto" ? objeto.ta = "SI" : "";
				objeto.tipoVivienda == "InteresSocial" ? objeto.ti = "SI" : "";
				objeto.tipoVivienda == "Residencial" ? objeto.tr = "SI" : "";

				objeto.sp = "";
				objeto.spValor = "";
				objeto.spNombre = "";
				objeto.sr = "";
				objeto.spa = "";
				objeto.spPago = "";
				objeto.spMedio = "";
				objeto.so = "";

				if (objeto.situacionVivienda == "Propia") {
					objeto.sp = "SI"; objeto.spValor = objeto.valorPropia; objeto.spNombre = objeto.aNombreDePropia;
				}

				if (objeto.situacionVivienda == "Renta") {
					objeto.sr = "SI";
				}
				if (objeto.situacionVivienda == "Pagandola") {
					objeto.spa = "SI"; objeto.spPago = objeto.valorPagandola; objeto.spMedio = objeto.medioPagandola;
				}
				if (objeto.situacionVivienda == "Otra") {
					objeto.so = "SI";
				}

				if (objeto.casaDelVecino == "PROPIA") {
					objeto.esPropia = "SI";
					objeto.esRentada = "";
				}
				else {
					objeto.esPropia = "";
					objeto.esRentada = "SI";
				}

				if (objeto.evaluacionProspecto == "ALTAMENTE")
					objeto.vA = "X";
				else if (objeto.evaluacionProspecto == "CONCOSIDERACIONES")
					objeto.vC = "X";
				else if (objeto.evaluacionProspecto == "NOLORECOMIENDO")
					objeto.vN = "X";

				objeto.d = objeto.fechaVerificacion.getDate();
				objeto.m = objeto.fechaVerificacion.getMonth() + 1;
				objeto.a = objeto.fechaVerificacion.getFullYear();

				objeto.hora = moment(new Date(objeto.fechaVerificacion)).format("hh:mm:ss a");

				var nombreReporte = "";
				if (objeto.tipo == "Crédito Personal" || objeto.tipo == "Prospecto Crédito Personal")
					nombreReporte = "Verificacion"
				else
					nombreReporte = "VerificacionVale"

				loading(true);
				Meteor.call('report', {
					templateNombre: nombreReporte,
					reportNombre: 'VerificacionOut',
					type: 'pdf',
					datos: objeto,
				}, function (err, file) {
					if (!err) {
						loading(false);
						downloadFile(file);
					} else {
						toastr.warning("Error al generar el reporte");
						loading(false);
					}
				});


			}
		});

	}

};