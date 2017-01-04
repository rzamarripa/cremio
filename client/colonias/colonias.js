angular.module("creditoMio")
.controller("ColoniasCtrl", ColoniasCtrl);
 function ColoniasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  
	this.subscribe('colonias',()=>{
		return [{
			
		}]
	 });
	this.subscribe('ciudades',()=>{
		return [{
			
		}]
	 });
	 
	this.helpers({
	  colonias : () => {
		  return Colonias.find();
	  },
		ciudades : () => {
		 var ciudades = Ciudades.find().fetch();
		  	if (ciudades) {
		  		_.each(rc.colonias, function(colonia){
		  			colonia.ciudad = Ciudades.findOne(colonia.ciudad_id)
		  	});
	  	}
	  	console.log(ciudades);
		  return ciudades;
	  }
  });
  
  this.Nuevo = function()
  {
    this.action = true;
    this.nuevo = false;
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
			Colonias.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = Colonias.findOne({_id:id});
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
			Colonias.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Colonias.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Colonias.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};