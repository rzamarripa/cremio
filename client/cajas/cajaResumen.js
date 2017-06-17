angular.module("creditoMio")
.controller("CajaResumenCtrl", CajaResumenCtrl);
 function CajaResumenCtrl($scope, $meteor, $reactive, $state, toastr,$stateParams){
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	rc.total = 0;
 	rc.$stateParams = $stateParams;
 	
 	Meteor.apply('getResumen', [$stateParams.caja_id, $stateParams.fechaApertura], function(err, result){
 		rc = _.extend(rc, result);
 		_.each(rc.resumen, function(r, key){
 			rc.total += r;
 		});
 		$scope.$apply();
 	});

};