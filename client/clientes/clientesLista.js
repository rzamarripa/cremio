angular.module("creditoMio")
.controller("ClientesListaCtrl", ClientesListaCtrl);
 function ClientesListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	$reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  
  
  
};