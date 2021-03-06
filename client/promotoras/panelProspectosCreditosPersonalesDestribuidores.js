angular.module("creditoMio")
	.controller("PanelProspectosCreditosPersonalesDestribuidoresCtrl", PanelProspectosCreditosPersonalesDestribuidoresCtrl);
function PanelProspectosCreditosPersonalesDestribuidoresCtrl($scope, $meteor, $reactive, $state, toastr) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;

	rc.buscar = {};
	rc.buscar.nombreBeneficiado = "";
	this.objetoRechazar = "";
	this.motivo = "";

	rc.buscar = {};
	rc.buscar.nombre = "";

	rc.tipoSolicitud = "creditoPersonal";

	this.subscribe('sucursales', () => {
		return [{}]
	},
		{
			onReady: function () {
				rc.sucursales = Sucursales.find({ estatus: true }).fetch();
			}
		});

	this.subscribe('buscarProspectoCreditoPersonal', () => {
		if (this.getReactively("tipoSolicitud") == "creditoPersonal" && this.getReactively("buscar.nombre").length > 4) {
			return [{
				options: { limit: 20 },
				where: {
					nombreCompleto: this.getReactively('buscar.nombre'),
					sucursal_id: Meteor.user().profile.sucursal_id
				}
			}];
		}
	});

	this.subscribe('buscarProspectoDistribuidor', () => {
		if (this.getReactively("tipoSolicitud") == "distribuidor" && this.getReactively("buscar.nombre").length > 4) {
			return [{
				options: { limit: 20 },
				where: {
					nombreCompleto: this.getReactively('buscar.nombre'),
					sucursal_id: Meteor.user().profile.sucursal_id
				}
			}];
		}
	});

	this.subscribe('prospectosCreditoPersonalComposite', () => {
		return [{
			"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
			"profile.estatusProspecto": 1
		}];
	});

	this.subscribe('prospectosDistribuidorComposite', () => {
		return [{
			"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
			"profile.estatusProspecto": 1
		}];
	});


	this.helpers({
		arreglo: () => {
			var prospectos = [];

			var prospectosCreditoPersonal = ProspectosCreditoPersonal.find({ "profile.estatusProspecto": 1 }).map(function (p) {

				if (p.profile.origen != 'Internet') {
					Meteor.call('getUsuario', p.profile.usuarioCreacion, function (error, result) {
						if (result) {
							p.profile.nombreUsuario = result.nombre;
							$scope.$apply()
						}
					});
				}
				else if (p.profile.origen == 'Internet') {
					p.profile.nombreUsuario = "Internet";
				}
				prospectos.push(p);
				return p;

			});

			var prospectosDistribuidor = ProspectosDistribuidor.find({ "profile.estatusProspecto": 1 }).map(function (p) {
				if (p.profile.origen != 'Internet') {
					Meteor.call('getUsuario', p.profile.usuarioCreacion, function (error, result) {
						if (result) {
							p.profile.nombreUsuario = result.nombre;
							prospectos.push(p);
							$scope.$apply()
						}
					});
				}
				else {
					p.profile.nombreUsuario = "Internet";
					prospectos.push(p);
					if (!$scope.$$phase) {
						$scope.$apply()
					}

				}

			});

			return prospectos;
		},
		arregloEvaluados: () => {
			if (rc.tipoSolicitud == "creditoPersonal") {
				var cli = ProspectosCreditoPersonal.find({
					"profile.nombreCompleto": { '$regex': '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options': 'i' },
					"profile.estatusProspecto": { $ne: 1 }
				}, { sort: { "profile.nombreCompleto": 1 } }).fetch();
				_.each(cli, function (c) {
					Meteor.call('getUsuario', c.profile.usuarioCreacion, function (error, result) {
						if (result) {
							c.profile.nombreUsuario = result.nombre;
							$scope.$apply()
						}
					});
					c.profile.tipo = "Cliente Crédito Personal";
				})
				return cli;
			}
			if (rc.tipoSolicitud == "distribuidor") {
				var cli = ProspectosDistribuidor.find({
					"profile.nombreCompleto": { '$regex': '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options': 'i' },
					"profile.estatusProspecto": { $ne: 1 }
				}, { sort: { "profile.nombreCompleto": 1 } }).map(function (d) {
					d.profile.tipo = "Distribuidor";
					Meteor.call('getUsuario', d.profile.usuarioCreacion, function (error, result) {
						if (result) {
							d.profile.nombreUsuario = result.nombre;
							$scope.$apply()
						}
					});
					return d;
				});

				// _.each(cli, function (c) {
				// 	Meteor.call('getUsuario', c.profile.usuarioCreacion, function (error, result) {
				// 		if (result) {
				// 			c.profile.nombreUsuario = result.nombre;
				// 			$scope.$apply()
				// 		}
				// 	});
				// 	c.profile.tipo = "Distribuidor";
				// })
				return cli;
			}

		},
	});


	this.mostrarModalValidaBeneficiario = function (nombre) {

		rc.buscar.nombreBeneficiado = nombre;
		rc.BeneficiadosDeudas = [];
		$("#modalvalidaBeneficiario").modal();

	};

	this.autorizar = function (objeto) {

		customConfirm('¿Estás seguro de Autorizar a ' + objeto.profile.nombreCompleto + ' como ' + objeto.profile.tipo + '?', function () {

			objeto.profile.usuarioAutorizo = Meteor.userId();

			if (objeto.profile.tipo == "Cliente Crédito Personal") {
				loading(true);
				Meteor.call('createUsuario', objeto, "Cliente", function (e, r) {
					if (r) {
						loading(false);
						toastr.success("Se autorizó correctamente.")

						ProspectosCreditoPersonal.update({ _id: objeto._id }, { $set: { usuarioAutorizo: Meteor.userId(), "profile.estatusProspecto": 2 } });
						SolicitudesClientes.update({ _id: objeto.profile.solicitudCreditoPersonal_id }, { $set: { "profile.estatus": 5 } });
						$state.go('root.clienteDetalle', { 'objeto_id': r });

					}
				});
			}
			else {
				loading(true);
				Meteor.call('createUsuario', objeto, "Distribuidor", function (e, r) {
					if (r) {
						loading(false);
						toastr.success("Se autorizó correctamente.")

						ProspectosDistribuidor.update({ _id: objeto._id }, { $set: { usuarioAutorizo: Meteor.userId(), "profile.estatusProspecto": 2 } });
						SolicitudesDistribuidores.update({ _id: objeto.profile.solicitudDistribuidor_id }, { $set: { "profile.estatus": 5 } });
						$state.go('root.distribuidoresDetalle', { 'objeto_id': r });

					}
				});

			}

		});

	}

	this.tramiteTrunco = function (objeto) {

		customConfirm('¿Estás seguro de truncar a el trámite a ' + objeto.profile.nombreCompleto + ' como ' + objeto.profile.tipo + '?', function () {

			if (objeto.profile.tipo == "Cliente Crédito Personal") {
				ProspectosCreditoPersonal.update({ _id: objeto._id }, { $set: { "profile.usuarioTrunco": Meteor.userId(), "profile.estatusProspecto": 4 } });
				SolicitudesClientes.update({ _id: objeto.profile.solicitudCreditoPersonal_id }, { $set: { "profile.estatus": 7 } });
			}
			else {
				ProspectosDistribuidor.update({ _id: objeto._id }, { $set: { "profile.usuarioTrunco": Meteor.userId(), "profile.estatusProspecto": 4 } });
				SolicitudesDistribuidores.update({ _id: objeto.profile.solicitudDistribuidor_id }, { $set: { "profile.estatus": 7 } });
			}
			Meteor.call("eliminarVerificaciones", objeto._id);
		});
	}

	this.activarTramite = function (objeto) {

		customConfirm('¿Estás seguro de activar el trámite a ' + objeto.profile.nombreCompleto + ' como ' + objeto.profile.tipo + '?', function () {

			if (objeto.profile.tipo == "Cliente Crédito Personal") {
				ProspectosCreditoPersonal.update({ _id: objeto._id },
					{
						$set: {
							"profile.usuarioTrunco": Meteor.userId(),
							"profile.estatusProspecto": 1,
							"profile.estatus": 1,
							"profile.verificacionEstatus": "",
							"profile.indicacion": "",
							"profile.estaVerificado": false

						}
					});
				SolicitudesClientes.update({ _id: objeto.profile.solicitudCreditoPersonal_id }, { $set: { "profile.estatus": 3 } });
			}
			else {
				ProspectosDistribuidor.update({ _id: objeto._id },
					{
						$set: {
							"profile.usuarioTrunco": Meteor.userId(),
							"profile.estatusProspecto": 1,
							"profile.estatus": 1,
							"profile.verificacionEstatus": "",
							"profile.indicacion": "",
							"profile.estaVerificado": false
						}
					});
				SolicitudesDistribuidores.update({ _id: objeto.profile.solicitudDistribuidor_id }, { $set: { "profile.estatus": 3 } });
			}

		});

	}

	this.rechazar = function (motivo, form) {

		if (form.$invalid) {
			toastr.error('Error al rechazar.');
			return;
		}

		if (motivo == "") {
			toastr.warning('Escriba un motivo.');
			return;
		}

		var objeto = rc.objetoRechazar;

		if (objeto.profile.tipo == "Cliente Crédito Personal") {
			var idTemp = objeto._id;
			delete objeto._id;
			ProspectosCreditoPersonal.update({ _id: idTemp }, { $set: { "profile.usuarioRechazo": Meteor.userId(), "profile.estatusProspecto": 3, "profile.motivo": motivo } });
			SolicitudesClientes.update({ _id: objeto.profile.solicitudCreditoPersonal_id }, { $set: { "profile.estatus": 6 } });
		}
		else {
			var idTemp = objeto._id;
			delete objeto._id;
			ProspectosDistribuidor.update({ _id: idTemp }, { $set: { "profile.usuarioRechazo": Meteor.userId(), "profile.estatusProspecto": 3, "profile.motivo": motivo } });
			SolicitudesDistribuidores.update({ _id: objeto.profile.solicitudDistribuidor_id }, { $set: { "profile.estatus": 6 } });
		}

		toastr.error("Prospecto rechazado.")

		this.motivo = "";
		this.objetoRechazar = "";

		$('#modalRechazo').modal('hide');

	}

	this.mostrarRechazo = function (objeto) {
		this.objetoRechazar = objeto;
		$("#modalRechazo").modal();
	};

	this.mostrarVerificacion = function (objeto) {

		this.objetoVerificar = objeto;
		$("#modalVerificar").modal();
	};

	this.programarVerificacion = function (objeto, form) {

		if (form.$invalid) {
			toastr.error('Error al guardar los datos.');
			return;
		}

		Meteor.call('programarVerificacionProspecto', objeto, function (error, result) {

			if (result) {
				loading(false);
				toastr.success('Programado correctamente.');
				$("#modalVerificar").modal('hide');
				this.nuevo = true;
				$state.go('root.panelProspectosCreditosPersonalesDestribuidores');

			}
		});


	};

	this.verValoracion = function (valoracion) {

		rc.valoracion = valoracion;
		$('#modalValoracion').modal();

	}

	this.seleccionaTipoSolicitud = function (tipo) {
		rc.tipoSolicitud = tipo;
	};

	this.imprimirProspectoCreditoPersonal = async function (objeto) {

		rc.referenciasPersonales = await Meteor.callSync('getReferenciaPersonales', objeto.profile.referenciasPersonales_ids, objeto._id);

		loading(true);
		Meteor.call('getFichaProspectoCreditoPersonal', objeto.profile, rc.referenciasPersonales, 'pdf', function (error, response) {

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

	this.imprimirProspectoDistribuidor = async function (objeto) {
		rc.referenciasPersonales = await Meteor.callSync('getReferenciaPersonales', objeto.profile.referenciasPersonales_ids, objeto._id);

		loading(true);
		Meteor.call('getFichaProspectoDistribuidor', objeto.profile, rc.referenciasPersonales, 'pdf', function (error, response) {

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

	this.volverVerificar = function (objeto) {

		customConfirm('¿Estás seguro de volver a verificar a ' + objeto.profile.nombreCompleto + '?', function () {

			objeto.usuarioAutorizo = Meteor.userId();

			if (objeto.profile.tipo == "Cliente Crédito Personal") {
				ProspectosCreditoPersonal.update({ _id: objeto._id }, { $set: { "profile.estaVerificado": false, "profile.estatus": 1, "profile.estatusProspecto": 1, "profile.verificacionEstatus": "" } });
			}
			else {
				ProspectosDistribuidor.update({ _id: objeto._id }, { $set: { "profile.estaVerificado": false, "profile.estatus": 1, "profile.estatusProspecto": 1, "profile.verificacionEstatus": "" } });
			}

		});

	}

};