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
	
	this.cambiarEstatus = function(id)
	{
			var objeto = Meteor.users.findOne({_id:id});
			if(objeto.profile.estatus == true)
				objeto.profile.estatus = false;
			else
				objeto.profile.estatus = true;
			
			Meteor.call('cambiaEstatusUsuario', id, objeto.profile.estatus, function(error, response) {
	
				   if(error)
				   {
				    console.log('ERROR :', error);
				    return;
				   }

			});		
			
  };	  
};