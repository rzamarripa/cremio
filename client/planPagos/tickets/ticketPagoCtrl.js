angular
.module("creditoMio")
.controller("TicketPagoCtrl", TicketPagoCtrl);
function TicketPagoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	rc.pago = {};
	rc.caja = {};	
	rc.cliente = {};
	rc.credito = {};
	rc.sucursal = {};
	rc.cajero = {};
	rc.tipoIngreso = {};
	
	window.rc = rc;
	
	this.subscribe('tiposIngreso',()=>{
		return [{}]
	});
		
	this.subscribe('pagos',()=>{
		return [{
			_id : $stateParams.pago_id
		}]
	},
	{
		onReady: function () {
			rc.pago = Pagos.findOne($stateParams.pago_id);
			rc.tipoIngreso = TiposIngreso.findOne(rc.pago.tipoIngreso_id);
			rc.pago = rc.pago? rc.pago:{};
			console.log	(rc.pago.saldoAnterior);


			Meteor.call('datosCliente', rc.pago.usuario_id ,function(err, res){
				rc.cliente = res;
			});
			
			Meteor.call('getCredito', rc.pago.credito_id ,function(err, res){
				rc.credito = res;
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