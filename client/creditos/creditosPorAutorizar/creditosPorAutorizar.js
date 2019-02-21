angular.module("creditoMio")
.controller("CreditosPorAutorizarCtrl", CreditosPorAutorizarCtrl);
 function CreditosPorAutorizarCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
	this.clientes_ids = [];
	this.verificaciones_ids = [];
	this.creditoRechazar = "";
	this.motivo = "";
	this.tipo = "";
	
	this.creditosPorAutorizar = [];
	
  rc.valoracion = "";
  
  this.subscribe('clientes', () => {
		return [{ "profile.sucursal_id" :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
							_id : { $in : this.getReactively("clientes_ids")}}];
	})
	
	this.subscribe('distribuidores', () => {
		return [{ "profile.sucursal_id" :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
							"profile.estaVerificado" : true, "profile.estatusCredito": 0}];
	})
  
  this.subscribe('creditos', () => {
		return [{ sucursal_id :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
							estatus : 1 }]
  });
    
  this.helpers({
		creditosPorAutorizar : () => {
			
			var cpu = [] ;
			
			var creditos = Creditos.find({estatus : 1, tipo : {$in :["creditoP",undefined]}},{ sort : {fechaSolicito : 1 }}).fetch();
			if(creditos){
				
				rc.clientes_ids = _.pluck(creditos, "cliente_id");
				
				_.each(creditos, function(credito){
					
						var autorizar = {};
						autorizar.verificaciones = [];
						
						credito.cliente = Meteor.users.findOne({_id : credito.cliente_id});
						credito.verificaciones = [];
						
					 	autorizar._id 								= credito.cliente_id;
					 	autorizar.credito_id					= credito._id;
					 	autorizar.cliente							= credito.cliente;
					 	autorizar.capitalSolicitado 	= credito.capitalSolicitado;
					 	autorizar.fechaSolicito 			= credito.fechaSolicito;
					 	autorizar.verificacionEstatus = credito.verificacionEstatus;
					 	autorizar.avales_ids 					= credito.avales_ids;
					 	autorizar.indicacion 					= credito.indicacion;
					 	autorizar.tipo								= "Crédito Personal";
					 	
						
						Meteor.call('getVerificacionesCredito', credito._id, function(error, result) {
						   if(error)
						   {
							    console.log('ERROR :', error);
							    return;
						   }
						   if(result)
						   {	
							 		_.each(result, function(v){
								 			//credito.verificaciones.push(v);
								 			autorizar.verificaciones.push(v);
								 			$scope.$apply();
							 		});
							 }
						});
						
						cpu.push(autorizar);
													 		
						
				})
			}
			
			
			
			var distribuidores = Meteor.users.find({roles: ["Distribuidor"]}).fetch();
			if (distribuidores)
			{
				//console.log(distribuidores)	;
				_.each(distribuidores, function(distribuidor){
						var autorizar = {};
						autorizar.verificaciones = [];
						
						autorizar._id 								= distribuidor._id;
					 	autorizar.cliente							= distribuidor;
					 	autorizar.capitalSolicitado 	= distribuidor.profile.limiteCredito;
					 	autorizar.fechaSolicito 			= distribuidor.createdAt;
					 	autorizar.verificacionEstatus = distribuidor.profile.verificacionEstatus;
					 	autorizar.avales_ids 					= distribuidor.profile.avales_ids;
					 	autorizar.indicacion 					= distribuidor.profile.indicacion;
					 	autorizar.tipo								= "Distribuidor"
						//console.log(autorizar.avales_ids)
						Meteor.call('getVerificacionesDistribuidor', distribuidor._id, function(error, result) {
						   if(error)
						   {
							    console.log('ERROR :', error);
							    return;
						   }
						   if(result)
						   {	
							 		_.each(result, function(v){
								 			autorizar.verificaciones.push(v);
								 			$scope.$apply();
							 		});
							 }
						});
						
						cpu.push(autorizar);
						
				
				});
					
			}
						
			return cpu;
			
		},
	});
	
  
  this.autorizar = function(id, tipo){

	  if (tipo == "Crédito Personal")	
	  		Creditos.update({_id : id}, { $set : {estatus : 2}});
	  		
	  else
		{
				
				var dis = Meteor.users.findOne(id);
				
				if (_.isEmpty(dis.profile.avales_ids))    
	      {
	          toastr.warning("Se debe agregar el Aval antes de autorizarlo.");
	          return;
	      }
				
				Meteor.call('autorizaoRechazaDistribuidor', id, 1, "", function(error, result) {
						   if(error)
						   {
							    console.log('ERROR :', error);
							    return;
						   }
				});
		}		
	  toastr.success("Se autorizó correctamente.")
  }
  
  this.rechazar = function(motivo, form){
	  
	  if(form.$invalid){
		        toastr.error('Error al cancelar.');
		        return;
		  }
	  
	  
	  if (this.tipo == "Crédito Personal")
	  		Creditos.update({_id : this.creditoRechazar}, { $set : {motivo: motivo, estatus : 3}});
	  else
	  {
		  	Meteor.call('autorizaoRechazaDistribuidor', this.creditoRechazar, 2, motivo , function(error, result) {
						   if(error)
						   {
							    console.log('ERROR :', error);
							    return;
						   }
				});
		  	
	  }
	  		
	  toastr.error("Se ha rechazado la solicitud.")
	  
	  this.motivo = "";
	  this.creditoRechazar = "";
	  this.tipo = "";
	  $('#modalRechazo').modal('hide');
	  
  }
  
  
  this.mostrarRechazoCredito = function(id, tipo){
	  
	  this.creditoRechazar = id;
	  this.tipo = tipo;
		$("#modalRechazo").modal();
		
		
	};
  
  this.verValoracion = function(valoracion){
			
			rc.valoracion = valoracion;
			$('#modalValoracion').modal();

  }
  
  
};