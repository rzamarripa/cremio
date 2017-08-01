angular.module("creditoMio")
.controller("validacionCARPCtrl", validacionCARPCtrl);
 function validacionCARPCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);

  this.objeto = {}; 
  this.buscar = {};
  this.buscar.nombre = "";
  
  rc.personas = [];
  
  window.rc = rc;
  	
	this.buscarPersona = function(nombre){
			if(nombre.length > 4){
					Meteor.call('getPersonas', nombre, function(error, result) {           
	          if (result)
	          {
	              //console.log("Personas:", result);
								rc.personas = [];
								_.each(result.clientes, function(cliente){
										rc.personas.push(cliente);
								});
								_.each(result.avales, function(aval){
										rc.personas.push(aval);
								});
								_.each(result.referenciasPersonales, function(referenciaPersonal){
										rc.personas.push(referenciaPersonal);
								});
								
	              $scope.$apply();
	          }
	        
					}); 	
			} else { rc.personas = [];}

	}
	
	this.tieneFoto = function(sexo, foto){
		
	  if(foto === undefined){
		  if(sexo === "MASCULINO")
			  return "img/badmenprofile.png";
			else if(sexo === "FEMENINO"){
				return "img/badgirlprofile.png";
			}else{
				//console.log(foto);		
				return "img/badprofile.png";
			}
			  
	  }else{
		  return foto;
	  }
  };
  
};