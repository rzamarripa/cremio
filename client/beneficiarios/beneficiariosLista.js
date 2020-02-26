angular.module("creditoMio")
	.controller("BeneficiariosListaCtrl", BeneficiariosListaCtrl);
function BeneficiariosListaCtrl($scope, $meteor, $reactive, $state, toastr) {

	let rc = $reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;
	this.objeto = {};
	this.buscar = {};
	this.buscar.nombre = "";
	window.rc = rc;

	rc.valesBeneficiarios = [];
	rc.limiteVale = 0;

	this.subscribe('configuraciones', () => {
		return [{}]
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


};