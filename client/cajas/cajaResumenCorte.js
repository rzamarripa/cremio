angular.module("creditoMio")
.controller("CajaResumenCorteCtrl", CajaResumenCorteCtrl);
 function CajaResumenCorteCtrl($scope, $meteor, $reactive, $state, toastr,$stateParams){
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	rc.total = 0;
 	rc.$stateParams = $stateParams;
 	this.subscribe('movimientosCaja', () => {
    return [{}]
  });
 	Meteor.apply('getCorte', [$stateParams.corte_id], function(err, result){
 		rc = _.extend(rc, result);
 	 	$scope.$apply();
 	});
 	
 		
 	this.borrarBotonImprimir= function()
	{
		var printButton = document.getElementById("printpagebutton");
	 	printButton.style.visibility = 'hidden';
	 	window.print()
	 	printButton.style.visibility = 'visible';
	};

};