angular.module("creditoMio")
	.controller("validacionCARPCtrl", validacionCARPCtrl);
function validacionCARPCtrl($scope, $meteor, $reactive, $state, toastr) {

	let rc = $reactive(this).attach($scope);

	this.objeto = {};
	this.buscar = {};
	this.buscar.nombre = "";

	rc.personas = [];

	window.rc = rc;

	this.buscarPersona = function (nombre) {
		if (nombre.length > 4) {
			Meteor.call('getPersonas', nombre, function (error, result) {
				if (result) {
					//console.log("Personas:", result);
					rc.personas = [];
					_.each(result.clientes, function (cliente) {
						cliente.tipoPersona = "Cliente";
						cliente.nombre = cliente.profile.nombreCompleto;
						rc.personas.push(cliente);
					});
					_.each(result.distribuidores, function (distribuidor) {
						distribuidor.tipoPersona = "Distribuidor";
						distribuidor.nombre = distribuidor.profile.nombreCompleto;
						rc.personas.push(distribuidor);
					});
					_.each(result.avales, function (aval) {
						aval.tipoPersona = "Aval";
						aval.nombre = aval.profile.nombreCompleto;
						rc.personas.push(aval);
					});
					_.each(result.referenciasPersonales, function (referenciaPersonal) {
						referenciaPersonal.tipoPersona = "Referencia Personal";
						referenciaPersonal.nombre = referenciaPersonal.nombreCompleto;
						rc.personas.push(referenciaPersonal);
					});
					_.each(result.beneficiarios, function (beneficiario) {
						beneficiario.tipoPersona = "Beneficiario";
						beneficiario.nombre = beneficiario.nombreCompleto;
						rc.personas.push(beneficiario);
					});
					_.each(result.prospectosVales, function (prospecto) {
						prospecto.tipoPersona = "Prospecto Vale";
						prospecto.nombre = prospecto.nombreCompleto;
						rc.personas.push(prospecto);
					});
					_.each(result.conyugeClienteCreditoP, function (item) {
						item.tipoPersona = "Cónyuge Cliente Personal";
						item.nombre = item.profile.nombreConyuge;
						item.conyuge = item.profile.nombreCompleto;
						rc.personas.push(item);
					});
					_.each(result.conyugeClienteDistribuidor, function (item) {
						item.tipoPersona = "Cónyuge Distribuidor";
						item.nombre = item.profile.nombreConyuge;
						item.conyuge = item.profile.nombreCompleto;
						rc.personas.push(item);
					});
					_.each(result.prospectosCreditoPersonal, function (item) {
						item.tipoPersona = "Prospecto Crédito Personal";
						item.nombre = item.profile.nombreCompleto;
						rc.personas.push(item);
					});
					_.each(result.prospectosDistribuidor, function (item) {
						item.tipoPersona = "Prospecto Distribuidor";
						item.nombre = item.profile.nombreCompleto;
						rc.personas.push(item);
					});



					$scope.$apply();
				}

			});
		} else { rc.personas = []; }

	}

	this.tieneFoto = function (sexo, foto) {

		if (foto === undefined || foto === "") {
			if (sexo === "MASCULINO")
				return "img/badmenprofile.png";
			else if (sexo === "FEMENINO") {
				return "img/badgirlprofile.png";
			} else {
				return "img/badprofile.png";
			}
		} else {
			return foto;
		}
	};

};