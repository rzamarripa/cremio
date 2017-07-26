angular
.module("creditoMio")
.controller("panelVerificadorCtrl", panelVerificadorCtrl);
function panelVerificadorCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	
	window = rc;
	
	rc.creditoSeleccionado = "";
	rc.objeto = {};
	rc.objeto.evaluacion = "";
	rc.objeto.indicacion = "";
	rc.verificacionesHechas = [];
	rc.conVecino = 0;
	rc.conSolicitanteAval = 0;
	
  
	this.subscribe('creditos',()=>{
			return [{requiereVerificacion : true , estatus: 0}]
	});
					
  this.helpers({
	  creditos : () => {
		  var cre = Creditos.find().fetch();
		  if (cre != undefined)
		  {
			  _.each(cre, function(credito){
	
							var cliente = {};
							Meteor.call('getUsuario', credito.cliente_id, function(error, result) {
							   if(error)
							   {
								    console.log('ERROR :', error);
								    return;
							   }
							   if(result)
							   {	
									 		cliente = result;
											credito.nombreCliente = cliente.nombreCompleto;
											$scope.$apply();
								 }
							});
							
							Meteor.call('getVerificacionesCredito', credito._id, function(error, result) {
							   if(error)
							   {
								    console.log('ERROR :', error);
								    return;
							   }
							   if(result)
							   {	
									 		_.each(result, function(v){
										 			v.nombreCliente = credito.nombreCliente;
										 			rc.verificacionesHechas.push(v);
									 		});
									 		$scope.$apply();
								 }
							});
					})
		  }
		  return cre;
	  },

  });
  
  this.mostrarEvaluacion = function(credito_id)
	{
			rc.creditoSeleccionado = credito_id;
			$("#modalEvaluarVerificacion").modal('show');	
	}	
  
  this.finalizarVerificacion = function(objeto)
	{
			
			if (objeto == undefined)
					return;	
			if (objeto.evaluacion == undefined || objeto.indicacion == undefined)
					return;		
			if (objeto.evaluacion == "" || objeto.indicacion == "")
			{
					toastr.error('faltan datos por llenar.');	
					return;	
			}
			//Validar que el credito tengo las dos verifiaciones antes de guardar la verificación
			
			rc.conVecino = 0;
			rc.conSolicitanteAval = 0;
			Meteor.call('getVerificacionesCredito', rc.creditoSeleccionado, function(error, result) {
				   if(error)
				   {
					    console.log('ERROR :', error);
					    return;
				   }
				   if(result)
				   {	
						 		_.each(result, function(v){

							 			if (v.tipoVerificacion == "vecino")
							 			{
							 					rc.conVecino +=  1;
							 			}		
							 			if (v.tipoVerificacion == "solicitante o aval")
							 			{
							 					rc.conSolicitanteAval += 1;		
							 			}
						 		});

						 		if (rc.conVecino == 0 || rc.conSolicitanteAval == 0)
								{
										toastr.warning('El crédito no tiene las suficientes verificaciones para finalizar la verficación');	
										return;	
								}
								else
								{
									 
									 Creditos.update({_id:rc.creditoSeleccionado}, {$set: {estatus: 1, verificacionEstatus: objeto.evaluacion, indicacion: objeto.indicacion}});
									 rc.verificacionesHechas = _.reject(rc.verificacionesHechas, function(d){ return d.credito_id === rc.creditoSeleccionado; });
									 
								}
						 		
					 }
			});		 	
			
			$("#modalEvaluarVerificacion").modal('hide');
			
			
	};
  
  
  
  
};