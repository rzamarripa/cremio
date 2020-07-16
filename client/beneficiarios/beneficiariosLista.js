angular.module("creditoMio")
	.controller("BeneficiariosListaCtrl", BeneficiariosListaCtrl);
function BeneficiariosListaCtrl($scope, $meteor, $reactive, $state, toastr) {

	let rc = $reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;
	this.objeto = {};
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscar.distribuidor = "";
	window.rc = rc;

	this.buscando = false;

	rc.valesBeneficiarios = [];
	rc.limiteVale = 0;

	this.subscribe('configuraciones', () => {
		return [{}]
	});

	this.subscribe('buscarDistribuidor', () => {

		if (this.getReactively("buscar.distribuidor").length > 4) {
			rc.distribuidores = [];
			rc.buscando = true;
			return [{
				options: { limit: 20 },
				where: {
					nombreCompleto: this.getReactively('buscar.distribuidor')
				}
			}];
		}
		else if (rc.getReactively("buscar.distribuidor").length == 0) {
			this.buscando = false;
		}
	});

	this.subscribe('buscarBeneficiarios', () => {

		if (this.getReactively("buscar.nombre").length > 4) {
			return [{
				options: { limit: 20 },
				where: {
					nombreCompleto: this.getReactively('buscar.nombre')
				}
			}];
		}
	});

	this.helpers({
		beneficiarios: () => {
			var arreglo = Beneficiarios.find({
				"nombreCompleto": { '$regex': '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options': 'i' }
			}, { sort: { "nombreCompleto": 1 } }).fetch();

			var configuraciones = Configuraciones.findOne();
			if (arreglo != undefined && configuraciones != undefined)
				rc.limiteVale = configuraciones.limiteVale;
			return arreglo;
		},
		distribuidores: () => {
			var cli = Meteor.users.find({
				"profile.nombreCompleto": { '$regex': '.*' + this.getReactively('buscar.distribuidor') || '' + '.*', '$options': 'i' },
				roles: { $in: ["Distribuidor"] }
			}, { sort: { "profile.nombreCompleto": 1 } }).fetch();

			if (cli != undefined) {
				return cli;
			}
		},
	});

	this.mostrarValesBeneficiario = function (id, nombre) {

		rc.valesBeneficiarios = [];
		rc.beneficiarioNombre = nombre;

		loading(true);
		Meteor.call('getCreditosBeneficiario', id, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				loading(false);
				return;
			}
			else if (result) {
				rc.valesBeneficiarios = result;
				loading(false);
				$("#modalVales").modal('show');
				$scope.$apply();
			}
		});
	};

	this.mostrarModalBloquearActivar = function (id, nombre, op) {
		rc.beneficiario_id = id;
		rc.beneficiarioNombre = nombre;
		rc.estatus = op;
		rc.motivo = "";
		$("#modalBloquear").modal('show');
	};

	this.bloquearActivarBeneficiario = function (motivo) {

		Meteor.call('setBloquearBeneficiario', rc.beneficiario_id, motivo, rc.estatus, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				loading(false);
				return;
			}
			else if (result) {
				$("#modalBloquear").modal('hide');
				toastr.success("Beneficiario Bloqueado...")
			}
		});
	};

	this.mostrarModalMoivos = function (id, nombre) {

		rc.beneficiarioNombre = nombre;

		loading(true);
		Meteor.call('getBitacoraActivarDesactivar', id, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				loading(false);
				return;
			}
			else if (result) {

				rc.motivos = result;
				loading(false);
				$("#modalBitacoraActivarDesactivar").modal('show');
				$scope.$apply();
			}
		});
	};

	this.mostrarModalCambioDistribuidor = function (id, nombre, distribuidor) {

		//rc.valesBeneficiarios = [];
		rc.beneficiario_id = id;
		rc.beneficiarioNombre = nombre;
		rc.distribuidor = distribuidor;
		rc.distribuidorCambio = {};

		this.cargarBitacoraDistribuidor();
		$("#modalCambioDistribuidor").modal('show');

	};

	this.seleccionarDistribuidor = function (distribuidor) {
		rc.distribuidorCambio = distribuidor;
	}

	this.cambiarDistribuidor = function (form) {
		if (form.$invalid) {
			toastr.error('No ha seleccioando ningun distribuidor');
			return;
		}

		Meteor.call('setBitacoraCambioDistribuidor', rc.beneficiario_id, rc.distribuidorCambio, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				loading(false);
				return;
			}
			else if (result) {
				toastr.success("Guardado Correctamente");
				loading(false);
				rc.cargarBitacoraDistribuidor();
				//$("#modalCambioDistribuidor").modal('hide');
			}
		});
	};

	this.cargarBitacoraDistribuidor = function () {
		loading(true);
		Meteor.call('getBitacoraCambioDistribuidor', rc.beneficiario_id, function (error, result) {
			if (error) {
				console.log('ERROR :', error);
				loading(false);
				return;
			}
			else if (result) {
				rc.bitacoraDistribuidores = result;
				loading(false);
				$scope.$apply();
			}
		});
	}

};