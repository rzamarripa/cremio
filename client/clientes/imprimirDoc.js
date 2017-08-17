angular.module("creditoMio")
.controller("ImprimirDocCtrl", ImprimirDocCtrl);
 function ImprimirDocCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams){
 	
 	let rc = $reactive(this).attach($scope);
  window.rc = rc;

  
  
  // this.subscribe('buscarClientes', () => {
	  
		// if(this.getReactively("buscar.nombre").length > 4){
		// 	return [{
		//     options : { limit: 20 },
		//     where : { 
		// 			nombreCompleto : this.getReactively('buscar.nombre')
		// 		} 		   
	 //    }];
		// }
  // });
  
  this.helpers({
		clientes : () => {
			return Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : ["Cliente"]
			}, { sort : {"profile.nombreCompleto" : 1 }});
		},
	});
	
	
  
};