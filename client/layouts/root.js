angular.module("creditoMio").controller("RootCtrl", ['$scope', '$meteor', '$reactive', function ($scope, $meteor, $reactive)
{
	let root = $reactive(this).attach($scope);
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscando = false;
	this.clientesRoot = [];
	this.clientes_ids = [];
	this.hoy = new Date();
	
	this.subscribe('creditos', () => {
		return [{cliente_id : { $in : this.getReactively("clientes_ids")}}];
	})
	
	this.subscribe('buscarClientes', () => {
		if(this.getReactively("buscar.nombre").length > 3){
			console.log(root.buscar.nombre);
			root.buscando = true;
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
  });
  
  this.helpers({
		clientesRoot : () => {
			var clientes = Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : ["Cliente"]
			}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
			if(clientes){
				this.clientes_ids = _.pluck(clientes, "_id");
			
				_.each(clientes, function(cliente){
					cliente.profile.creditos = Creditos.find({cliente_id : cliente._id}).fetch();
				})
			}
						
			return clientes;
			
		}
	});

	this.tieneFoto = function(foto, sexo){
		
	  if(foto === undefined){
		  if(sexo === "masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
	  }else{
		  return foto;
	  }
  }    
}])