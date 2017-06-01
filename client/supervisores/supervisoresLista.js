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
  
  this.subscribe('buscarSupervisores', () => {
		if(this.getReactively("buscar.nombre").length > 0){
			console.log(rc.buscar.nombre);
			return [{
		    options : { limit: 51 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
  });
  
  this.helpers({
		supervisores : () => {
			return Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : ["Supervisor"]
			}, { sort : {"profile.nombreCompleto" : 1 }});
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