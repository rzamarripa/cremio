angular
	.module('creditoMio')
	.controller('PromotorasDetalleCtrl', PromotorasDetalleCtrl);

function PromotorasDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {

	rc = $reactive(this).attach($scope);

	window.rc = rc;

	rc.numeroPagina = 0;
	rc.avance = 30;
	rc.arregloComisiones = [];
	rc.arregloHistorial = [];

	rc.objeto = [];
	rc.promotora_id = "";
	rc.totalComisiones = 0;

	rc.ban = false;
	rc.selected_numero = 0;

	this.subscribe('sucursales', () => {
		return [{}]
	},
		{
			onReady: function () {
				rc.sucursales = Sucursales.find({ estatus: true }).fetch();
				rc.sucursal_id = Sucursales.findOne(Meteor.user().profile.sucursal_id)._id;
			}
		});

	if (Roles.userIsInRole(Meteor.userId(), ["Promotora"])) {
		rc.promotora_id = Meteor.userId();
		rc.objeto = Meteor.users.findOne({ _id: rc.promotora_id });
	}
	else if ($stateParams.objeto_id != "") {
		rc.promotora_id = $stateParams.objeto_id;
		this.subscribe('promotorComposite', () => {
			return [{ _id: rc.promotora_id }];
		},
			{
				onReady: function () {
					var cli = Meteor.users.findOne({ _id: rc.promotora_id });
					cli.profile.pais = Paises.findOne(cli.profile.pais_id).nombre;
					cli.profile.estado = Estados.findOne(cli.profile.estado_id).nombre;
					cli.profile.municipio = Municipios.findOne(cli.profile.municipio_id).nombre;
					cli.profile.ciudad = Ciudades.findOne(cli.profile.ciudad_id).nombre;
					cli.profile.colonia = Colonias.findOne(cli.profile.colonia_id).nombre;
					cli.profile.nacionalidad = Nacionalidades.findOne(cli.profile.nacionalidad_id).nombre;
					cli.profile.estadoCivil = EstadoCivil.findOne(cli.profile.estadoCivil_id).nombre;
					cli.profile.ocupacion = Ocupaciones.findOne(cli.profile.ocupacion_id).nombre;

					rc.objeto = cli;
				}
			});
	}

	this.subscribe('configuraciones', () => {
		return [{}];
	},
		{
			onReady: function () {
				const configuraciones = Configuraciones.findOne({});
				rc.comisionCreditoPersonal = configuraciones.comisionPromotoraCreditoPersonal;
				rc.comisionDistribuidor = configuraciones.comisionPromotoraDistribuidor;
			}
		});

	this.subscribe('creditosPromotoraComposite', () => {
		return [{
			options: {
				skip: rc.getReactively("numeroPagina"),
				limit: rc.avance
			},
			where: {
				promotora_id: rc.promotora_id,
				estaPagadoComision: false,
			}
		}];
	});

	this.subscribe('pagosHistoricoPromotora', () => {

		return [{
			options: {
				skip: rc.getReactively("numeroPagina"),
				limit: rc.avance
			},
			where: {
				cliente_id: rc.promotora_id
			}
		}];
		//return [{cliente_id : $stateParams.objeto_id}];
	});

	this.helpers({
		comisiones: () => {

			rc.totalComisiones = 0;
			var arreglo = {};
			Creditos.find({ promotora_id: rc.promotora_id }, { sort: { fechaEntrega: 1 } }).map(function (c) {

				//obtener los datos del crédito
				c.cliente = Meteor.users.findOne(c.cliente_id).profile.nombreCompleto;
				c.usuario = Meteor.users.findOne(c.usuario_id).profile.nombre;
				c.sucursal = Sucursales.findOne(c.sucursal_id).nombreSucursal;

				var fecha = new Date(c.fechaEntrega)
				var dia = fecha.getDate();
				var numeroQuincena = "";
				var subindice = "";
				var numeroDia = 0;
				if (dia <= 15) {
					numeroQuincena = "1";
					numeroDia = 15;
				}
				else {
					numeroQuincena = "2";
					numeroDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
				}

				if (c.tipo == "creditoP") {
					c.tipoCredito = "Crédito Personal";
					c.comision = rc.comisionCreditoPersonal
				}
				else if (c.tipo == "vale") {
					c.tipoCredito = "Vale";
					c.comision = rc.comisionDistribuidor
				}
				else {
					c.tipoCredito = "Crédito Personal Distribuidor";
					c.comision = rc.comisionCreditoPersonal;
				}
				rc.totalComisiones += c.comision;

				subindice = numeroQuincena + "-" + (fecha.getMonth() + 1) + "-" + fecha.getFullYear();
				if (arreglo[subindice] == undefined) {
					arreglo[subindice] = {};
					arreglo[subindice].creditos = [];
					arreglo[subindice].creditos.push(c);
					arreglo[subindice].quincena = numeroQuincena;
					arreglo[subindice].cantidad = 1;
					arreglo[subindice].fecha = new Date(fecha.getFullYear(), fecha.getMonth() + 1, numeroDia);

					if (c.tipo == "creditoP") {
						arreglo[subindice].comisiones = rc.comisionCreditoPersonal;
					}
					else if (c.tipo == "vale")
						arreglo[subindice].comisiones = rc.comisionDistribuidor;


				}
				else {
					arreglo[subindice].creditos.push(c);
					arreglo[subindice].quincena = numeroQuincena;
					arreglo[subindice].cantidad++;
					arreglo[subindice].fecha = new Date(fecha.getFullYear(), fecha.getMonth() + 1, numeroDia);
					if (c.tipo == "creditoP")
						arreglo[subindice].comisiones += rc.comisionCreditoPersonal;
					else if (c.tipo == "vale")
						arreglo[subindice].comisiones += rc.comisionDistribuidor;

				}

				return c;
			});

			rc.arregloComisiones = _.toArray(arreglo);
		},
		pagos: () => {
			return Pagos.find({ usuario_id: rc.promotora_id }).map(function (p) {

				
				p.estatus = MovimientosCajas.find({origen_id: p._id, tipoMovimiento: "Cancelación"}).count() > 0 ? "Cancelado" : "Aplicado";
				//p.movimientoCaja = MovimientosCajas.findOne({origen_id: p._id, tipoMovimiento: "Cancelación"});

				p.usuario = Meteor.users.findOne(p.usuarioCobro_id).profile.nombre;
				p.sucursal = Sucursales.findOne(p.sucursalPago_id).nombreSucursal;

				return p;
			});
		},
	});

	//////////////////////////////////////////////////////////////////////////////////////////

	this.ocultarRol = function (rol) {
		return Roles.userIsInRole(Meteor.userId(), rol)
	}

	this.selCorte = function (objeto, num) {
		rc.ban = !rc.ban;
		rc.selected_numero = num;
	};

	this.isSelected = function (objeto) {
		return rc.selected_numero === objeto;
	};

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
		Meteor.call('getTotalesRegistrosCreditosPromotoras', rc.avance, rc.promotora_id, function (error, result) {
			if (result) {
				//rc.arregloComisiones = arregloPaginador(rc.avance, result);
				rc.arregloHistorial = arregloPaginador(rc.avance, result.Pagos);
				rc.inicializaElementoActivoPaginador(rc.arregloHistorial);
				$scope.$apply();
			}
		});
	}

	$(document).ready(function () {
		rc.cargarArregloPaginador();
	});


}