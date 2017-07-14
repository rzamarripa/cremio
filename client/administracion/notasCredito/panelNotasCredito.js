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
		  	var ncs =  NotasCredito.find({estatus: 1, saldo : {$gt: 0}}).fetch();		 
		  	if (ncs != undefined)
		  	{
				  	_.each(ncs, function(nc){
					  		Meteor.call('getUsuario', nc.cliente_id, function(error, result) {           
					          if (result)
					          {
						          	//console.log(result);
						          	nc.nombreCliente = result.nombreCompleto;
						          	nc.numeroCliente = result.numeroCliente;
						          	$scope.$apply();
					          }
			    			}); 	
			    			if (nc.tieneVigencia)
			    					nc.tieneVigenciaTexto = "Si";
			    			else
			    					nc.tieneVigenciaTexto = "No";
				  	});
		  	}
		  return ncs;
	  },
	  notasCreditoCaducadas : () => {
		  	var ncs =  NotasCredito.find({tieneVigencia: true, vigencia: {$lt: rc.fecha}, estatus: 2 }).fetch();		 
		  	if (ncs != undefined)
		  	{
				  	_.each(ncs, function(nc){
					  		Meteor.call('getUsuario', nc.cliente_id, function(error, result) {           
					          if (result)
					          {
						          	nc.nombreCliente = result.nombreCompleto;
						          	nc.numeroCliente = result.numeroCliente;
						          	$scope.$apply();
					          }
			    			}); 	
			    			if (nc.tieneVigencia)
			    					nc.tieneVigenciaTexto = "Si";
			    			else
			    					nc.tieneVigenciaTexto = "No";
				  	});
		  	}		  
		  return ncs;
	  },
	  notasCreditoAplicadas : () => {
		  var ncs = NotasCredito.find({saldo : 0}).fetch();		 
		  	if (ncs != undefined)
		  	{
				  	_.each(ncs, function(nc){
					  		Meteor.call('getUsuario', nc.cliente_id, function(error, result) {           
					          if (result)
					          {
						          	nc.nombreCliente = result.nombreCompleto;
						          	nc.numeroCliente = result.numeroCliente;
						          	$scope.$apply();
					          }
			    			}); 	
			    			if (nc.tieneVigencia)
			    					nc.tieneVigenciaTexto = "Si";
			    			else
			    					nc.tieneVigenciaTexto = "No";
				  	});
		  	}		  
		  return ncs;
	  },
  });
  
};