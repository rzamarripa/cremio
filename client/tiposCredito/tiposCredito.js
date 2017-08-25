angular.module("creditoMio")
.controller("TiposCreditoCtrl", TiposCreditoCtrl);
 function TiposCreditoCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	$reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  
	this.subscribe('tiposCredito',()=>{
		return [{
			//sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""
			
		}]
	 });
	 
	this.helpers({
	  tiposCredito : () => {
		  return TiposCredito.find();
	  }
  }); 
  
  this.Nuevo = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.objeto = {};		
  };

  this.guardar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			console.log(objeto);
			objeto.estatus = true;
			objeto.usuarioInserto = Meteor.userId();
			objeto.sucursal_id = Meteor.user().profile.sucursal_id;
			objeto.fechaCreacion = new Date();
			objeto.usuarioInserto_id = Meteor.userId();
			TiposCredito.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = TiposCredito.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
        toastr.error('Error al actualizar los datos.');
        return;
		  }
			var idTemp = objeto._id;
			delete objeto._id;		
			objeto.usuarioActualizo = Meteor.userId(); 
			objeto.sucursal_id = Meteor.user().profile.sucursal_id;
			objeto.fechaCreacion = new Date();
			objeto.usuarioInserto_id = Meteor.userId();
			TiposCredito.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = TiposCredito.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			TiposCredito.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};