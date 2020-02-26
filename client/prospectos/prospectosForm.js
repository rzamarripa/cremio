angular.module("creditoMio")
	.controller("ProspectosFormCtrl", ProspectosFormCtrl);
function ProspectosFormCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	window = rc;

	this.action = true;
	this.nuevo = true;
	rc.objeto = {};

	if ($stateParams.objeto_id != undefined && $stateParams.objeto_id != "") {
		this.action = false;
		this.nuevo = false;

		this.subscribe("prospectos", () => {
			return [{ _id: $stateParams.objeto_id }]
		});

		this.helpers({
			objeto: () => {
				return Prospectos.findOne({ _id: $stateParams.objeto_id });
			},

		});
	}
	else {
		this.action = true;
		this.nuevo = !this.nuevo;
		rc.objeto = {};
	}


	this.guardar = function (objeto, form) {
		if (form.$invalid) {
			toastr.error('Error al guardar los datos.');
			return;
		}

		objeto.estatus = 1;	//1.- Solicitado, 2.- Aceptado, 3.- Rechazado
		objeto.usuarioInserto = Meteor.userId();
		objeto.saldo = 0;

		objeto.distribuidor_id = Meteor.userId();
		objeto.sucursal_id = Meteor.user().profile.sucursal_id;

		var nombre = objeto.nombre != undefined ? objeto.nombre.trim() + " " : "";
		var apPaterno = objeto.apellidoPaterno != undefined ? objeto.apellidoPaterno.trim() + " " : "";
		var apMaterno = objeto.apellidoMaterno != undefined ? objeto.apellidoMaterno.trim() : "";
		objeto.nombreCompleto = nombre + apPaterno + apMaterno;

		objeto.nombre = getCleanedString(objeto.nombre)
		objeto.apellidoPaterno = getCleanedString(objeto.apellidoPaterno)
		objeto.apellidoMaterno = getCleanedString(objeto.apellidoMaterno)
		objeto.nombreCompleto = getCleanedString(objeto.nombreCompleto);

		objeto.saldoActualVales = 0;	//Saldo con Capital, Intereses, IVA y Seguro
		objeto.saldoActual = 0;  //Saldo solo Capital

		objeto.fecha = new Date();

		// Prospectos.insert(objeto);
		// toastr.success('Guardado correctamente.');

		// if (Meteor.user().roles == "Distribuidor")
		// 	$state.go("root.prospectos");
		// else
		// 	$state.go("root.prospectosLista");

		// this.objeto = {};
		// this.nuevo = true;

		//Validar que no exista el nombre del pospecto
		Meteor.call('getValidaProspecto', objeto.nombreCompleto, function (e, r) {
			if (!r) {
				Prospectos.insert(objeto);
				toastr.success('Guardado correctamente.');

				if (Meteor.user().roles == "Distribuidor")
					$state.go("root.prospectos");
				else
					$state.go("root.prospectosLista");

				this.objeto = {};
				this.nuevo = true;
			}
			else if (r) {
				customDialog('El Prospecto ya esta dado de alta', function () {
				});
				return;
			}
		});

	};

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
		Prospectos.update({ _id: idTemp }, { $set: objeto });
		toastr.success('Actualizado correctamente.');

		//console.log(Meteor.user().roles);

		if (Meteor.user().roles == "Distribuidor")
			$state.go("root.prospectos");
		else
			$state.go("root.prospectosLista");

		this.nuevo = true;
	};

};