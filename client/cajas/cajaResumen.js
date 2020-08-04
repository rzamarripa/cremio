angular.module("creditoMio")
	.controller("CajaResumenCtrl", CajaResumenCtrl);
function CajaResumenCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	rc.total = 0;
	rc.$stateParams = $stateParams;
	rc.fecha = new Date();
	rc.sucursal = {};
	rc.sucursal_id = "";

	Meteor.apply('getResumen', [$stateParams.caja_id, $stateParams.fechaApertura], function (err, result) {
		if (result) {
			rc = _.extend(rc, result);
			Meteor.call("getSucursal", result.caja.sucursal_id, function (error, result) {
				if (result) {
					rc.sucursal = result;
					$scope.$apply();
				}
				else {
				}
			});
			$scope.$apply();
		}
	});

	this.borrarBotonImprimir = function () {
		var printButton = document.getElementById("printpagebutton");
		printButton.style.visibility = 'hidden';
		window.print()
		printButton.style.visibility = 'visible';
	};

};