angular.module("creditoMio")
.controller("CajerosListaCtrl", CajerosListaCtrl);
 function CajerosListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  this.buscar.nombre = "";
  window.rc = rc;
  
/*
   this.subscribe('buscarCajeros', () => {
		 if(this.getReactively("buscar.nombre").length > 0){
		 	console.log(rc.buscar.nombre);
		 	return [{
		     options : { limit: 10 },
		     where : { 
			    "profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", 
		 			"profile.nombreCompleto" : this.getReactively('buscar.nombre')
		 		} 		   
	     }];
		 }
   });
*/
  this.subscribe('cajero', () => {
		return [{"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",roles:"Cajero"}]; });
  
  this.helpers({
		cajeros : () => {	
			return Meteor.users.find({"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
																roles:"Cajero"});
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