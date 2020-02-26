angular
	.module("creditoMio")
	.controller("TicketDistribuidorCtrl", TicketDistribuidorCtrl);
function TicketDistribuidorCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;


	rc.distribuidor = {};
	rc.beneficiario = {};

	rc.credito = {};
	rc.sucursal = {};
	rc.cajero = {};
	rc.pago = {};
	rc.fecha = "";
	rc.planPagos = [];
	rc.sucursal = {};

	if ($stateParams.distribuidor_id != undefined) {
		rc.sucursal_id = Meteor.user() != undefined && Meteor.user().profile.sucursal_id;
		Meteor.call("getSucursalDistribuidor", $stateParams.distribuidor_id, function (error, result) {
			if (result) {
				rc.sucursal = result;
				//console.log("Suc:", rc.sucursal)
				$scope.$apply();
			}
			else {

			}
		});

		// console.log($stateParams.diaC)
		// console.log($stateParams.mesC)
		// console.log($stateParams.anioC)

		rc.fecha = new Date($stateParams.anio, $stateParams.mes, $stateParams.dia);
		//Mejorar 
		
		if ($stateParams.diaC == 15) {
			rc.fechaC = new Date($stateParams.anioC, $stateParams.mesC - 1, $stateParams.diaC);
			rc.fechaC.setHours(0, 0, 0, 0);
			rc.fechaCF = new Date($stateParams.anioC, $stateParams.mesC - 1, Number($stateParams.diaC) + 2);
			rc.fechaCF.setHours(23, 59, 59, 999);
		}
		else if ($stateParams.diaC == 1) {
			rc.fechaC = new Date($stateParams.anioC, $stateParams.mesC - 1, $stateParams.diaC);
			rc.fechaC.setHours(0, 0, 0, 0);

			rc.fechaCF = new Date($stateParams.anioC, $stateParams.mesC - 1, Number($stateParams.diaC) + 1);
			rc.fechaCF.setHours(23, 59, 59, 999);
		}
		else {
			rc.fechaC = new Date($stateParams.anioC, $stateParams.mesC - 1, $stateParams.diaC);
			rc.fechaC.setHours(0, 0, 0, 0);
			rc.fechaCF = new Date(rc.fechaC);
			rc.fechaCF.setHours(23, 59, 59, 999);
		}


		var n = rc.fecha.getDate();
		var fechaInicial = "";
		//var fechaInicial = new Date(rc.fecha);

		//console.log(n);			
		if (n < 15) {
			fechaInicial = new Date(rc.fecha.getFullYear(), rc.fecha.getMonth(), 30, 0, 0, 0, 0);
		}
		else //if (n >= 5 && n < 20)		
		{
			fechaInicial = new Date(rc.fecha.getFullYear(), rc.fecha.getMonth() + 1, 16, 0, 0, 0, 0);
		}

		fechaInicial.setHours(0, 0, 0, 0);
		var fechaFinal = new Date(fechaInicial.getTime());
		fechaFinal.setHours(23, 59, 59, 999);


		//console.log("FI:", fechaInicial);
		//console.log("FF:", fechaFinal);
		
		//console.log("FC:", rc.fechaC);
		//console.log("CF:", rc.fechaCF);

		rc.planPagos = [];
		Meteor.call('getPlanPagosDistribuidorTickets', fechaInicial, fechaFinal, $stateParams.distribuidor_id, function (error, result) {
			if (result) {
				//console.log(result);
				//console.log(rc.fechaC);
				//Solo Pintar los del ultimo Corte
				_.each(result, function (pp) {
					//console.log("limit3:", pp.fechaLimite);
					if (pp.fechaLimite > rc.fechaC && pp.fechaLimite < rc.fechaCF)
						rc.planPagos.push(pp);

				});

				$scope.$apply();
			}

		});

	}

	this.borrarBotonImprimir = function () {
		var printButton = document.getElementById("printpagebutton");
		printButton.style.visibility = 'hidden';
		window.print()
		printButton.style.visibility = 'visible';
	};





};