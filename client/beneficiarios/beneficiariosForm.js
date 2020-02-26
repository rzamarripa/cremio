angular.module("creditoMio")
	.controller("BeneficiariosFormCtrl", BeneficiariosFormCtrl);
function BeneficiariosFormCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	window = rc;

	this.action = true;
	this.nuevo = true;
	this.objeto = {};
	this.buscar = {};

	if ($stateParams.objeto_id != "") {
		this.action = false;
		this.nuevo = false;

		this.subscribe("beneficiarios", () => {
			return [{ _id: $stateParams.objeto_id }]
		});

		this.helpers({
			objeto: () => {
				return Beneficiarios.findOne({ _id: $stateParams.objeto_id });
			},

		});
	}
	else {
		this.action = true;
		this.nuevo = !this.nuevo;
		this.objeto = {};
	}

	this.actualizar = function (objeto, form) {
		if (form.$invalid) {
			toastr.error('Error al actualizar los datos.');
			return;
		}

		var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
		var apPaterno = objeto.apellidoPaterno != undefined ? objeto.apellidoPaterno + " " : "";
		var apMaterno = objeto.apellidoMaterno != undefined ? objeto.apellidoMaterno : "";
		objeto.nombreCompleto = nombre + apPaterno + apMaterno;

		objeto.nombre = getCleanedString(objeto.nombre)
		objeto.apellidoPaterno = getCleanedString(objeto.apellidoPaterno)
		objeto.apellidoMaterno = getCleanedString(objeto.apellidoMaterno)
		objeto.nombreCompleto = getCleanedString(objeto.nombreCompleto);

		var idTemp = objeto._id;
		delete objeto._id;
		objeto.usuarioActualizo = Meteor.userId();
		Beneficiarios.update({ _id: idTemp }, { $set: objeto });
		toastr.success('Actualizado correctamente.');
		$state.go("root.beneficiariosLista");

		//this.nuevo = true;
	};

};