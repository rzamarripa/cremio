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
	rc.creditos = [];

	
	this.subscribe('creditos',()=>{
			return [{requiereVerificacion : true , estatus: 0}]
	},{
		onReady:()=>{
			
		  rc.creditos = Creditos.find().fetch();
		  if (rc.creditos != undefined)
		  {
			  _.each(rc.creditos, function(credito){
	
							var cliente = {};

							Meteor.apply('getUsuario', [credito.cliente_id], function(error, result) {
							   if(error)
							   {
								    console.log('ERROR :', error);
								    return;
							   }
							   if(result)
							   {	
							   //	console.log(result)
									 		cliente = result;
											credito.nombreCliente = cliente.nombreCompleto;
											$scope.$apply();

								 }
							});
							
							Meteor.apply('getVerificacionesCredito', [credito._id], function(error, result) {
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
									 		//$scope.$apply();
								 }
							});

							
					})
		  }
		},
	});


	 this.helpers({
	 		inicio:()=>{
		    var fecha = new Date();
            hora = fecha.getHours()+':'+fecha.getMinutes()
            usuario = Meteor.user().profile.sucursal_id

            console.log(hora,"hora")
            console.log(usuario,"id")

             Meteor.call('getSucursal',usuario, function(error, result){           					
					if (result)
					{
						console.log("result",result)
					    rc.sucursalVer = result
					}
					//console.log("avales",rc.avalesCliente)
					var entrada = rc.sucursalVer.horaEntrada
					var salida = rc.sucursalVer.horaSalida
             // console.log(entrada,"entrada") 
             var horaEntrada = entrada.getHours()+':'+entrada.getMinutes()
             var horaSalida = salida.getHours()+':'+salida.getMinutes()
             console.log(horaEntrada,"entrada","y",horaSalida,"salida")
             
             if (hora >= horaSalida) {
             	$state.go('anon.logout');
             	toastr.error("No puedes ingresar en este horario");
             }
             if (horaEntrada < hora) {
             	$state.go('anon.logout');
             	toastr.error("No puedes ingresar en este horario");
             }
         

			});

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