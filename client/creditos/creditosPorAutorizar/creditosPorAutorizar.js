angular.module("creditoMio")
.controller("CreditosPorAutorizarCtrl", CreditosPorAutorizarCtrl);
 function CreditosPorAutorizarCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
	this.clientes_ids = [];
  window.rc = rc;
  
  this.subscribe('clientes', () => {
		return [{_id : { $in : this.getReactively("clientes_ids")}}];
	})
  
  this.subscribe('creditos', () => {
		return [{ estatus : 1 }]
  });
  
  this.helpers({
		creditosPorAutorizar : () => {
			var creditos = Creditos.find().fetch();
			if(creditos){
				rc.clientes_ids = _.pluck(creditos, "cliente_id");
			
				_.each(creditos, function(credito){
					credito.cliente = Meteor.users.findOne({_id : credito.cliente_id});
				})
			}
						
			return creditos;
			
		}
	});
	
	this.tieneFoto = function(sexo, foto){
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
  };
  
};