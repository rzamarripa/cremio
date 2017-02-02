angular.module("creditoMio")
.controller("CobranzapordiaCtrl", CobranzapordiaCtrl);
 function CobranzapordiaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	
	this.fechaI = new Date();
  this.fechaI.setHours(0,0,0,0);
  this.fechaF = new Date();
  this.fechaF.setHours(60,0,0,0);
  
  
  this.subscribe('planPagos', () => {
			return [{fechaLimite: {$gte: rc.getReactively("fechaI"), $lt: rc.getReactively("fechaF")}}]
  });
  
  this.helpers({
		cobranzapordia : () => {
			return PlanPagos.find();
		},
	});
};