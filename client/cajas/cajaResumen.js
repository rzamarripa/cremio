angular.module("creditoMio")
.controller("CajaResumenCtrl", CajaResumenCtrl);
 function CajaResumenCtrl($scope, $meteor, $reactive, $state, toastr,$stateParams){
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	rc.total = 0;
 	rc.$stateParams = $stateParams;
 	this.subscribe('movimientosCaja', () => {
    return [{}]
  });
 	Meteor.apply('getResumen', [$stateParams.caja_id, $stateParams.fechaApertura], function(err, result){
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