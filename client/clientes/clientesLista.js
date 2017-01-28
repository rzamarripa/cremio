angular.module("creditoMio")
.controller("ClientesListaCtrl", ClientesListaCtrl);
 function ClientesListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  this.buscar.nombre = "";
  window.rc = rc;
  
  this.subscribe('buscarClientes', () => {
	  
		if(this.getReactively("buscar.nombre").length > 4){
			console.log(rc.buscar.nombre);
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
  });
  
  this.helpers({
		clientes : () => {
			return Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : ["Cliente"]
			}, { sort : {"profile.nombreCompleto" : 1 }});
		},
	});
	
	this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
			  
	  }else{
		  return foto;
	  }
  };
  
};