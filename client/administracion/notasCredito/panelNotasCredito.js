angular
.module("creditoMio")
.controller("PanelNotasCreditoCtrl", PanelNotasCreditoCtrl);
function PanelNotasCreditoCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	
	window = rc;
	
  //this.action = true;
	let Cred = this.subscribe('creditos',()=>{
			return [{requiereVerificacion : true , estatus: 0}]
	});
		
		
  this.helpers({
	  creditos : () => {
		  return Creditos.find();
	  },
	  datosCreditos : () => {
			if(Cred.ready()){
				_.each(rc.creditos, function(credito){
					
						var cliente = {};
						Meteor.call('getUsuario', credito.cliente_id, function(error, result) {
						   if(error)
						   {
							    console.log('ERROR :', error);
							    return;
						   }
						   if(result)
						   {	
								 		cliente = result;
										credito.nombreCliente = cliente.nombreCompleto;
										$scope.$apply();
							 }
						});
						
						Meteor.call('getVerificacion', credito.cliente_id, function(error, result) {
						   if(error)
						   {
							    console.log('ERROR :', error);
							    return;
						   }
						   if(result)
						   {	
								 		cliente = result;
										credito.nombreCliente = cliente.nombreCompleto;
										$scope.$apply();
							 }
						});
						
						
						
				})
			}
	  }
  });
  
};