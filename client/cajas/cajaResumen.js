angular.module("creditoMio")
.controller("CajaResumenCtrl", CajaResumenCtrl);
 function CajaResumenCtrl($scope, $meteor, $reactive, $state, toastr,$stateParams){
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	rc.$stateParams = $stateParams;
 	Meteor.apply('getResumen', [$stateParams.caja_id, $stateParams.fechaApertura], function(err, res){
 		rc.resumen = res;
 		$scope.$apply();
 	});
};