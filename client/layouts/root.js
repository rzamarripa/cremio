angular.module("creditoMio")
.controller("RootCtrl", RootCtrl);
 function RootCtrl($scope, $meteor, $reactive, $state, toastr){
 	let rc = $reactive(this).attach($scope); 
  $(document).ready(function() {
	  $(".select2").select2();
	});
	
	this.buscar = {};
	this.buscar.nombre = "";
	window.rc = rc;
	
	this.subscribe('buscarClientes', () => {
		console.log("entré");
		if(rc.getReactively("buscar.nombre").length > 0){
			console.log("entré");
			console.log(rc.buscar.nombre);
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : rc.getReactively('buscar.nombre')
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
	
	this.isLoggedIn = function(){
	  return Meteor.user();
  }
  
  this.buscarCliente = function(cliente){
	  console.log(cliente);
  }
}