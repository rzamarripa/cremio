angular.module("creditoMio")
	.controller("HomeCtrl", HomeCtrl);
function HomeCtrl($scope, $meteor, $reactive, $state, toastr) {

	let rc = $reactive(this).attach($scope);

	rc.estaCerrada = false;
	rc.cuentas = [];
	rc.cajas = [];
	rc.cajeros = [];
	rc.cajerosNombres = [];

	//rc.sucursal = {};
	rc.sucursal_id = "";

	this.caja_id = "";
	this.cajero_id = "";
	this.cajeros_id = [];
	this.fechaInicial = new Date();
	this.fechaInicial.setHours(0, 0, 0, 0);
	this.fechaFinal = new Date();
	this.fechaFinal.setHours(23, 59, 59, 999);

	if (Meteor.user().username != "admin") {
		//console.log("User: ", Meteor.user().profile.sucursal_id)	
		rc.sucursal_id = Meteor.user().profile.sucursal_id;

		Meteor.call("getSucursal", Meteor.user().profile.sucursal_id, function (error, result) {
			if (result) {
				rc.sucursal = result;
			}
			else {

			}
		});
	}

	if (Meteor.user().roles == "Gerente") {

		// this.subscribe('sucursales', () => {
		// 	return [{}]
		// });

		let cajasS = this.subscribe('cajas', () => {

			return [{
				sucursal_id: Meteor.user() != undefined ? rc.getReactively("sucursal_id") : "",
				estadoCaja: 'Abierta'
			}]
		});

		//Quite el filtro
		let fondos = this.subscribe('cuenta', () => {
			return [{}]
		});

		this.subscribe('allCajeros', () => {
			return [{
				"profile.sucursal_id": Meteor.user() != undefined ? rc.getReactively("sucursal_id") : "",
				"profile.estatus": true,
				roles: ["Cajero"]
			}]
		});
		let pagosS = this.subscribe('pagos', () => {
			return [{
				sucursalPago_id: Meteor.user() != undefined ? rc.getReactively("sucursal_id") : "",
				fechaPago: { $gte: rc.getReactively("fechaInicial"), $lte: rc.getReactively("fechaFinal") },
				estatus: 1
			}]
		});

		this.helpers({
			sucursal: () => {
				if (Meteor.user().username != "admin") {
					var s = Sucursales.findOne({ _id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" });
					if (s != undefined) {
						rc.sucursal = s;
						rc.sucursal_id = s._id;
					}
					return rc.sucursal;
				}
			},
			cajeros: () => {
				if (Meteor.user() && cajasS.ready()) {
					var usuarios = Meteor.users.find({
						"profile.sucursal_id": Meteor.user() != undefined ? rc.getReactively("sucursal_id") : "",
						"profile.estatus": true,
						roles: ["Cajero"]
					}).fetch();

					var cajerosCM = [];
					_.each(usuarios, function (usuario) {

						var estaEnCaja = Cajas.findOne({ usuario_id: usuario._id });
						//console.log(estaEnCaja);
						if (estaEnCaja != undefined) {
							cajerosCM.push(usuario);
						}
					});

					rc.cajeros_id = _.pluck(cajerosCM, "_id");

					return cajerosCM;
				}
			},
			catidadCobranzaDiaria: () => {
				var arreglo = [];

				if (pagosS.ready() && fondos.ready()) {

					_.each(this.cajeros, function (cajero) {

						var suma = 0;
						var pago = Pagos.find({
							usuarioCobro_id: cajero._id,
							fechaPago: { $gte: rc.getReactively("fechaInicial"), $lt: rc.getReactively("fechaFinal") }
						}).fetch();


						_.each(pago, function (p) {

							var tipoFondo = Cuentas.findOne({ tipoIngreso_id: p.tipoIngreso_id });

							if (tipoFondo.tipoCuenta == 'Consignia' || tipoFondo.tipoCuenta == 'Banco') {
								suma += Number(parseFloat(p.totalPago).toFixed(2));
								suma = Number(parseFloat(suma).toFixed(2));
							}

						})
						arreglo.push(suma);

					});

				}

				return arreglo;
			},
			cajerosNombres: () => {

				if (cajasS.ready()) {
					var cajerosNombre = [];
					var cajeros = Meteor.users.find({ roles: ["Cajero"] }).fetch();

					if (cajeros != undefined) {
						_.each(cajeros, function (cajero) {
							var estaEnCaja = Cajas.findOne({ usuario_id: cajero._id });
							if (estaEnCaja != undefined) {
								var nombre = cajero.profile.nombre + " " + cajero.profile.apellidoPaterno + " " + cajero.profile.apellidoMaterno;
								cajerosNombre.push(nombre);
							}
						});
					}

					return cajerosNombre;
				}
			},
			graficaCajeros: () => {

				data = [];

				if (pagosS.ready()) {
					data.push({
						name: "Cajeros",
						data: rc.getReactively("catidadCobranzaDiaria")
					});
				}

				$('#container').highcharts({
					chart: { type: 'column' },
					title: { text: 'Cobranza Diaria de Efectivo y Bancos' },
					subtitle: {
						text: 'Fecha: ' + moment(rc.getReactively("fechaInicial")).format('LL')
					},
					xAxis: {
						categories: rc.cajerosNombres,
						crosshair: true
					},
					yAxis: {
						min: 0,
						title: {
							text: 'Cantidad $'
						}
					},
					tooltip: {
						headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
						pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
							'<td style="color:{series.color};padding:0"><b>{point.y:.0f} </b></td></tr>',
						footerFormat: '</table>',
						shared: true,
						useHTML: true
					},
					plotOptions: {
						column: {
							pointPadding: 0.2,
							borderWidth: 0
						}
					},
					series: data
				}
				);
				return data;
			}
		});
	}

	else if (Meteor.user().roles == "Cajero") {
		let cajasS = this.subscribe('cajas', () => {
			return [{ usuario_id: Meteor.userId() }]
		});
		this.subscribe('tiposIngreso', () => {
			return [{ estatus: true }]
		});

		this.helpers({
			cajas: () => {
				if (Meteor.user()) {

					var c = Cajas.findOne({});

					if (c != undefined) {
						this.caja_id = c._id;
						if (c.estadoCaja == "Cerrada")
							rc.estaCerrada = true;
						else {
							rc.cuentas = [];
							_.each(c.cuenta, function (cue, index) {
								var ti = TiposIngreso.findOne({ _id: index });
								if (ti != undefined)
									rc.cuentas.push({ tipoIngreso: ti.nombre, saldo: cue.saldo });
							});
						}
					}
				}
			},
		});
	}

	this.abrirModal = function () {
		//console.log(Meteor.user());
		$("#modalSucursal").modal('show');
		rc.sucursales = Sucursales.find({ estatus: true }).fetch();
		rc.modalSucursal_id = Meteor.user().profile.sucursal_id;
	}

	this.asignar = function (sucursal_id, form) {
		if (form.$invalid) {
			toastr.error('seleccione los datos.');
			return;
		}
		Meteor.call('updateSucursal', Meteor.userId(), sucursal_id, function (error, result) {

			if (result) {

				rc.sucursal = Sucursales.findOne(Meteor.user().profile.sucursal_id);
				$("#modalSucursal").modal('hide');
				location.reload()
			}
		});

	}
};