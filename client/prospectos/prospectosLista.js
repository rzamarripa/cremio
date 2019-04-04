angular.module("creditoMio")
.controller("ProspectosListaCtrl", ProspectosListaCtrl);
 function ProspectosListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  this.buscar.nombre = "";
  window.rc = rc;
  
  this.subscribe('buscarProspectos', () => {
	  
		if(this.getReactively("buscar.nombre").length > 4){
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
  });
  
  this.helpers({
		prospectos : () => {
			var arreglo = Prospectos.find({
		  	"nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' }
			}, { sort : {"nombreCompleto" : 1 }}).fetch();
			
			if (arreglo != undefined)			
			{
				_.each(arreglo, function(p){
						Meteor.call('getUsuario', p.distribuidor_id, function(error, result) {           
				          if (result)
				          {
				              p.distribuidor 	= result.nombreCompleto;
				              p.numeroCliente = result.numeroCliente;
				              $scope.$apply();
				          }
				    }); 
						
				});
			}
			return arreglo;
		},
	});
	
    
};