angular.module("creditoMio")
.controller("VerificadoresListaCtrl", VerificadoresListaCtrl);
 function VerificadoresListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  //this.buscar = {};
  //this.buscar.nombre = "";
  window.rc = rc;
  
  // this.subscribe('buscarVerificadores', () => {
		// if(this.getReactively("buscar.nombre").length > 4){
		// 	return [{
		//     options : { limit: 5 },
		//     where : { 
		// 			nombreCompleto : this.getReactively('buscar.nombre')
		// 		} 		   
	 //    }];
		// }
  // });
  this.subscribe('verificadores', () => {
		return [{roles:"Verificador"}]; });
  
  this.helpers({
	// 	verificadores : () => {
	// 		return Meteor.users.find({
	// 	  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
	// 	  	roles : ["Verificador"]
	// 		}, { sort : {"profile.nombreCompleto" : 1 }});
	// 	},
	// });
	verificadores : () => {
			return Meteor.users.find({roles:"Verificador" },{ sort: {score: -1, name: 1}});
		},
	});
	
	this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "Masculino")
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