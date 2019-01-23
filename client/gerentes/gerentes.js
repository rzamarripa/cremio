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
    rc.cambiarContrasena = false;
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
		
		objeto.profile.foto = rc.pic;
		objeto.profile.estatus = true;
		objeto.profile.usuarioInserto = Meteor.userId();
		//objeto.profile.sucursal_id = Meteor.user().profile.sucursal_id;
		objeto.profile.fechaCreacion = new Date();
		var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
		var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
		var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
		objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		//console.log(objeto.profile.nombreCompleto);
		Meteor.call('createUsuario', objeto, "Gerente");
		toastr.success('Guardado correctamente.');
		this.usuario = {};
		$('.collapse').collapse('hide');
		this.nuevo = true;
		
		rc.cambiarContrasena = true;		
				
	};
	
	this.editar = function(id)
	{
			this.objeto = Meteor.users.findOne({_id:id});
			this.objeto.confirmarpassword = "sinpassword";	
			this.objeto.password 					= "sinpassword"; 
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
		  
		  var nombre = objeto.profile.nombre != undefined ? objeto.profile.nombre + " " : "";
			var apPaterno = objeto.profile.apellidoPaterno != undefined ? objeto.profile.apellidoPaterno + " " : "";
			var apMaterno = objeto.profile.apellidoMaterno != undefined ? objeto.profile.apellidoMaterno : "";
			objeto.profile.nombreCompleto = nombre + apPaterno + apMaterno;

			delete objeto.profile.repeatPassword;
			Meteor.call('updateUsuario', objeto,null, "Gerente", this.cambiarContrasena);
			toastr.success('Actualizado correctamente.');
			
			$('.collapse').collapse('hide');
			
			this.cambiarContrasena = true;
			
			
			this.nuevo = true;
			
		
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