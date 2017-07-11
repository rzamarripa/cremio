angular
.module("creditoMio")
.controller("PanelNotasCreditoCtrl", PanelNotasCreditoCtrl);
function PanelNotasCreditoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	
	window = rc;
	
	rc.fecha = "";
	rc.fecha = new Date();
  rc.fecha.setHours(0,0,0,0);
	
	this.subscribe('notasCredito',()=>{
			return [{}]
	});
				
  this.helpers({
	  notasCreditoConSaldo : () => {
		  return NotasCredito.find({saldo : {$gte: 0}});
	  },
	  notasCreditoCaducadas : () => {
		  return NotasCredito.find({tieneVigencia: true, vigencia: {$lt: rc.fecha}});
	  },
	  notasCreditoAplicadas : () => {
		  return NotasCredito.find({saldo : 0});
	  },
  });
  
};