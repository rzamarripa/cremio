angular
.module("creditoMio")
.controller("panelVerificadorCtrl", panelVerificadorCtrl);
function panelVerificadorCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	
	window = rc;
	
	rc.fechaInicial = new Date();
  rc.fechaInicial.setHours(0,0,0,0);

/*
  rc.fechaFinal = new Date(rc.getReactively("fechaInicial"));
  rc.fechaFinal.setHours(23,0,0,0);	
*/
	
	rc.creditoSeleccionado = "";
	rc.objeto = {};
	rc.objeto.evaluacion = "";
	rc.objeto.indicacion = "";

	rc.conVecino = 0;
	rc.conSolicitanteAval = 0;
	rc.creditos = [];

	
	this.subscribe('creditos',()=>{
			return [{sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", 
						  requiereVerificacion : true , 
						  estatus: 0}]
	},{
		onReady:()=>{
			
/*
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
<<<<<<< HEAD
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
=======
*/
		}	
	});
	
	
	
	this.subscribe('verificaciones',()=>{
		  var FI = new Date(rc.getReactively("fechaInicial"));
		  FI.setHours(23,0,0,0);	
			
			return [{ sucursal_id				: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
								usuarioVerifico 	: Meteor.user() != undefined ? Meteor.userId():"", 
								fechaVerificacion : { $gte : rc.getReactively("fechaInicial"), $lte : FI}}]
	});
	
	this.helpers({
		creditos : () => {
			rc.creditos = Creditos.find({},{ sort : {fechaSolicito : 1 }}).fetch();
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
									 		cliente = result;
											credito.nombreCliente = cliente.nombreCompleto;
											$scope.$apply();
								 }
							});							
							/*
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
										 			//rc.verificacionesHechas.push(v);
									 		});
									 		//$scope.$apply();
								 }
							});
*/
					})
		  }
			return rc.creditos;			 
		}, 	
		verificacionesHechas :() =>{
			var ver = Verificaciones.find({}).fetch();
			
			_.each(ver, function(v){
					Meteor.apply('getUsuario', [v.cliente_id], function(error, result) {
					   if(error)
					   {
						    console.log('ERROR :', error);
						    return;
					   }
					   if(result)
					   {	
							 		cliente = result;
									v.nombreCliente = cliente.nombreCompleto;
									$scope.$apply();
						 }
					});
				
			});
			
			return ver;
		},
	});	 
					  
  this.mostrarEvaluacion = function(credito_id)
	{	
			rc.objeto.indicacion = "";
			rc.objeto.evaluacion = "";
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
			var credito = Creditos.findOne(rc.creditoSeleccionado);
			var numeroVerificaciones = 0;
			if (credito.avales_ids.length == 0)
				 numeroVerificaciones = 1;
			else		 
				numeroVerificaciones = 2;
			
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

						 		if (rc.conVecino == 0 && rc.conSolicitanteAval == 0)
								{
										toastr.warning('No se ha hecho ninguna verificación');	
										return;	
								}
								else if (rc.conVecino >= numeroVerificaciones && rc.conSolicitanteAval >= numeroVerificaciones)
								{
										Creditos.update({_id:rc.creditoSeleccionado}, {$set: {estatus: 1, verificacionEstatus: objeto.evaluacion, indicacion: objeto.indicacion}});
								}
								else
								{
									 	toastr.warning('El crédito no tiene las suficientes verificaciones para finalizar la verficación');	
										return;	
								}
						 		
					 }
			});		 	
			
			$("#modalEvaluarVerificacion").modal('hide');
			
			
	};
  
   
};