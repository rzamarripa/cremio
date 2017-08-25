angular.module("creditoMio")
.controller("SupervisoresListaCtrl", SupervisoresListaCtrl);
 function SupervisoresListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  this.buscar.nombre = "";
  window.rc = rc;
  
   this.subscribe('supervisor', () => {
		return [{"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",roles:"Supervisor"}]; });
  
  this.helpers({
	 	supervisores : () => {
			return Meteor.users.find({"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
																roles:"Supervisor"});
		},
	});

	
	this.tieneFoto = function(sexo, foto){
		console.log(sexo,foto)
	  if(foto === undefined){
		  if(sexo === "Masculino" )
			  return "img/badmenprofile.jpeg";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
			  
	  }else{
		  return foto;
	  }
  };
  
};