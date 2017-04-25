angular.module("creditoMio")
.controller("MovimientosCajaCtrl", MovimientosCajaCtrl);
 function MovimientosCajaCtrl($scope, $meteor, $reactive, $state, toastr,$stateParams){
 	
 	let rc = $reactive(this).attach($scope);
	
	 
	this.objeto = {}; 
	this.buscar = {};
	

	Meteor.call("movimientosCaja",$stateParams,function(error,result){
		rc.movimientosCaja=result 
		$scope.$apply()
	});
		//movimientosCaja 
	

	
	
};