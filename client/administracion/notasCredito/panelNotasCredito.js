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
						          	nc.nombreCliente = result.nombreCompleto;
						          	nc.numeroCliente = result.numeroCliente;
						          	$scope.$apply();
					          }
			    			});
			    			
			    			Meteor.call('getUsuario', nc.createdBy, function(error, result) {           
					          if (result)
					          {
						          	nc.usuario = result.nombre;
						          	$scope.$apply();
					          }
			    			});
			    			 	
				  	});
		  	}
		  return ncs;
	  },
	  notasCreditoCaducadas : () => {
		  	var ncs =  NotasCredito.find({estatus: 2 }).fetch();		 
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
			    			
			    			Meteor.call('getUsuario', nc.createdBy, function(error, result) {           
					          if (result)
					          {
						          	nc.usuario = result.nombre;
						          	$scope.$apply();
					          }
			    			});
			    			 	
				  	});
		  	}		  
		  return ncs;
	  },
	  notasCreditoAplicadas : () => {
		  var ncs = NotasCredito.find({estatus: 3 , saldo : 0}).fetch();		 
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
			    			
			    			Meteor.call('getUsuario', nc.createdBy, function(error, result) {           
					          if (result)
					          {
						          	nc.usuario = result.nombre;
						          	$scope.$apply();
					          }
			    			});
			    			
				  	});
		  	}		  
		  return ncs;
	  },
  });
  
};