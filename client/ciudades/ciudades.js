angular.module("creditoMio")
.controller("CiudadesCtrl", CiudadesCtrl);
 function CiudadesCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  
	this.subscribe('ciudades',()=>{
		return [{

		}]
	 });
	this.subscribe('estados',()=>{
		return [{

		}]
	 });
	 
	this.helpers({
	  ciudades : () => {
		  return Ciudades.find();
	  },
		estados : () => {
		 var estados = Estados.find().fetch();
		  	if (estados) {
		  		_.each(rc.ciudades, function(ciudad){
		  			ciudad.estado = Estados.findOne(ciudad.estado_id)
		  	});
	  	}
	  	console.log(estados);
		  return estados;
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
			Ciudades.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = Ciudades.findOne({_id:id});
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
			Ciudades.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Ciudades.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Ciudades.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};