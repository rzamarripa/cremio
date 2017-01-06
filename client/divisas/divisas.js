angular.module("creditoMio")
.controller("DivisasCtrl", DivisasCtrl);
 function DivisasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	$reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  
	this.subscribe('divisas',()=>{
		return [{
			
		}]
	 });
	 
	this.helpers({
	  divisas : () => {
		  return Divisas.find();
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
			Divisas.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = Divisas.findOne({_id:id});
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
			Divisas.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Divisas.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Divisas.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};