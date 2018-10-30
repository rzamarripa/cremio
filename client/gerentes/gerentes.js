angular
  .module('creditoMio')
  .controller('GerentesCtrl', GerentesCtrl);
 
function GerentesCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	let rc = $reactive(this).attach($scope);
	this.parametros = $stateParams;
	rc.action = true;  
  rc.nuevo = true;
	
	this.cambiarContrasena = true;
	
	this.subscribe('sucursales', function(){
		return [{}]
	});
	
	this.subscribe('clientes',()=>{
		return [{ roles : ["Gerente"] }]
	});

	
  this.helpers({
	  sucursales : () => {
		  return Sucursales.find();
	  },
	  arreglo : () => {
		  return Meteor.users.find({roles : ["Gerente"]});
	  },
  });
 
	
  this.Nuevo = function()
  {
    this.action = true;
    rc.nuevo = !rc.nuevo;
    this.objeto = {}; 
  };
  
  this.guardar = function(objeto,form)
	{
		if(form.$invalid)
		{
	      toastr.error('Error al guardar los datos.');
	      return;
		}
		
		if (objeto.password != objeto.confirmarpassword)
		{
	      toastr.error('Las contraseñas no coinciden.');
	      return;
		}
		
		objeto.estatus = true;
		objeto.usuarioInserto = Meteor.userId();
		objeto.fechaRegistro = new Date();
		objeto.folioCliente = 0;
		objeto.folioDistribuidor= 0;
		objeto.folioPago = 0;
		objeto.folioCredito = 0; //Folio de Credito
		
		objeto_id = Sucursales.insert(this.objeto,
																						 function(error,result)
																						 {
																									if (error)
																									{
																											console.log("Error:",error);
																											return;		
																									}
																									if (result)
																									{
																											var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
																											var apPaterno = objeto.apPaterno != undefined ? objeto.apPaterno + " " : "";
																											var apMaterno = objeto.apMaterno != undefined ? objeto.apMaterno : ""
																											objeto.nombreCompleto = nombre + apPaterno + apMaterno;
																											var usuario = {
																												username : objeto.username,
																												password : objeto.password,
																												profile : {
																													nombre : objeto.nombre,
																													apPaterno : objeto.apPaterno,
																													apMaterno : objeto.apMaterno,
																													nombreCompleto : nombre + apPaterno + apMaterno,
																													sucursal_id : result,
																													estatus : true,
																													sexo : objeto.sexo,
																													passwordDesbloqueo : objeto.profile.passwordDesbloqueo
																												}
																											}
																											
																											delete objeto.password;
																									
																											Meteor.call('createGerenteSucursal', usuario, 'Gerente');
																											toastr.success('Guardado correctamente.');
																											this.objeto = {};
																											$('.collapse').collapse('hide');
																											rc.nuevo = true;
																											form.$setPristine();
																									    form.$setUntouched();	
																									}
																							}
																	);									
		
	};
	
	this.editar = function(id)
	{
			this.objeto = Meteor.users.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    rc.nuevo = false;
		
	};
	
	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
	      toastr.error('Error al actualizar los datos.');
	      return;
		  }
			
			console.log(this.objeto);
			console.log(objeto);
		  
			var idTemp = objeto._id;
			delete objeto._id;		
			Sucursales.update({_id:idTemp},{$set:objeto},
																									function(error,result)
																								  {
																											if (error)
																											{
																													console.log("Error:",error);
																													return;		
																											}
																											if (result)
																											{
																												
																												  var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
																													var apPaterno = objeto.apPaterno != undefined ? objeto.apPaterno + " " : "";
																													var apMaterno = objeto.apMaterno != undefined ? objeto.apMaterno : ""
																													objeto.nombreCompleto = nombre + apPaterno + apMaterno;

																													var usuario = {
																														username : objeto.username,
																														password : objeto.password,
																														profile : {
																															nombre : objeto.nombre,
																															apPaterno : objeto.apPaterno,
																															apMaterno : objeto.apMaterno,
																															nombreCompleto : nombre + apPaterno + apMaterno,
																															sucursal_id : idTemp,
																															estatus : true,
																															sexo : objeto.sexo,
																															passwordDesbloqueo : objeto.profile.passwordDesbloqueo
																															//folioDistribuidor : objeto.folioDistribuidor
																														}
																													}
																																																										
																													Meteor.call('updateGerenteSucursal', usuario, 'Gerente');
																													toastr.success('Actualizado correctamente.');
																													$('.collapse').collapse('hide');
																													rc.nuevo = true;
																													form.$setPristine();
																											    form.$setUntouched();
																											}
																								}			
			);
		
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Meteor.users.findOne({_id:id});
			
			if(objeto.profile.estatus == true)
				objeto.profile.estatus = false;
			else
				objeto.profile.estatus = true;
			
			Meteor.call('cambiaEstatusUsuario', id, objeto.profile.estatus, function(error, response) {
	
				   if(error)
				   {
				    console.log('ERROR :', error);
				    return;
				   }
			});		
	};
	
	this.getSucursal = function(id)
	{
			objeto = Sucursales.findOne({_id:id});	    
	    return objeto.nombreSucursal
	};
	
	this.cambiarPassword = function()
  {
      this.cambiarContrasena = !this.cambiarContrasena; 
  }
		
}