angular
	.module("creditoMio")
	.controller("PanelNotasCreditoCtrl", PanelNotasCreditoCtrl);
function PanelNotasCreditoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	window = rc;

	rc.fecha = "";
	rc.fecha = new Date();
	rc.fecha.setHours(0, 0, 0, 0);

	rc.numeroPagina = 0;
	rc.avance = 100;
	rc.arregloPaginadorAplicadas = [];
	rc.arregloPaginadorCaducadas = [];

	this.subscribe('sucursales', () => {
		return [{}]
	},
		{
			onReady: function () {
				rc.sucursales = Sucursales.find({ estatus: true }).fetch();
			}
		});

	this.subscribe('notasCredito', () => {
		return [{
			sucursal_id: Meteor.user().profile.sucursal_id,
			estatus: 1 
		}]
	});

	this.subscribe('notasCreditoCaducadas', () => {
		return [{
			options: {
				skip: rc.getReactively("numeroPagina"),
				limit: rc.avance
			},
			where: {
				sucursal_id: Meteor.user().profile.sucursal_id,
				estatus: 2,
			}
		}];
	});

	this.subscribe('notasCreditoAplicadas', () => {
		return [{
			options: {
				skip: rc.getReactively("numeroPagina"),
				limit: rc.avance
			},
			where: {
				sucursal_id: Meteor.user().profile.sucursal_id,
				estatus: 3,
			}
		}];
	});

	this.helpers({
		notasCreditoConSaldo: () => {
			var ncs = NotasCredito.find({ estatus: 1, saldo: { $gt: 0 } }, { sort: { createdAt: -1 } }).fetch();
			if (ncs != undefined) {
				_.each(ncs, function (nc) {
					Meteor.call('getUsuario', nc.cliente_id, function (error, result) {
						if (result) {
							nc.nombreCliente = result.nombreCompleto;
							nc.numeroCliente = result.numeroCliente;
							$scope.$apply();
						}
					});

					Meteor.call('getUsuario', nc.createdBy, function (error, result) {
						if (result) {
							nc.usuario = result.nombre;
							$scope.$apply();
						}
					});

				});
			}
			return ncs;
		},
		notasCreditoCaducadas: () => {
			var ncs = NotasCredito.find({ estatus: 2 }, { sort: { createdAt: -1 } }).map(function (nc) {

				var cliente = Meteor.users.findOne(nc.cliente_id);
				nc.nombreCliente = cliente == undefined ? "" : cliente.profile.nombreCompleto;
				nc.numeroCliente = cliente == undefined ? "" : cliente.profile.numeroCliente;

				var usuario = Meteor.users.findOne(nc.createdBy);
				nc.usuario = usuario == undefined ? "" : usuario.profile.nombre;
				return nc;
			});
			return ncs;
		},
		notasCreditoAplicadas: () => {
			var ncs = NotasCredito.find({ estatus: 3 }, { sort: { createdAt: -1 } }).map(function (nc) {

				var cliente = Meteor.users.findOne(nc.cliente_id);
				nc.nombreCliente = cliente == undefined ? "" : cliente.profile.nombreCompleto;
				nc.numeroCliente = cliente == undefined ? "" : cliente.profile.numeroCliente;

				var usuario = Meteor.users.findOne(nc.createdBy);
				nc.usuario = usuario == undefined ? "" : usuario.profile.nombre;

				return nc;

			});
			return ncs;
		},
	});


	//Paginador/////////// Funciones genericas
	this.izq = function (arreglo) {
		if (rc.numeroPagina > 0) {
			rc.numeroPagina -= rc.avance;
			//revisar para recorrer
			var elementoPaginador = arreglo.find(x => x.avance == rc.numeroPagina);
			if (elementoPaginador == undefined) {
				_.each(arreglo, function (elemento) {
					if (elemento.numero != "...") {
						elemento.numero--;
						elemento.avance -= rc.avance;
						elemento.estaActivo = false;
					}
				});
			}
			this.ActivarFlechas(rc.numeroPagina, rc.numeroPagina + rc.avance, arreglo);
		}
	}

	this.der = function (tabla, arreglo) {
		if (tabla.length > 0 && tabla.length == rc.avance) {
			rc.numeroPagina += rc.avance;

			//revisar para recorrer
			var elementoPaginador = arreglo.find(x => x.avance == rc.numeroPagina);
			if (elementoPaginador == undefined) {
				_.each(arreglo, function (elemento) {
					if (elemento.numero != "...") {
						elemento.numero++;
						elemento.avance += rc.avance;
						elemento.estaActivo = false;
					}
				});
			}

			this.ActivarFlechas(rc.numeroPagina, rc.numeroPagina - rc.avance, arreglo);
		}
	}

	this.activarPorNumero = function (item, arreglo) {

		if (item.numero != "...") {
			var elementoPaginador = arreglo.find(x => x.estaActivo == true);
			elementoPaginador.estaActivo = false;

			var elemento = arreglo.find(x => x.numero == item.numero);
			elemento.estaActivo = true;
			rc.numeroPagina = item.avance;
		}
	}

	this.ActivarFlechas = function (actual, anterior, arreglo) {
		var elementoPaginador = arreglo.find(x => x.avance == anterior);
		elementoPaginador.estaActivo = false;

		var elemento = arreglo.find(x => x.avance == actual);
		elemento.estaActivo = true;
	}

	rc.inicializaElementoActivoPaginador = function (arreglo) {
		if (arreglo.length > 0)
			arreglo[0].estaActivo = true;
	}

	//////////////////////////////////////////////////////

	///Solo esta se especifica para cagar el arreglo de la tabla
	rc.cargarArregloPaginador = function () {
		Meteor.call('getTotalesRegistrosNotasCredito', rc.avance, function (error, result) {
			if (result) {
				rc.arregloPaginadorAplicadas = arregloPaginador(rc.avance, result.aplicados);
				rc.arregloPaginadorCaducadas = arregloPaginador(rc.avance, result.caducados);
				console.log(rc.arregloPaginadorAplicadas)
				rc.inicializaElementoActivoPaginador(rc.arregloPaginadorAplicadas);
				rc.inicializaElementoActivoPaginador(rc.arregloPaginadorCaducadas);
				$scope.$apply();
			}
		});
	}

	$(document).ready(function () {
		rc.cargarArregloPaginador();
	});


};