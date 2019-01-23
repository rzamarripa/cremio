angular
  .module('creditoMio')
  .controller('SucursalesCtrl', SucursalesCtrl);
 
function SucursalesCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	let rc = $reactive(this).attach($scope);
	this.parametros = $stateParams;
	rc.action = true;  
  rc.nuevo = true;
	
	
	this.subscribe('sucursales', function(){
		return [{}]
	});

	
  this.helpers({
	  sucursales : () => {
		  return Sucursales.find();
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
		
		objeto_id = Sucursales.insert(this.objeto);
		
		$('.collapse').collapse('hide');
		
		
	};
	
	this.editar = function(id)
	{
			this.objeto = Sucursales.findOne({_id:id});
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
					  
			var idTemp = objeto._id;
			delete objeto._id;		
			Sucursales.update({_id:idTemp},{$set:objeto});
			
			toastr.success('Actualizado correctamente.');			
			$('.collapse').collapse('hide');

			this.nuevo = true;
			
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Sucursales.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Secciones.update({_id:id}, {$set : {estatus : objeto.estatus}});	
	};
		
}