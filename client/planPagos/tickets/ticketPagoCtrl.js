angular
	.module("creditoMio")
	.controller("TicketPagoCtrl", TicketPagoCtrl);
function TicketPagoCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;

	rc.pago = {};
	rc.caja = {};
	rc.cliente = {};
	rc.credito = {};
	rc.sucursal = {};
	rc.cajero = {};
	rc.tipoIngreso = {};
	rc.sucursal = {};


	if (Meteor.user() != undefined) {
		rc.sucursal_id = Meteor.user() != undefined && Meteor.user().profile.sucursal_id;
		Meteor.call("getSucursal", Meteor.user().profile.sucursal_id, function (error, result) {
			if (result) {
				rc.sucursal = result;
			}
			else {

			}
		});
	}

	this.subscribe('tiposIngreso', () => {
		return [{}]
	});

	this.subscribe('pagos', () => {
		return [{
			_id: $stateParams.pago_id
		}]
	},
		{
			onReady: function () {
				//console.log($stateParams.pago_id);

				rc.pago = Pagos.findOne($stateParams.pago_id);

				rc.tipoIngreso = TiposIngreso.findOne(rc.pago.tipoIngreso_id);
				rc.pago = rc.pago ? rc.pago : {};

				rc.pago.planPagos = rc.pago.planPagos.sort(function (a, b) {
					return a["folioCredito"] - b["folioCredito"] || a["numeroPago"] - b["numeroPago"];
				});

				_.each(rc.pago.planPagos, function (pago) {
					if (pago.descripcion == "Cargo Moratorio")
						rc.pago.saldoCargoMoratorio -= Number(parseFloat(pago.totalPago).toFixed(2));
				});

				rc.pago.saldoCargoMoratorio = Number(parseFloat(rc.pago.saldoCargoMoratorio).toFixed(2));

				Meteor.call('datosClienteTicket', rc.pago.usuario_id, function (err, res) {
					rc.cliente = res;
					//console.log(res)
				});

				//console.log(rc.pago.totalPago);
				rc.pago.totalPago = round(Number(parseFloat(rc.pago.totalPago).toFixed(3)),2);

				var valores = (rc.pago.totalPago).toString().split('.');

				rc.pago.centavos = valores[1];

				rc.pago.letra = NumeroALetras(valores[0]);
				//console.log(rc.pago.letra);

				Meteor.call('getCredito', rc.pago.credito_id, function (err, res) {
					rc.credito = res;
				});

				rc.subscribe('cajas', () => {
					return [{
						_id: rc.pago.caja_id ? rc.pago.caja_id : ""
					}]
				},
					{
						onReady: function () {
							rc.caja = Cajas.findOne(rc.pago.caja_id);
							rc.caja = rc.caja ? rc.caja : {};
						}
					});
				rc.subscribe('cajeroId', () => {
					return [{
						id: rc.pago.usuarioCobro_id ? rc.pago.usuarioCobro_id : ""
					}]
				},
					{
						onReady: () => {
							rc.cajero = Meteor.users.findOne(rc.pago.usuarioCobro_id);
							rc.cajero = rc.cajero ? rc.cajero : {};
						}
					});
				rc.subscribe('sucursales', () => {
					return [{
						_id: rc.pago.sucursalPago_id ? rc.pago.sucursalPago_id : ""
					}]
				},
					{
						onReady: () => {
							rc.sucursal = Sucursales.findOne(rc.pago.sucursalPago_id);
							rc.sucursal = rc.sucursal ? rc.sucursal : {};
						}
					});
			}
		});

	this.borrarBotonImprimir = function () {
		var printButton = document.getElementById("printpagebutton");
		printButton.style.visibility = 'hidden';
		window.print()
		printButton.style.visibility = 'visible';
	};


	function round(value, decimals) {
		return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
	}


};