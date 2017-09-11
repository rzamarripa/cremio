angular.module("creditoMio")
.controller("CreditosPorAutorizarCtrl", CreditosPorAutorizarCtrl);
 function CreditosPorAutorizarCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
	this.clientes_ids = [];
	this.verificaciones_ids = [];
	this.creditoRechazar = "";
	this.motivo = "";
	
  window.rc = rc;
  
  this.subscribe('clientes', () => {
		return [{_id : { $in : this.getReactively("clientes_ids")}}];
	})
  
  this.subscribe('creditos', () => {
		return [{ estatus : 1 }]
  });
    
  this.helpers({
		creditosPorAutorizar : () => {
			var creditos = Creditos.find({estatus : 1},{ sort : {fechaSolicito : 1 }}).fetch();
			if(creditos){
				rc.clientes_ids = _.pluck(creditos, "cliente_id");
				
				
				_.each(creditos, function(credito){
						credito.cliente = Meteor.users.findOne({_id : credito.cliente_id});
						credito.verificaciones = [];
						
						Meteor.call('getVerificacionesCredito', credito._id, function(error, result) {
						   if(error)
						   {
							    console.log('ERROR :', error);
							    return;
						   }
						   if(result)
						   {	
								 		_.each(result, function(v){
									 			credito.verificaciones.push(v);
								 		});
								 		$scope.$apply();
							 }
						});
						
						if (credito.avales_ids.length > 0 )
						{		
							console.log(credito);	
/*
							Meteor.call('getAvalEncabezado', credito.avales_ids[0], function(error, result) {
							   if(error)
							   {
								    console.log('ERROR :', error);
								    return;
							   }
							   if(result)
							   {	
								   	console.log(result);
									 	credito.aval = result;	
									 	$scope.$apply();
								 }
							});
*/
						}
						
						
				})
			}
						
			return creditos;
			
		},
		
		
	});
	
/*
	this.tieneFoto = function(sexo, foto){
	  if(foto === undefined){
		  if(sexo === "Masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
			  
	  }else{
		  return foto;
	  }
  };
*/
  
  this.autorizar = function(credito_id){
	  Creditos.update({_id : credito_id}, { $set : {estatus : 2}});
	  toastr.success("Ha autorizado el crédito.")
  }
  
  this.rechazar = function(motivo){
	  
	  Creditos.update({_id : this.creditoRechazar}, { $set : {motivo: motivo, estatus : 3}});
	  toastr.error("Se ha rechazado el crédito.")
	  
	  this.motivo = "";
	  this.creditoRechazar = "";
	  $('#modalRechazo').modal('hide');
	  
  }
  
  
  this.mostrarRechazoCredito = function(credito_id){
	  
	  this.creditoRechazar = credito_id;
		$("#modalRechazo").modal();
		
		
	};
  
  
};