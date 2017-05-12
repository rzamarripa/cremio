angular.module("creditoMio")
.controller("MunicipiosCtrl", MunicipiosCtrl);
 function MunicipiosCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {};
  this.buscar = {};
  window.rc = rc;
  
	this.subscribe('municipios',()=>{
		return [{pais_id: this.getReactively('buscar.pais_id')? this.getReactively('buscar.pais_id'):""
						,estado_id: this.getReactively('buscar.estado_id')? this.getReactively('buscar.estado_id'):""
					 }]
	});
	
	this.subscribe('estados',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('paises',()=>{
		return [{estatus: true}]
	});
	 
	this.helpers({
	  municipios : () => {
		  return Municipios.find({pais_id: this.getReactively('buscar.pais_id'),
			  											estado_id: this.getReactively('buscar.estado_id')});
	  },
		paises : () => {
		  return Paises.find();
	  },
	  estadosBuscar : () => {
		  return Estados.find({pais_id: this.getReactively('buscar.pais_id')? this.getReactively('buscar.pais_id'):""});
	  },
	  estados : () => {
		  return Estados.find({pais_id: this.getReactively('buscar.pais_id')});
	  },
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
			objeto.estatus = true;
			objeto.usuarioInserto = Meteor.userId();
			Municipios.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	
	};

	this.editar = function(id)
	{
	    this.objeto = Municipios.findOne({_id:id});
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
			Municipios.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Municipios.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Municipios.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};