angular.module("creditoMio")
.controller("ReimpresionTicketsCtrl", ReimpresionTicketsCtrl);
 function ReimpresionTicketsCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
  rc.fechaInicial = new Date();
  rc.fechaInicial.setHours(0,0,0,0);
  rc.fechaFinal = new Date();
  rc.fechaFinal.setHours(23,59,59,999);
  
  rc.pagos = [];
  
	//preguntar si esta abierta la caja
	var user = Meteor.userId();
			
						
	loading(true);		
	Meteor.call("getPagosDiarios", Meteor.userId(), rc.fechaInicial, rc.fechaFinal, function(error, result){
				if  (result)
				{
						rc.pagos = result;
						loading(false);
						$scope.$apply();
				}
	});
		
			
		
	  
  
  
  
  
 	
 	 
 
  
	
	 
	
  
  
	
	
	
};