angular
.module("creditoMio")
.controller("TicketPagoCtrl", TicketPagoCtrl);
function TicketPagoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	rc.pago = {};
	rc.caja = {};	
	rc.cliente = {};
	rc.sucursal = {};
	rc.cajero = {};
	window.rc = rc;
	this.subscribe('pagos',()=>{
		return [{
			_id : $stateParams.pago_id
		}]
	},
	{
		onReady: function () {
			rc.pago = Pagos.findOne($stateParams.pago_id);
			rc.pago = rc.pago? rc.pago:{};

			Meteor.call('datosCliente', rc.pago.usuario_id ,function(err, res){
				rc.cliente = res;
			});

			rc.subscribe('cajas',()=>{
				return[{
					_id : rc.pago.caja_id? rc.pago.caja_id:""
				}]
			},
			{
				onReady: function () {
					rc.caja = Cajas.findOne(rc.pago.caja_id);
					rc.caja = rc.caja? rc.caja:{};
				}
			});
			rc.subscribe('cajeroId',()=>{
				return[{
					id: rc.pago.usuarioCobro_id? rc.pago.usuarioCobro_id:""
				}]
			},
			{
				onReady:()=>{
					rc.cajero = Meteor.users.findOne(rc.pago.usuarioCobro_id);
					rc.cajero = rc.cajero? rc.cajero:{};
				}
			});
			rc.subscribe('sucursales',()=>{
				return[{
					_id: rc.pago.sucursalPago_id? rc.pago.sucursalPago_id:""
				}]
			},
			{
				onReady:()=>{
					rc.sucursal = Sucursales.findOne(rc.pago.sucursalPago_id);
					rc.sucursal = rc.sucursal? rc.sucursal:{};
				}
			});
		}
	});

	this.borrarBotonImprimir= function()
	{
		var printButton = document.getElementById("printpagebutton");
	 	printButton.style.visibility = 'hidden';
	 	window.print()
	 	printButton.style.visibility = 'visible';
	};
};